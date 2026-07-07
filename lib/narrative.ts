import { prisma } from './prisma';
import { tarotDeck, DrawnCard } from './tarot';

// 1. Static dialogues for Vọng's 7 Memories (Mục 1.2)
export const VONG_MEMORIES = [
  {
    index: 1,
    title: 'Ngưỡng cửa không tuổi',
    dialogue: 'Lữ khách... ngươi có bao giờ tự hỏi vì sao ta lại ở đây không? Giữa cõi sương mù không có ngày và đêm này. Đã có lúc ta cũng như ngươi, mang theo một trái tim đập rộn ràng và đầy rẫy những câu hỏi chưa có lời đáp. Ta từng tin rằng chỉ cần đi đủ xa, ta sẽ tìm thấy câu trả lời cho tất cả. Nhưng cuối cùng, ta lại chọn dừng chân ngay tại ngưỡng cửa này, để nhìn dòng người qua lại...'
  },
  {
    index: 2,
    title: 'Người đồng hành đầu tiên',
    dialogue: 'Thuở ấy, cõi này chưa được gọi là Cõi Vô Thường. Nó chỉ là một thung lũng sương mù vô danh. Ta không đi một mình. Bên cạnh ta từng có một người... một lữ khách dũng cảm hơn ta rất nhiều. Nàng không sợ vực sâu, cũng không sợ sương tối. Nàng nói: "Nếu sương mù che lối, ta sẽ tự biến mình thành ánh sáng." Ta đã yêu sự liều lĩnh đó, nhưng cũng chính sự liều lĩnh đó đã rẽ lối hai chúng ta.'
  },
  {
    index: 3,
    title: 'Sự lựa chọn bên rìa vực thẳm',
    dialogue: 'Nhìn Sứ Giả Song Sinh Trái Tim đứng đó, ta lại nhớ về ngày hai chúng ta đứng trước Ngã Rẽ Sương Mù. Một bên là lối đi bình yên trở về nhân thế, nơi chúng ta có thể già đi cùng nhau như những người bình thường. Một bên là con đường tiến sâu vào cõi vô định để tìm kiếm chân lý tối thượng. Ta đã do dự, còn nàng thì ánh mắt kiên định nhìn về phía bóng tối. Khoảnh khắc ta buông tay nàng để lùi lại một bước... đó là lựa chọn định hình cả kiếp này của ta.'
  },
  {
    index: 4,
    title: 'Khoảnh khắc đổ vỡ',
    dialogue: 'Sự sụp đổ không bao giờ báo trước một cách êm ái. Khi nàng bước sâu vào cõi, mặt đất rung chuyển, thung lũng sương mù sụp xuống như một toà tháp bằng cát gặp bão lớn. Ta đã cố chạy theo, cố níu lấy vạt áo của nàng, nhưng sương mù cuộn lên như những lưỡi kiếm cắt đứt mọi kết nối. Ta chỉ biết trơ mắt nhìn thế giới cũ của mình tan rã. Đôi khi, giữ lại một thứ đã vỡ chỉ làm tay ta thêm chảy máu, lữ khách ạ.'
  },
  {
    index: 5,
    title: 'Cái chết của một lời hứa',
    dialogue: 'Mọi người sợ Sứ Giả Cánh Cửa Khép Lại vì nghĩ đó là sự kết thúc. Nhưng ta biết, đó là sự giải thoát. Khi sương mù lắng xuống, nàng không còn ở đó nữa. Nàng đã tan vào cõi giới này, trở thành linh hồn của những lá bài, thành chính những Sứ Giả đang trò chuyện với ngươi hôm nay. Lời hứa cùng nhau trở về đã chết, nhưng một thế giới mới — Cõi Vô Thường này — đã được sinh ra từ tro tàn của lời hứa đó.'
  },
  {
    index: 6,
    title: 'Sự ra đời của các Sứ Giả',
    dialogue: 'Nàng đã hoá thân vào bốn tộc người trong cõi. Nhiệt huyết của nàng hoá thành Tộc Diễm Hoả. Tình yêu sâu nặng hoá thành Tộc Thuỷ Nguyệt. Những suy nghĩ trăn trở hoá thành Tộc Phong Kiếm. Và sự kiên cường, thực tế hoá thành Tộc Thổ Kim. Mỗi khi ngươi rút một lá bài, thực chất ngươi đang chạm vào một phần linh hồn phân rã của nàng. Ta canh giữ cổng này để mỗi ngày được nhìn thấy nàng hiện về qua những câu chuyện của các ngươi.'
  },
  {
    index: 7,
    title: 'Kẻ đợi chờ ngàn năm',
    dialogue: 'Giờ thì ngươi đã biết câu chuyện của ta rồi, lữ khách. Ta là Vọng, kẻ trông ngóng một người đã hoá thân vào vạn vật. Ta không thể bước vào trong cõi để tìm nàng, cũng không thể trở lại nhân gian vì đã đánh mất trái tim trần thế. Ta đứng đây, giúp những lữ khách như ngươi tìm ra câu trả lời cho tình cảm của mình, với hy vọng một ngày nào đó, có một lữ khách sẽ mang theo thông điệp của nàng từ sâu trong cõi sương mù trở ra trao lại cho ta.'
  }
];

