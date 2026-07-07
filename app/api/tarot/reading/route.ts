import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { drawCards, CLAN_NAMES_VI } from '@/lib/tarot';
import { generateVongCommentaryWithGemini } from '@/lib/gemini';
import { handleError } from '@/lib/errors';
import { z } from 'zod';
import { checkMemoryUnlocks, calculateClanFromReadings, getNarrativeGreeting, FATEFUL_PROMPTS } from '@/lib/narrative';
import { detectCombo } from '@/lib/combos';
import { getElementalRelation, getOrientationRelation, generateFallbackCommentary } from '@/lib/relations';
import { isRateLimited } from '@/lib/redis';

const readingSchema = z.object({
  question: z.string().min(5),
  celestialEvents: z.object({
    isFullMoon: z.boolean().optional(),
    isNewMoon: z.boolean().optional(),
    isMercuryRetrograde: z.boolean().optional(),
  }).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized. User context missing.' }, { status: 401 });
    }

    // Rate limit: 1 request / 5 seconds / userId
    const isLimited = await isRateLimited(userId, 'tarot-reading', 5);
    if (isLimited) {
      return NextResponse.json(
        { error: 'Sương mù chưa kịp tan, lữ khách hãy chờ thêm giây lát...' },
        { status: 429 }
      );
    }

    // Load user profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const data = readingSchema.parse(body);

    // Get historical readings count for length budgeting
    const readingsCount = await prisma.reading.count({
      where: { userId: user.id },
    });

    // Draw 3 unique cards with astronomical event adjustments
    const cardsDrawn = drawCards(3, data.celestialEvents);

    // Format for DB storage
    const cardStrings = cardsDrawn.map(d => `${d.card.id}|${d.isReversed ? 'reversed' : 'upright'}`);

    // Check conditions for memory unlocking (using readingsCount + 1 to reflect this new reading)
    const newlyUnlocked = await checkMemoryUnlocks(user.id, cardStrings, readingsCount + 1);

    // Update user clan if readings count >= 3
    const updatedClan = await calculateClanFromReadings(user.id);
    
    // Merge updated clan into user object in scope, avoiding a redundant database query
    const updatedUser = {
      ...user,
      clan: updatedClan
    };

    // Priority greeting queue (Memory > Celestial > Time of day)
    const greetingObj = await getNarrativeGreeting(
      updatedUser,
      data.celestialEvents || {},
      newlyUnlocked.length > 0 ? newlyUnlocked[0] : null
    );
    const greeting = greetingObj.greeting;

    // Combo Analysis
    const combo = detectCombo(cardsDrawn);
    let relationInfo = null;
    let fallbackCommentary = '';

    if (!combo) {
      // Analyze Element relation between Card 1 (Bản thân) and Card 2 (Đối phương)
      const rName = getElementalRelation(cardsDrawn[0].card.clan, cardsDrawn[1].card.clan);
      const oName = getOrientationRelation(cardsDrawn[0].isReversed, cardsDrawn[1].isReversed);
      fallbackCommentary = generateFallbackCommentary(rName, oName);
      relationInfo = {
        relation: rName,
        orientation: oName,
      };
    }

    // Dynamic generation from Google Gemini AI with rule-based fallback
    let responseCommentary = '';
    let isAiGenerated = false;

    try {
      const aiUserContext = {
        clan: updatedUser.clan,
        erc: updatedUser.erc,
        readingsCount: readingsCount + 1,
      };

      responseCommentary = await generateVongCommentaryWithGemini(
        aiUserContext,
        data.question,
        cardsDrawn,
        combo,
        relationInfo ? { relation: relationInfo.relation, orientation: relationInfo.orientation } : null,
        data.celestialEvents
      );
      isAiGenerated = true;
    } catch (aiError) {
      console.warn('⚠️ Gemini API call failed or key is missing. Falling back to rule-based template.', aiError);
      
      const comboText = combo ? `Combo [${combo.name}]: ${combo.description}` : `Mối liên kết nguyên tố: ${fallbackCommentary}`;
      responseCommentary = `${greeting}\n\n` +
        `[Bản Thân] ${cardsDrawn[0].card.name} (${cardsDrawn[0].isReversed ? 'Ngược' : 'Xuôi'})\n` +
        `[Đối Phương] ${cardsDrawn[1].card.name} (${cardsDrawn[1].isReversed ? 'Ngược' : 'Xuôi'})\n` +
        `[Mối Quan Hệ] ${cardsDrawn[2].card.name} (${cardsDrawn[2].isReversed ? 'Ngược' : 'Xuôi'})\n\n` +
        `Vọng luận giải (Fallback): ${comboText}`;
    }

    // Decide if this is a Fateful Prompt (10% chance or testing query)
    const isFateful = Math.random() < 0.10 || data.question.toLowerCase().includes("fateful") || data.question.toLowerCase().includes("định mệnh");

    let outroQuestion = '';
    let choices = [];
    let fatefulIndex: number | undefined = undefined;

    if (isFateful) {
      const idx = Math.floor(Math.random() * FATEFUL_PROMPTS.length);
      fatefulIndex = idx;
      const selectedFate = FATEFUL_PROMPTS[idx];
      outroQuestion = `[CÂU HỎI ĐỊNH MỆNH]: ${selectedFate.outro}`;
      choices = selectedFate.choices;
    } else {
      // Dynamic Outro Question adjusted by user ERC and Clan (Mục 13.2.1)
      const clanNameVi = CLAN_NAMES_VI[updatedUser.clan] || 'Vô Thường';

      if (updatedUser.erc >= 30) {
        outroQuestion = `Toà tháp đổ rồi, cốc cũng đã xếp lại để rời đi. Người bạn hiền hoà Tộc ${clanNameVi} của ta, ta biết lòng ngươi vẫn còn đau đáu thương nhớ và khó lòng đành đoạn buông tay. Ngươi có sẵn lòng chấp nhận sự sụp đổ này như một sự giải thoát dịu dàng cho cả hai, hay vẫn muốn đứng trong đống đổ nát để chờ đợi một làn khói sương vô định?`;
      } else if (updatedUser.erc <= -30) {
        outroQuestion = `Toà tháp đổ rồi, cốc cũng đã xếp lại để rời đi. Hành giả cô độc Tộc ${clanNameVi} của ta, ngươi vốn đã tự xếp lại cốc từ lâu và chỉ chờ cú sập đổ cuối cùng này để cất bước. Ngươi định sẽ lập tức quay lưng bước đi mà không ngoảnh lại, hay còn điều gì chưa dứt khoát cần cắt bỏ hoàn toàn ngay đêm nay?`;
      } else {
        outroQuestion = `Toà tháp đổ rồi, cốc cũng đã xếp lại để rời đi. Lữ khách Tộc ${clanNameVi}, mọi sự đã hiển hiện rõ trước mắt ngươi rồi. Ngươi có nghĩ sự đổ vỡ này là một kết cục không thể tránh khỏi để bắt đầu hành trình mới, và liệu ngươi đã sẵn sàng tự nâng chén trà sương để cất bước chưa?`;
      }

      choices = [
        {
          id: 'A',
          text: 'Ta mệt rồi, ta muốn bước đi...',
          ercChange: -10,
          reply: 'Một quyết định dũng cảm. Bước đi trong sương mù luôn đáng sợ, nhưng chỉ cần dám bước bước đầu tiên, sương sẽ tự động rẽ lối. Hãy đi đi, ta luôn đứng đây dõi theo ngươi.'
        },
        {
          id: 'B',
          text: 'Ta vẫn muốn đợi thêm một chút, dù biết là khờ dại.',
          ercChange: 10,
          reply: 'Ta không trách ngươi khờ dại. Trái tim con người vốn dĩ không hoạt động bằng lý trí sắc lạnh. Nếu chưa thể buông bỏ, hãy cứ ở lại cho đến khi lòng không còn gì nuối tiếc.'
        },
        {
          id: 'C',
          text: 'Ta cảm thấy rối bời, không biết nên đi hay ở.',
          ercChange: 0,
          reply: 'Đứng giữa ngã rẽ luôn là khoảnh khắc đứng tim nhất. Đừng ép mình phải chọn ngay đêm nay. Hãy để câu chuyện này lắng xuống cùng sương đêm, ngày mai câu trả lời sẽ tự hiện rõ.'
        }
      ];
    }

    // Save reading record to database
    const reading = await prisma.reading.create({
      data: {
        userId: updatedUser.id,
        question: isFateful ? `[ĐỊNH MỆNH] ${data.question}` : data.question,
        cards: cardStrings,
        response: responseCommentary,
        ercChange: 0,
      }
    });

    return NextResponse.json({
      readingId: reading.id,
      greeting,
      cards: cardsDrawn.map(d => ({
        id: d.card.id,
        name: d.card.name,
        englishName: d.card.englishName,
        clan: d.card.clan,
        rank: d.card.rank,
        isReversed: d.isReversed,
        keywords: d.card.keywords,
      })),
      combo,
      elementalRelation: relationInfo,
      commentary: responseCommentary,
      outro: outroQuestion,
      choices,
      isAiGenerated,
      newlyUnlockedMemories: newlyUnlocked,
      fatefulIndex,
    });
  } catch (error) {
    return handleError(error);
  }
}
