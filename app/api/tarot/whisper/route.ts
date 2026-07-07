import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleError } from '@/lib/errors';
import { generateWhisperCommentaryWithGemini } from '@/lib/gemini';
import { isRateLimited } from '@/lib/redis';
import { CLAN_NAMES_VI } from '@/lib/tarot';
import { z } from 'zod';

const postWhisperSchema = z.object({
  content: z.string().min(5, 'Thông điệp phải có ít nhất 5 ký tự').max(500, 'Thông điệp không được vượt quá 500 ký tự'),
});

interface WhisperRaw {
  id: string;
  userId: string;
  content: string;
  clan: string;
  createdAt: Date;
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
    const data = postWhisperSchema.parse(body);

    const newWhisper = await prisma.whisper.create({
      data: {
        userId,
        content: data.content,
        clan: user.clan,
      },
    });

    return NextResponse.json({
      success: true,
      whisper: newWhisper,
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized. User context missing.' }, { status: 401 });
    }

    // Rate limit: 1 request / 5 seconds / userId
    const isLimited = await isRateLimited(userId, 'tarot-whisper', 5);
    if (isLimited) {
      return NextResponse.json(
        { error: 'Sương mù chưa kịp tan, lữ khách hãy chờ thêm giây lát...' },
        { status: 429 }
      );
    }

    // Get a random whisper that does not belong to the current user (if possible)
    let randomWhisper = await prisma.$queryRaw<WhisperRaw[]>`
      SELECT * FROM "Whisper" 
      WHERE "userId" != ${userId} 
      ORDER BY RANDOM() 
      LIMIT 1
    `;

    // Fallback if no other user whispers found
    if (!randomWhisper || randomWhisper.length === 0) {
      randomWhisper = await prisma.$queryRaw<WhisperRaw[]>`
        SELECT * FROM "Whisper" 
        ORDER BY RANDOM() 
        LIMIT 1
      `;
    }

    if (!randomWhisper || randomWhisper.length === 0) {
      // Default initial whispers if DB is completely empty
      const defaultWhispers = [
        {
          id: 'default-1',
          content: 'Liệu ta có tìm thấy một tri kỷ giữa cõi đời vô thường huyên náo này?',
          clan: 'ThuyNguyet',
        },
        {
          id: 'default-2',
          content: 'Đôi khi buông bỏ một sợi xích lại là hành động dứt khoát dũng cảm nhất.',
          clan: 'PhongKiem',
        },
        {
          id: 'default-3',
          content: 'Ngọn lửa nhiệt huyết trong ta sắp lụi tàn vì sự thờ ơ của đối phương...',
          clan: 'DiemHoa',
        }
      ];
      const selected = defaultWhispers[Math.floor(Math.random() * defaultWhispers.length)];
      
      let commentary = '';
      if (selected.clan === 'ThuyNguyet') {
        commentary = 'Một người bạn của tộc Thuỷ Nguyệt đang tìm kiếm sự đồng điệu giữa lòng nước lạnh giá, lữ khách ạ.';
      } else if (selected.clan === 'PhongKiem') {
        commentary = 'Lưỡi kiếm lý trí đôi khi lại làm đau chính hành giả tộc Phong Kiếm khi họ chọn cách tự giải thoát.';
      } else {
        commentary = 'Ngọn lửa tàn tro của tộc Diễm Hoả luôn chứa đựng nỗi đau đớn khi phải cháy hết mình vô ích.';
      }

      return NextResponse.json({
        success: true,
        whisper: selected,
        commentary,
      });
    }

    const whisper = randomWhisper[0];

    // Generate Vọng's commentary using Gemini
    let commentary = '';
    try {
      commentary = await generateWhisperCommentaryWithGemini(whisper.content, whisper.clan);
    } catch (aiError) {
      console.warn('⚠️ Gemini Whisper Commentary failed or key is missing. Using fallback.', aiError);
      
      const clanNameVi = CLAN_NAMES_VI[whisper.clan] || 'Vô Thường';

      commentary = `Một lữ khách thuộc tộc ${clanNameVi} đã gửi lại tiếng thở dài này vào cõi sương mù, mong ngươi thấu cảm.`;
    }

    return NextResponse.json({
      success: true,
      whisper: {
        id: whisper.id,
        content: whisper.content,
        clan: whisper.clan,
        createdAt: whisper.createdAt,
      },
      commentary,
    });
  } catch (error) {
    return handleError(error);
  }
}