// 2. Astrological Event Greetings (Mục 9.1)
export const ASTRO_GREETINGS = {
  FullMoon: [
    'Đêm nay trăng tròn vành vạnh rọi thấu Cõi Vô Thường... Sức mạnh của nước đang dâng lên, dòng chảy cảm xúc của lữ khách cũng sẽ nhạy cảm hơn thường lệ. Hãy nói ta nghe, nỗi nhớ nào đang dâng tràn trong lòng ngươi đêm nay?',
    'Ánh trăng tròn đêm nay rọi sáng cả những góc sương mù sâu kín nhất. Mọi cảm xúc giấu kín trong tim lữ khách đều đang muốn trào ra. Hãy để các Sứ Giả bầu bạn với nỗi lòng đang tràn trề của ngươi.',
    'Ngươi có thấy cõi sương đêm nay lấp lánh sắc bạc? Trăng tròn làm trực giác của lữ khách nhạy bén hơn, nhưng cũng dễ khiến tim ngươi lỗi nhịp vì những ký ức cũ. Hãy hít một hơi thật sâu trước khi bắt đầu.',
    'Trăng tròn là lúc thủy triều dâng cao nhất, và cũng là lúc những nỗi nhớ thương đạt đến đỉnh điểm. Nói ta nghe, lữ khách, đêm trăng sáng thế này, ngươi đang ước có ai ở bên cạnh?'
  ],
  NewMoon: [
    'Trăng đã ẩn mình dưới bóng tối sâu nhất. Đêm trăng non là lúc cõi sương lặng lẽ nhất, thích hợp để gieo những hạt giống ước muốn mới. Ngươi muốn bắt đầu một chương mới thế nào trong hành trình tình cảm của mình?',
    'Không có ánh trăng nào dẫn lối đêm nay, chỉ có chiếc đèn lồng này và tiếng thì thầm của cõi lòng ngươi. Trăng non là thời khắc của những bắt đầu mới. Đã đến lúc viết lại trang nhật ký của ngươi rồi.',
    'Bầu trời cõi sương tối đen như một tờ giấy trắng chưa vẽ. Đừng sợ bóng tối này, lữ khách. Nó ở đây để ngươi tự vẽ lên mong muốn chân thật nhất của mình. Sứ Giả Khởi Nguyên nào sẽ đến gieo mầm đêm nay đây?',
    'Khi bóng tối bao trùm cũng là lúc những ồn ào tắt lịm. Đêm trăng khuyết hoàn toàn này, ta muốn hỏi: nếu được xóa đi hết thảy để bắt đầu lại một tình cảm mới, ngươi có dám bước lại từ đầu?'
  ],
  MercuryRetrograde: [
    'Ngươi có cảm thấy những lời nói ra gần đây thường bị hiểu lầm không, lữ khách? Cõi sương đang dao động vì những dòng năng lượng nghịch hành hỗn loạn ngoài kia. Các Sứ Giả Phong Kiếm đang rất bất an. Hãy thận trọng với lời nói và suy nghĩ của mình lúc này.',
    'Năng lượng cõi sương hôm nay xáo động, nhiễu loạn lạ thường. Thủy tinh nghịch hành đang làm mờ đi lý trí của con người ở cả hai cõi giới. Có hiểu lầm hay trì hoãn nào đang xảy ra trong mối quan hệ của ngươi không?',
    'Các Sứ Giả Phong Kiếm hôm nay bay lượn hỗn loạn, mang theo những lưỡi kiếm gió sắc nhọn của sự bất đồng. Đừng vội phán xét ai trong những ngày nghịch hành này, lữ khách. Hãy im lặng và lắng nghe nhiều hơn.',
    'Thời gian như đang trôi ngược, những người cũ, chuyện cũ đột nhiên dội về trong tâm trí ngươi đúng không? Cõi sương nghịch hành đang gợi lại những bài học chưa hoàn thành của ngươi. Hãy bình tâm đối mặt.'
  ]
};

