import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { drawCards, DrawnCard } from '@/lib/tarot';
import { generateVongCommentaryWithGemini } from '@/lib/gemini';
import { handleError } from '@/lib/errors';
import { z } from 'zod';
import { checkMemoryUnlocks, calculateClanFromReadings, getNarrativeGreeting } from '@/lib/narrative';

const readingSchema = z.object({
  question: z.string().min(5),
  celestialEvents: z.object({
    isFullMoon: z.boolean().optional(),
    isNewMoon: z.boolean().optional(),
    isMercuryRetrograde: z.boolean().optional(),
  }).optional(),
});

// 1. Detect Special Combo
function detectCombo(drawn: DrawnCard[]): { name: string; description: string } | null {
  const ids = drawn.map(d => d.card.id);

  // Tro Tàn Chữa Lành: The Tower + The Star
  if (ids.includes('the-tower') && ids.includes('the-star')) {
    return {
      name: 'Tro Tàn Chữa Lành',
      description: 'Đổ vỡ không phải để huỷ diệt, mà là khoảng trống bắt buộc phải có để ánh sao rọi vào. Sứ Giả Ngọn Lửa Sụp Đổ vừa dọn đi đống đổ nát cũ, thì ngay lập tức Sứ Giả Ánh Sao Hy Vọng đã thắp đèn bước tới.'
    };
  }

  // Sợi Dây Giải Thoát: The Devil + Death
  if (ids.includes('the-devil') && ids.includes('death')) {
    return {
      name: 'Sợi Dây Giải Thoát',
      description: 'Một bên là sợi xích vô hình giữ chân ngươi trong bóng tối, một bên là lưỡi hái sẵn sàng cắt đứt tất cả. Đã đến lúc tự tháo xích bước đi, đừng ngoảnh đầu nhìn lại.'
    };
  }

  // Tiếng Gọi Linh Hồn: The Lovers + 2 of Cups
  if (ids.includes('the-lovers') && ids.includes('two-of-cups')) {
    return {
      name: 'Tiếng Gọi Linh Hồn',
      description: 'Khoảnh khắc hai linh hồn nhận ra nhau giữa vạn người. Đừng để nỗi sợ của lý trí dập tắt sự cộng hưởng hiếm hoi này.'
    };
  }

  // Cơn Bão Lửa: Page of Wands + Knight of Wands
  if (ids.includes('page-of-wands') && ids.includes('knight-of-wands')) {
    return {
      name: 'Cơn Bão Lửa',
      description: 'Năng lượng lửa cực mạnh, nồng nhiệt nhưng bốc đồng và thiếu kiên nhẫn. Hãy cẩn thận kẻo bỏng.'
    };
  }

  // Bức Tường Lý Trí: Queen/King of Swords + 9 of Swords
  if (ids.includes('nine-of-swords') && (ids.includes('queen-of-swords') || ids.includes('king-of-swords'))) {
    return {
      name: 'Bức Tường Lý Trí',
      description: 'Sự tự cô lập, suy nghĩ quá nhiều gây mất ngủ. Gió lạnh của lý trí đang tự giam hãm và làm tổn thương cõi lòng ngươi.'
    };
  }

  // Vườn Xuân Đơm Hoa: The Empress + 10 of Pentacles
  if (ids.includes('the-empress') && ids.includes('ten-of-pentacles')) {
    return {
      name: 'Vườn Xuân Đơm Hoa',
      description: 'Tình cảm cam kết lâu bền, vững chãi đi đến sự bình yên, sum vầy và sung túc gia đạo.'
    };
  }

  return null;
}

