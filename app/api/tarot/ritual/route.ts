import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { drawCards } from '@/lib/tarot';
import { generateDailyWhisperWithGemini } from '@/lib/gemini';
import { handleError } from '@/lib/errors';
import { isRateLimited } from '@/lib/redis';

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized. User context missing.' }, { status: 401 });
    }

    // Rate limit: 1 request / 5 seconds / userId
    const isLimited = await isRateLimited(userId, 'tarot-ritual', 5);
    if (isLimited) {
      return NextResponse.json(
        { error: 'Sương mù chưa kịp tan, lữ khách hãy chờ thêm giây lát...' },
        { status: 429 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Draw exactly 1 random card for the Daily Ritual
    const drawn = drawCards(1);
    const card = drawn[0].card;

    // Generate Vọng's dynamic whisper of the day
    let whisper = '';
    let isAiGenerated = false;

    try {
      whisper = await generateDailyWhisperWithGemini(card.name, card.keywords);
      isAiGenerated = true;
    } catch (aiError) {
      console.warn('⚠️ Gemini Daily Whisper generation failed or key is missing. Using fallback.', aiError);
      
      // Dynamic fallback template matching Section 10.2 or generic keywords
      if (card.id === 'the-hermit') {
        whisper = 'Hôm nay, hãy cho phép mình được im lặng. Câu trả lời ngươi tìm kiếm không nằm ở lời giải thích của người khác, nó nằm ở khoảng lặng trong chính ngươi.';
      } else if (card.id === 'the-fool') {
        whisper = 'Đừng tính toán quá nhiều cho ngày hôm nay. Hãy cứ bước đi với một trái tim nhẹ nhàng nhất. Đôi khi sự khờ dại lại là chiếc khiên bảo vệ ngươi tốt nhất.';
      } else {
        const keywordText = card.keywords.slice(0, 2).join(' và ');
        whisper = `Hôm nay, hãy chiêm nghiệm về năng lượng của Sứ Giả ${card.name}. Mọi quyết định của lữ khách nên được soi rọi bởi sự ${keywordText} để giữ cõi lòng luôn phẳng lặng như mặt nước Thuỷ Nguyệt.`;
      }
    }

    return NextResponse.json({
      success: true,
      card: {
        id: card.id,
        name: card.name,
        englishName: card.englishName,
        clan: card.clan,
        rank: card.rank,
        keywords: card.keywords,
      },
      whisper,
      isAiGenerated,
    });
  } catch (error) {
    return handleError(error);
  }
}