// 3. Hourly Greetings (Mục 4.1)
export const TIME_GREETINGS = {
  Morning: [
    'Ngươi đến sớm thế, lữ khách? Sương mù ngoài cổng vẫn còn đọng nước, lạnh buốt. Những Sứ Giả ban ngày đang chầm chậm thức giấc. Câu hỏi của ngươi vào lúc sớm mai này... liệu có phải là điều đầu tiên ngươi nghĩ đến ngay khi vừa mở mắt?',
    'Chào buổi sớm mai, lữ khách. Bình minh của cõi này chỉ là một vệt hồng nhạt lẫn trong sương mỏng. Khi nhân gian chưa kịp thức giấc, lòng ngươi đã tìm đến đây. Có phải đêm qua ngươi đã mất ngủ vì một hình bóng?',
    'Ta nghe tiếng chân ngươi giẫm lên những giọt sương sớm chưa tan. Cổng cõi giới vừa mở. Hãy để làn gió ban mai thanh lọc những muộn phiền của ngày hôm qua trước khi ngươi rút bài.',
    'Bình minh lên mang theo những hy vọng mới, nhưng sương mù của ta vẫn chưa tan hết. Ngươi đến gõ cửa giờ này, hẳn là đang mang một quyết tâm lớn cho ngày hôm nay?'
  ],
  Day: [
    'Cổng Cõi Vô Thường vẫn luôn mở giữa những bận rộn của nhân thế. Nói ta nghe, điều gì giữa ban ngày huyên náo lại khiến lòng ngươi chợt lặng đi và tìm đến đây?',
    'Ánh mặt trời ngoài kia có chiếu sáng được những góc tối trong lòng ngươi không, lữ khách? Ta đứng đây đợi ngươi, tách biệt khỏi thế giới xô bồ ngoài kia. Hãy trút bỏ gánh nặng bên ngoài cổng trước khi bước vào.',
    'Giữa dòng đời hối hả, ngươi lại chọn rẽ lối vào cõi sương mù này. Điều gì đang xảy ra ngoài kia khiến ngươi cần một điểm tựa tĩnh lặng đến thế?',
    'Sương mù ban ngày mỏng nhất, để lộ ra những lối đi rõ ràng. Nếu lòng ngươi đang phân vân giữa những lựa chọn của công việc hay tình cảm, hãy cứ hỏi, các Sứ Giả ban ngày luôn rất thực tế.'
  ],
  Sunset: [
    'Ngày đang tàn dần bên cõi của ngươi rồi phải không? Hoàng hôn là lúc ranh giới giữa thực và mộng mỏng nhất. Hãy ngồi xuống đây, uống một chén trà sương, rồi kể ta nghe điều gì đang làm lòng ngươi phân vân.',
    'Mặt trời lặn, để lại một khoảng trời màu tím đỏ pha lẫn sương mù. Thời khắc chạng vạng luôn làm lòng người yếu mềm đi một chút. Ngươi đến đây vào lúc này, có phải vì cảm giác cô đơn đang dâng lên?',
    'Sương chạng vạng đang buông xuống vai ngươi rồi kìa, lữ khách. Khi một ngày kết thúc, những câu hỏi chưa có lời đáp lại càng trở nên rõ ràng hơn. Hãy để ta xem Sứ Giả nào đang đợi ngươi lúc hoàng hôn.',
    'Ranh giới của ngày và đêm đang mờ đi. Đây là lúc trực giác của ngươi nhạy bén nhất. Hãy nhắm mắt lại một chút, hít thở sâu, rồi mở mắt ra nhìn những Sứ Giả đang hiện hình.'
  ],
  Night: [
    'Đêm đã sâu... Giờ này nhân gian đã ngủ, chỉ còn những trái tim trăn trở là còn thức. Nói nhỏ thôi lữ khách, các Sứ Giả bóng đêm đã đến rất gần cổng rồi. Câu hỏi lúc nửa đêm luôn là câu hỏi thật lòng nhất của ngươi...',
    'Bóng tối bao trùm lên cõi sương, chỉ còn ngọn đèn lồng của ta tỏa ánh sáng mờ ảo. Ngươi đến tìm ta giờ này, hẳn là lòng đang nặng trĩu. Đêm nay, cõi vô thường sẽ lắng nghe mọi điều ngươi không thể nói với ai ngoài đời thực.',
    'Ta nghe thấy tiếng thở dài của ngươi lẫn trong gió đêm. Đêm muộn là lúc lý trí ngủ quên, nhường chỗ cho nỗi nhớ và nỗi sợ lên tiếng. Hãy rút bài đi, để sương đêm soi rõ những gì ngươi đang cố trốn tránh.',
    'Một lữ khách đêm muộn... Ta luôn dành một sự ưu ái cho những ai đến gõ cổng vào giờ này. Trái tim ngươi đang run rẩy vì điều gì? Hãy nói ta nghe, các Sứ Giả bóng đêm sẽ không phán xét ngươi.'
  ]
};

