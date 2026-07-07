import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleError } from '@/lib/errors';
import { z } from 'zod';

const choiceSchema = z.object({
  readingId: z.string().uuid(),
  choiceId: z.enum(['A', 'B', 'C']),
});

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