// 2. Element Relationship Analysis
function getElementalRelation(clan1: string, clan2: string): 'Tương Sinh' | 'Tương Khắc' | 'Trung Tính' {
  if (clan1 === 'VoThuong' || clan2 === 'VoThuong') return 'Trung Tính';

  const generative = [
    ['ThuyNguyet', 'ThuyNguyet'],
    ['ThoKim', 'ThoKim'],
    ['DiemHoa', 'DiemHoa'],
    ['PhongKiem', 'PhongKiem'],
    ['ThuyNguyet', 'ThoKim'],
    ['ThoKim', 'ThuyNguyet'],
    ['DiemHoa', 'PhongKiem'],
    ['PhongKiem', 'DiemHoa']
  ];

  const conflicting = [
    ['ThuyNguyet', 'DiemHoa'],
    ['DiemHoa', 'ThuyNguyet'],
    ['PhongKiem', 'ThoKim'],
    ['ThoKim', 'PhongKiem'],
    ['ThuyNguyet', 'PhongKiem'],
    ['PhongKiem', 'ThuyNguyet'],
    ['DiemHoa', 'ThoKim'],
    ['ThoKim', 'DiemHoa']
  ];

  const isGen = generative.some(([a, b]) => a === clan1 && b === clan2);
  if (isGen) return 'Tương Sinh';

  const isConf = conflicting.some(([a, b]) => a === clan1 && b === clan2);
  if (isConf) return 'Tương Khắc';

  return 'Trung Tính';
}

function getOrientationRelation(r1: boolean, r2: boolean): 'Xuôi - Xuôi' | 'Hỗn Hợp' | 'Ngược - Ngược' {
  if (!r1 && !r2) return 'Xuôi - Xuôi';
  if (r1 && r2) return 'Ngược - Ngược';
  return 'Hỗn Hợp';
}

// 3. Fallback Commentary
function generateFallbackCommentary(
  relation: string,
  orientation: string
): string {
  if (relation === 'Tương Sinh' && orientation === 'Xuôi - Xuôi') {
    return 'Ta nhìn thấy dòng chảy của hai Sứ Giả này đang hòa vào nhau rất êm đềm — như nước mát tưới tắm cho mảnh đất lành dưới chân ngươi. Mọi sự đang tiến triển tự nhiên và nhận được sự đồng thuận từ cõi lòng đến thực tế. Lữ khách, ngươi có đang cảm thấy mọi sự dần trở nên rõ ràng và vững chãi hơn không?';
  }
  if (relation === 'Tương Khắc' && orientation === 'Xuôi - Xuôi') {
    return 'Một bên là ngọn lửa Diễm Hoả hăm hở lao đi, một bên là làn nước Thuỷ Nguyệt sâu lắng đầy cảm xúc. Hai năng lượng này tuy đẹp nhưng lại đang khắc chế nhau, khiến lòng ngươi vừa muốn bùng cháy vừa muốn dịu lại. Có phải ngươi đang cố ép mình phải đưa ra hành động mạnh mẽ trong khi tim ngươi chỉ muốn lặng im cảm nhận?';
  }
  if (relation === 'Tương Khắc' && orientation === 'Hỗn Hợp') {
    return 'Sự sụp đổ lớn của số mệnh đang va đập vào sự chao đảo trong đời sống thực tế của ngươi. Một bên ngoài mặt đã đổ vỡ, nhưng bên trong ngươi vẫn cố gắng xoay xở giữ thăng bằng một cách kiệt quệ. Đừng cố gồng gánh những mảnh vỡ nữa, lữ khách. Hãy buông tay để đất đá rơi xuống, ngươi mới có chỗ để đứng vững.';
  }
  if (relation === 'Tương Sinh' && orientation === 'Ngược - Ngược') {
    return 'Cả hai chiếc chén đều đang úp ngược, sương mù bao phủ lấy những nỗi đau chưa thể gọi tên. Ngươi đang chìm trong dòng nước tù đọng của quá khứ, vừa muốn bỏ đi lại vừa không đành lòng cất bước. Khi cõi lòng đã kiệt quệ như vậy, trì hoãn không giúp ngươi bớt đau, nó chỉ làm sương đêm thấm lạnh thêm vào da thịt. Ngươi có muốn cho bản thân một cơ hội để thực sự khóc một lần rồi buông không?';
  }
  return 'Sương mù cuộn lên che khuất ngõ tối, các Sứ Giả đang đứng tại ngã rẽ cuộc đời ngươi. Năng lượng giữa họ có sự xung đối nhẹ, đòi hỏi ngươi phải chậm lại và lắng nghe tiếng gọi từ tiềm thức sâu thẳm.';
}