/**
 * Calculates user's Archetype Clan based on the 3 most recent readings (9 cards total)
 * (Mục 3.1)
 */
export async function calculateClanFromReadings(userId: string): Promise<string> {
  const recentReadings = await prisma.reading.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 3,
  });

  if (recentReadings.length < 3) {
    return 'VoThuong';
  }

  const clanCounts: Record<string, number> = {
    DiemHoa: 0,
    ThuyNguyet: 0,
    PhongKiem: 0,
    ThoKim: 0,
  };

  for (const reading of recentReadings) {
    for (const cardStr of reading.cards) {
      const cardId = cardStr.split('|')[0];
      const matchedCard = tarotDeck.find(c => c.id === cardId);
      if (matchedCard && matchedCard.clan !== 'VoThuong') {
        clanCounts[matchedCard.clan] = (clanCounts[matchedCard.clan] || 0) + 1;
      }
    }
  }

  let dominantClan = 'VoThuong';
  for (const [clan, count] of Object.entries(clanCounts)) {
    if (count >= 4) {
      dominantClan = clan;
      break;
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: { clan: dominantClan },
  });

  return dominantClan;
}

/**
 * Checks rules for unlocking memories and saves them to UnlockedMemory.
 * Returns index array of newly unlocked memories in this session.
 * (Mục 1.1)
 */
export async function checkMemoryUnlocks(
  userId: string,
  currentDrawnCards: string[],
  totalReadings: number
): Promise<number[]> {
  const newlyUnlocked: number[] = [];

  const alreadyUnlocked = await prisma.unlockedMemory.findMany({
    where: { userId },
    select: { memoryIndex: true }
  });
  const unlockedSet = new Set(alreadyUnlocked.map(m => m.memoryIndex));

  const unlock = async (index: number) => {
    if (!unlockedSet.has(index)) {
      try {
        await prisma.unlockedMemory.create({
          data: {
            userId,
            memoryIndex: index
          }
        });
        newlyUnlocked.push(index);
      } catch (e) {
        console.error(`Error saving UnlockedMemory ${index}`, e);
      }
    }
  };

  if (totalReadings >= 3) {
    await unlock(1);
  }

  if (totalReadings >= 7) {
    await unlock(2);
  }

  if (totalReadings >= 15) {
    await unlock(7);
  }

  const currentCardIds = currentDrawnCards.map(c => c.split('|')[0]);
  if (currentCardIds.includes('the-lovers')) {
    await unlock(3);
  }
  if (currentCardIds.includes('the-tower')) {
    await unlock(4);
  }
  if (currentCardIds.includes('death')) {
    await unlock(5);
  }

  if (!unlockedSet.has(6)) {
    const allUserReadings = await prisma.reading.findMany({
      where: { userId },
      select: { cards: true }
    });

    const historicalClans = new Set<string>();
    for (const cardStr of currentDrawnCards) {
      const cardId = cardStr.split('|')[0];
      const matched = tarotDeck.find(c => c.id === cardId);
      if (matched && matched.clan !== 'VoThuong') {
        historicalClans.add(matched.clan);
      }
    }
    for (const r of allUserReadings) {
      for (const cardStr of r.cards) {
        const cardId = cardStr.split('|')[0];
        const matched = tarotDeck.find(c => c.id === cardId);
        if (matched && matched.clan !== 'VoThuong') {
          historicalClans.add(matched.clan);
        }
      }
    }

    if (historicalClans.has('DiemHoa') && historicalClans.has('ThuyNguyet') && historicalClans.has('PhongKiem') && historicalClans.has('ThoKim')) {
      await unlock(6);
    }
  }

  return newlyUnlocked;
}

/**
 * Returns dynamic narrative bridge dialogue for Vọng based on user Clan and ERC score
 * (Mục 13.1)
 */
