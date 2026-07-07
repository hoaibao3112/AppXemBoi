import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleError } from '@/lib/errors';
import { z } from 'zod';
import { FATEFUL_PROMPTS } from '@/lib/narrative';
import { isEclipseEvent } from '@/lib/lunar';

const choiceSchema = z.object({
  readingId: z.string().uuid(),
  choiceId: z.enum(['A', 'B', 'C']),
  fatefulIndex: z.number().min(0).max(4).optional(),
});

function adjustReplyWithPersona(baseReply: string, erc: number): string {
  if (erc >= 30) {
    return baseReply + " Hãy cứ tin tưởng vào tiếng nói trong sương, ta sẽ luôn dẫn ngươi về phía ánh sáng.";
  } else if (erc <= -30) {
    return baseReply + " Nhưng đừng mong đợi lòng trắc ẩn từ cõi vô định này. Mọi khế ước đều có cái giá của nó.";
  }
  return baseReply;
}

function glitchText(text: string): string {
  const chars = text.split("");
  const glitchedChars = chars.map((char) => {
    if (char === " " || Math.random() > 0.15) return char;
    const glitchMarks = ["̵", "̶", "̷", "̴", "̙", "̞"];
    return char + glitchMarks[Math.floor(Math.random() * glitchMarks.length)];
  });
  return "H̶ỗ̵n̵ ̸l̶o̶ạ̶n̵ ̶v̶ũ̶ ̵t̶r̶ụ̶: " + glitchedChars.join("");
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized. User context missing.' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const data = choiceSchema.parse(body);

    // Verify reading exists and belongs to the user
    const reading = await prisma.reading.findFirst({
      where: {
        id: data.readingId,
        userId: user.id,
      },
    });

    if (!reading) {
      return NextResponse.json({ error: 'Reading not found' }, { status: 404 });
    }

    // Determine ERC changes
    let ercChange = 0;
    let reply = '';

    const isReadingFateful = reading.question.startsWith("[ĐỊNH MỆNH]");

    if (isReadingFateful && typeof data.fatefulIndex === 'number' && data.fatefulIndex >= 0 && data.fatefulIndex < FATEFUL_PROMPTS.length) {
      const selectedFate = FATEFUL_PROMPTS[data.fatefulIndex];
      const selectedChoice = selectedFate.choices.find(c => c.id === data.choiceId);
      if (selectedChoice) {
        ercChange = selectedChoice.ercChange;
        reply = selectedChoice.reply;
      }
    } else {
      // Default Non-Fateful choice handling
      if (data.choiceId === 'A') {
        ercChange = -10;
        reply = 'Một quyết định dũng cảm. Bước đi trong sương mù luôn đáng sợ, nhưng chỉ cần dám bước bước đầu tiên, sương sẽ tự động rẽ lối. Hãy đi đi, ta luôn đứng đây dõi theo ngươi.';
      } else if (data.choiceId === 'B') {
        ercChange = 10;
        reply = 'Ta không trách ngươi khờ dại. Trái tim con người vốn dĩ không hoạt động bằng lý trí sắc lạnh. Nếu chưa thể buông bỏ, hãy cứ ở lại cho đến khi lòng không còn gì nuối tiếc.';
      } else { // C
        ercChange = 0;
        reply = 'Đứng giữa ngã rẽ luôn là khoảnh khắc đứng tim nhất. Đừng ép mình phải chọn ngay đêm nay. Hãy để câu chuyện này lắng xuống cùng sương đêm, ngày mai câu trả lời sẽ tự hiện rõ.';
      }
    }

    // Apply Eclipse doubling
    const isEclipse = isEclipseEvent();
    if (isEclipse) {
      ercChange = ercChange * 2;
    }

    // Adjust reply with Vọng Persona
    reply = adjustReplyWithPersona(reply, user.erc);

    // Apply Eclipse glitch effect to text
    if (isEclipse) {
      reply = glitchText(reply);
    }

    // Calculate clamped ERC
    const newErc = Math.max(-100, Math.min(100, user.erc + ercChange));

    // Transaction to update user ERC, log change, and save in reading
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { erc: newErc },
      }),
      prisma.eRCLog.create({
        data: {
          userId: user.id,
          changeValue: ercChange,
          reason: `Lựa chọn ${data.choiceId} cho lượt bói ${data.readingId}`,
        },
      }),
      prisma.reading.update({
        where: { id: reading.id },
        data: { ercChange },
      }),
    ]);

    return NextResponse.json({
      success: true,
      choiceId: data.choiceId,
      ercChange,
      newErc,
      reply,
    });
  } catch (error) {
    return handleError(error);
  }
}