// 4. Time of Day Greetings
function getGreeting(hour: number): string {
  if (hour >= 5 && hour < 8) {
    return 'Ngươi đến sớm thế, lữ khách? Sương mù ngoài cổng vẫn còn đọng nước, lạnh buốt. Những Sứ Giả ban ngày đang chầm chậm thức giấc. Câu hỏi của ngươi vào lúc sớm mai này... liệu có phải là điều đầu tiên ngươi nghĩ đến ngay khi vừa mở mắt?';
  } else if (hour >= 8 && hour < 17) {
    return 'Cổng Cõi Vô Thường vẫn luôn mở giữa những bận rộn của nhân thế. Nói ta nghe, điều gì giữa ban ngày huyên náo lại khiến lòng ngươi chợt lặng đi và tìm đến đây?';
  } else if (hour >= 17 && hour < 20) {
    return 'Ngày đang tàn dần bên cõi của ngươi rồi phải không? Hoàng hôn là lúc ranh giới giữa thực và mộng mỏng nhất. Hãy ngồi xuống đây, uống một chén trà sương, rồi kể ta nghe điều gì đang làm lòng ngươi phân vân.';
  } else {
    return 'Đêm đã sâu... Giờ này nhân gian đã ngủ, chỉ còn những trái tim trăn trở là còn thức. Nói nhỏ thôi lữ khách, các Sứ Giả bóng đêm đã đến rất gần cổng rồi. Câu hỏi lúc nửa đêm luôn là câu hỏi thật lòng nhất của ngươi...';
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized. User context missing.' }, { status: 401 });
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
    
    // Fetch updated user stats (especially for clan and erc) to ensure accurate AI context
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
    }) || { ...user, clan: updatedClan };

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

    // Dynamic Outro Question adjusted by user ERC and Clan (Mục 13.2.1)
    let clanNameVi = 'Vô Thường';
    if (updatedUser.clan === 'DiemHoa') clanNameVi = 'Diễm Hoả';
    else if (updatedUser.clan === 'ThuyNguyet') clanNameVi = 'Thuỷ Nguyệt';
    else if (updatedUser.clan === 'PhongKiem') clanNameVi = 'Phong Kiếm';
    else if (updatedUser.clan === 'ThoKim') clanNameVi = 'Thổ Kim';

    let outroQuestion = '';
    if (updatedUser.erc >= 30) {
      outroQuestion = `Toà tháp đổ rồi, cốc cũng đã xếp lại để rời đi. Người bạn hiền hoà Tộc ${clanNameVi} của ta, ta biết lòng ngươi vẫn còn đau đáu thương nhớ và khó lòng đành đoạn buông tay. Ngươi có sẵn lòng chấp nhận sự sụp đổ này như một sự giải thoát dịu dàng cho cả hai, hay vẫn muốn đứng trong đống đổ nát để chờ đợi một làn khói sương vô định?`;
    } else if (updatedUser.erc <= -30) {
      outroQuestion = `Toà tháp đổ rồi, cốc cũng đã xếp lại để rời đi. Hành giả cô độc Tộc ${clanNameVi} của ta, ngươi vốn đã tự xếp lại cốc từ lâu và chỉ chờ cú sập đổ cuối cùng này để cất bước. Ngươi định sẽ lập tức quay lưng bước đi mà không ngoảnh lại, hay còn điều gì chưa dứt khoát cần cắt bỏ hoàn toàn ngay đêm nay?`;
    } else {
      outroQuestion = `Toà tháp đổ rồi, cốc cũng đã xếp lại để rời đi. Lữ khách Tộc ${clanNameVi}, mọi sự đã hiển hiện rõ trước mắt ngươi rồi. Ngươi có nghĩ sự đổ vỡ này là một kết cục không thể tránh khỏi để bắt đầu hành trình mới, và liệu ngươi đã sẵn sàng tự nâng chén trà sương để cất bước chưa?`;
    }

    // Dialogue choices paths
    const choices = [
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

    // Save reading record to database
    const reading = await prisma.reading.create({
      data: {
        userId: updatedUser.id,
        question: data.question,
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
    });
  } catch (error) {
    return handleError(error);
  }
}