export function getDynamicOutroBridge(clan: string, erc: number): string {
  if (clan === 'DiemHoa') {
    if (erc >= 30) {
      return 'Nhìn thấy ngọn lửa nhiệt huyết đầy kiên định ấm áp trong ngươi, ta thầm mong ngọn lửa ấy sẽ chiếu sáng lối đi của ngươi mà không thiêu rụi ước vọng của bản thân. Hãy để ta gọi các Sứ Giả chỉ lối...';
    } else if (erc <= -30) {
      return 'Ngươi mang theo ngọn lửa kiêu hãnh và quyết liệt của Diễm Hoả, sẵn sàng tự đốt cháy bóng tối chứ không cần sự thương hại của số phận. Để ta xem ngọn lửa của ngươi sẽ tự rạch lối ra sao...';
    } else {
      return 'Ngọn lửa của Tộc Diễm Hoả trong ngươi đang lay động trước ngõ tối này. Hãy cùng xem ngọn lửa ấy sẽ dẫn lối đi hay thiêu rụi sương mù...';
    }
  }

  if (clan === 'ThuyNguyet') {
    if (erc >= 30) {
      return 'Hôm nay nhìn trái tim đong đầy thương nhớ nhưng vẫn tràn ngập niềm tin của một người con Tộc Thuỷ Nguyệt như ngươi, ta thầm mong ngã rẽ phía trước của ngươi sẽ không mang đầy tiếc nuối như câu chuyện của ta. Hãy để ta gọi các Sứ Giả soi tỏ lối đi cho ngươi...';
    } else if (erc <= -30) {
      return 'Dòng nước Thuỷ Nguyệt trong lòng ngươi đã đóng băng bởi sự lạnh lùng của lý trí. Ngươi không còn dễ dàng trao đi những giọt nước mắt vô ích nữa. Hãy cùng xem các Sứ Giả nói gì về ranh giới kiên quyết này...';
    } else {
      return 'Dòng chảy Thuỷ Nguyệt trong ngươi đang chập chùng sóng lòng trước ngã rẽ. Hãy lắng yên nghe tiếng vọng từ đáy nước khi các Sứ Giả xuất hiện...';
    }
  }

  if (clan === 'PhongKiem') {
    if (erc >= 30) {
      return 'Gió Phong Kiếm đã dịu lại thành một làn hơi ấm áp bảo bọc tâm tư ngươi. Dù lý trí mách bảo điều gì, trái tim ngươi vẫn chọn tin tưởng. Hãy để các Sứ Giả giải bày cho nỗi trăn trở ấy...';
    } else if (erc <= -30) {
      return 'Ngươi mang thanh kiếm lý trí sắc lẹm của Phong Kiếm tới đây, hẳn ngươi hiểu rằng việc cố phân tích đúng sai trước một ngã rẽ định mệnh là vô ích. Để ta xem hôm nay lưỡi kiếm của ngươi có đủ bén để tự rạch ra lối đi riêng cho mình hay không.';
    } else {
      return 'Làn gió Phong Kiếm đang thổi qua tư duy sắc bén của ngươi. Lý trí và cảm xúc đang giằng xé. Hãy cùng xem các Sứ Giả soi sáng góc khuất nào...';
    }
  }

  if (clan === 'ThoKim') {
    if (erc >= 30) {
      return 'Sự trầm tĩnh ấm áp của Thổ Kim trong ngươi cho thấy một nền móng tình cảm bền vững mà ngươi đang dốc lòng vun xới. Sự kiên nhẫn ấy sẽ được soi rọi khi các Sứ Giả bước đến...';
    } else if (erc <= -30) {
      return 'Sự chịu đựng kiên cường của Tộc Thổ Kim trong ngươi đã chạm giới hạn, và ngươi sẵn sàng đập vỡ nền đá cũ để đi tìm một mảnh đất lành mới. Hãy xem các Sứ Giả có đồng thuận với quyết định dọn dẹp kiên quyết này...';
    } else {
      return 'Bước chân vững vàng của Thổ Kim đang dừng lại suy tư trước ngã rẽ. Đất đá im lìm nhưng chứa đựng gánh nặng lớn. Hãy để các Sứ Giả nâng đỡ câu hỏi thực tế này của ngươi...';
    }
  }

  // VoThuong
  if (erc >= 30) {
    return 'Một linh hồn mang sự hài hoà của vạn vật và niềm tin trong trẻo vào số mệnh của Vô Thường. Sương mù không cản bước ngươi, nó ôm lấy ngươi để vỗ về. Hãy cùng nhìn xem số mệnh xoay dòng thế nào...';
  } else if (erc <= -30) {
    return 'Ngươi nhìn cõi vô định bằng ánh mắt thấu suốt lạnh lùng, chấp nhận tan hợp như lẽ thường tình của tạo hóa. Ta thích sự dứt khoát vô thường đó. Hãy xem các Sứ Giả mang lại sự thật nào hôm nay...';
  } else {
    return 'Ngươi là sương khói của cõi này, chuyển dời tĩnh lặng và không bám chấp. Hãy để vòng xoay số phận tự hé lộ điều dành riêng cho ngươi...';
  }
}

/**
 * Returns Vọng's dynamic greeting based on priority hierarchy
 * (Memory > Astrological > Time of Day)
 * (Mục 11.2, 13.1, 13.2)
 */
export async function getNarrativeGreeting(
  user: { clan: string; erc: number },
  celestialEvents: { isFullMoon?: boolean; isNewMoon?: boolean; isMercuryRetrograde?: boolean } = {},
  newlyUnlockedMemory: number | null = null
): Promise<{ greeting: string; isMemory: boolean; memoryIndex?: number }> {
  
  if (newlyUnlockedMemory !== null) {
    const memory = VONG_MEMORIES.find(m => m.index === newlyUnlockedMemory);
    if (memory) {
      const bridge = getDynamicOutroBridge(user.clan, user.erc);
      return {
        greeting: `[Ký ức của Vọng - Mảnh ${memory.index}: ${memory.title}]\n"${memory.dialogue}"\n\n${bridge}`,
        isMemory: true,
        memoryIndex: memory.index
      };
    }
  }

  let clanNameVi = 'Vô Thường';
  if (user.clan === 'DiemHoa') clanNameVi = 'Diễm Hoả';
  if (user.clan === 'ThuyNguyet') clanNameVi = 'Thuỷ Nguyệt';
  if (user.clan === 'PhongKiem') clanNameVi = 'Phong Kiếm';
  if (user.clan === 'ThoKim') clanNameVi = 'Thổ Kim';

  let ercPrefix = 'lữ khách';
  if (user.erc >= 30) ercPrefix = 'người bạn hiền hoà';
  else if (user.erc <= -30) ercPrefix = 'hành giả cô độc';

  const clanAddressSuffix = `Ta cảm nhận rõ năng lượng từ tộc ${clanNameVi} trong ngươi, ${ercPrefix} của ta. Hãy để ta gọi các Sứ Giả xem vận số dẫn lối đi nào cho ngươi hôm nay.`;

  if (celestialEvents.isFullMoon) {
    const rIdx = Math.floor(Math.random() * ASTRO_GREETINGS.FullMoon.length);
    const greeting = `[Cấp 2 - Trăng Tròn]: ${ASTRO_GREETINGS.FullMoon[rIdx]} ${clanAddressSuffix}`;
    return { greeting, isMemory: false };
  }
  if (celestialEvents.isNewMoon) {
    const rIdx = Math.floor(Math.random() * ASTRO_GREETINGS.NewMoon.length);
    const greeting = `[Cấp 2 - Trăng Non]: ${ASTRO_GREETINGS.NewMoon[rIdx]} ${clanAddressSuffix}`;
    return { greeting, isMemory: false };
  }
  if (celestialEvents.isMercuryRetrograde) {
    const rIdx = Math.floor(Math.random() * ASTRO_GREETINGS.MercuryRetrograde.length);
    const greeting = `[Cấp 2 - Sao Thuỷ Nghịch Hành]: ${ASTRO_GREETINGS.MercuryRetrograde[rIdx]} ${clanAddressSuffix}`;
    return { greeting, isMemory: false };
  }

  const hour = new Date().getHours();
  let timeKey: keyof typeof TIME_GREETINGS = 'Day';

  if (hour >= 5 && hour < 8) {
    timeKey = 'Morning';
  } else if (hour >= 8 && hour < 17) {
    timeKey = 'Day';
  } else if (hour >= 17 && hour < 20) {
    timeKey = 'Sunset';
  } else {
    timeKey = 'Night';
  }

  const variations = TIME_GREETINGS[timeKey];
  const rIdx = Math.floor(Math.random() * variations.length);
  const timeGreeting = variations[rIdx];

  const greeting = `${timeGreeting} ${clanAddressSuffix}`;
  return { greeting, isMemory: false };
}
