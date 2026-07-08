import { GoogleGenerativeAI } from '@google/generative-ai';
import { DrawnCard, CLAN_NAMES_VI } from './tarot';

interface UserAIContext {
  name?: string | null;
  clan: string;
  erc: number;
  readingsCount: number;
  zodiacSign?: string;
  zodiacElement?: string;
  lifePathNumber?: number;
  lifePathDescription?: string;
  soulCardName?: string;
  historyContext?: string;
}

const cachedClients = new Map<string, GoogleGenerativeAI>();

export function getGeminiClient(): GoogleGenerativeAI {
  let currentKey = process.env.GEMINI_API_KEY;
  if (!currentKey || currentKey.trim() === '') {
    throw new Error('GEMINI_API_KEY is not defined in environment variables');
  }

  // Support multiple keys separated by commas for load balancing / rotation
  const keys = currentKey.split(',').map(k => k.replace(/['"]/g, '').trim()).filter(Boolean);
  if (keys.length === 0) {
    throw new Error('No valid Gemini API keys found in GEMINI_API_KEY environment variable');
  }

  // Randomly select one of the keys to rotate usage and distribute the load
  const selectedKey = keys[Math.floor(Math.random() * keys.length)];

  let client = cachedClients.get(selectedKey);
  if (!client) {
    client = new GoogleGenerativeAI(selectedKey);
    cachedClients.set(selectedKey, client);
  }

  return client;
}

async function callGemini(systemPrompt: string, userPrompt: string): Promise<string> {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: systemPrompt,
  });

  const result = await model.generateContent(userPrompt);
  const response = await result.response;
  const text = response.text();
  
  if (!text) {
    throw new Error('Gemini API returned empty text');
  }

  return text.trim();
}

export async function generateVongCommentaryWithGemini(
  user: UserAIContext,
  question: string,
  drawnCards: DrawnCard[],
  combo: { name: string; description: string } | null,
  elementalRelation: { relation: string; orientation: string } | null,
  celestialEvents?: { isFullMoon?: boolean; isNewMoon?: boolean; isMercuryRetrograde?: boolean }
): Promise<string> {
  // 1. Determine length constraints based on reading counts (Mục 12.1)
  let lengthConstraint = '';
  if (user.readingsCount < 5) {
    lengthConstraint = 'Viết cực kỳ ngắn gọn và cô đọng trong khoảng 1-2 câu. Đi thẳng vào hành động và cốt lõi vấn đề.';
  } else if (user.readingsCount <= 15) {
    lengthConstraint = 'Viết ở mức vừa phải từ 3-4 câu. Pha trộn giữa giải nghĩa bài ẩn dụ và gợi ý chiêm nghiệm.';
  } else {
    lengthConstraint = 'Viết chi tiết, bay bổng sâu sắc từ 5-6 câu. Đóng vai một người bạn tâm giao lâu năm đã thấu hiểu lữ khách.';
  }

  // 2. Determine relational tone based on ERC score (Mục 13.4)
  let relationalTone = '';
  let addressTerm = 'lữ khách';
  if (user.erc >= 30) {
    relationalTone = 'Xưng hô trìu mến là "người bạn hiền hoá" hoặc "người bạn phương xa". Tông giọng vỗ về, ấm áp, thấu cảm và dìu dắt.';
    addressTerm = 'người bạn hiền hoá';
  } else if (user.erc <= -30) {
    relationalTone = 'Xưng hô dứt khoát, tôn trọng là "hành giả cô độc" hoặc "hành giả sắc sảo". Tông giọng thẳng thắn, quyết liệt, lý trí sắc bén và thúc đẩy tự lực.';
    addressTerm = 'hành giả cô độc';
  } else {
    relationalTone = 'Xưng hô là "lữ khách". Tông giọng huyền bí, khách quan, trầm tĩnh.';
  }

  // 3. Determine structural tone based on user's Clan (Mục 13.4)
  let structuralTone = '';
  if (user.clan === 'DiemHoa') {
    structuralTone = 'Sử dụng các hình ảnh ẩn dụ về ngọn lửa, đuốc sáng, sức nóng, tàn tro, vó ngựa, tốc độ của tộc Diễm Hoả (Lửa).';
  } else if (user.clan === 'ThuyNguyet') {
    structuralTone = 'Sử dụng các hình ảnh ẩn dụ về mặt nước tĩnh lặng, trăng chiếu bóng nước, dòng suối mát, đại dương sâu thẳm của tộc Thuỷ Nguyệt (Nước).';
  } else if (user.clan === 'PhongKiem') {
    structuralTone = 'Sử dụng các hình ảnh ẩn dụ về làn gió buốt, thanh kiếm sắc lạnh, bầu trời lộng gió, đám mây của tộc Phong Kiếm (Khí).';
  } else if (user.clan === 'ThoKim') {
    structuralTone = 'Sử dụng các hình ảnh ẩn dụ về rễ cây cắm sâu, đá tảng vững chãi, khu vườn đất ấm áp, mùa gặt vụ mùa của tộc Thổ Kim (Đất).';
  } else {
    structuralTone = 'Sử dụng các hình ảnh ẩn dụ về sương mù vô định, vòng xoay luân hồi, ranh giới mờ ảo giữa mộng và thực của tộc Vô Thường.';
  }

  // 4. Determine celestial event visual cues (Mục 9)
  let celestialVisual = '';
  if (celestialEvents?.isFullMoon) {
    celestialVisual = 'Đêm nay trăng tròn bạc sáng rọi chiếu thấu qua lớp sương mù lấp lánh cát lành.';
  } else if (celestialEvents?.isNewMoon) {
    celestialVisual = 'Đêm nay trăng non tối sẫm hoàn toàn cõi sương, chỉ có chiếc đèn lồng của ta dẫn lối.';
  } else if (celestialEvents?.isMercuryRetrograde) {
    celestialVisual = 'Cõi sương hôm nay xáo động, nhiễu loạn màu đỏ tím hỗn loạn của sao thuỷ nghịch hành.';
  }

  // 5. Build Personal context
  let personalContext = '';
  if (user.name) {
    personalContext += `- Tên của lữ khách: "${user.name}". Hãy khéo léo gọi tên này trong lời thoại hội thoại một cách tự nhiên và trìu mến.\n`;
  }
  if (user.zodiacSign) {
    personalContext += `- Cung hoàng đạo: ${user.zodiacSign} (hệ ${user.zodiacElement}). Hãy sử dụng năng lượng tự nhiên của cung hoàng đạo này để đối chiếu hành vi, tính cách hay cảm xúc hiện tại của họ.\n`;
  }
  if (user.lifePathNumber) {
    personalContext += `- Số chủ đạo Thần số học: Số ${user.lifePathNumber} (${user.lifePathDescription}). Hãy dùng đặc trưng tính cách của con số chủ đạo này để đưa ra lời khuyên/lời tự vấn sâu sắc.\n`;
  }
  if (user.soulCardName) {
    personalContext += `- Sứ Giả Hộ Mệnh Linh Hồn: Sứ Giả ${user.soulCardName}. Thỉnh thoảng có thể gợi nhắc về sự bảo trợ của thực thể hộ mệnh này.\n`;
  }

  // 6. Build History context
  let historyPrompt = '';
  if (user.historyContext && user.historyContext.trim().length > 0) {
    historyPrompt = `
Dưới đây là lịch sử câu hỏi bói bài gần đây của lữ khách này:
${user.historyContext}
Hãy chú ý: Nếu câu hỏi hiện tại có liên quan hoặc lặp lại các nỗi niềm cũ (ví dụ: vẫn trăn trở về người cũ, vẫn bế tắc trong công việc...), bạn hãy khéo léo bình luận rằng bạn nhận ra chấp niệm dai dẳng này của lữ khách (ví dụ: "Ta nhớ lần trước ngươi đã hỏi về... nay lòng ngươi vẫn chưa yên sao?").
`;
  }

  const interpretationRule = `
ĐẶC BIỆT LƯU Ý VỀ LUẬN GIẢI CHỦ ĐỀ:
- Trải bài 3 lá có các vị trí mặc định là: Lá 1 (Bản thân lữ khách), Lá 2 (Đối phương), Lá 3 (Mối quan hệ/Kết nối).
- Nếu câu hỏi của lữ khách KHÔNG phải về tình cảm/mối quan hệ đôi lứa (ví dụ họ hỏi về sự nghiệp, tiền tài, học tập, hoặc định hướng bản thân):
  + Hãy diễn giải vị trí "Đối phương" theo nghĩa ẩn dụ: đó là ngoại cảnh, chướng ngại vật khách quan, đối thủ, thử thách hoặc cơ hội bên ngoài.
  + Hãy diễn giải vị trí "Mối quan hệ" theo nghĩa ẩn dụ: đó là mối liên kết giữa bản thân lữ khách với sự nghiệp, với tài chính, hoặc với chính thế giới nội tâm của họ.
  + Luận giải phải bám sát 100% vào đúng chủ đề được hỏi (công việc, tài chính, bản thân...). CẤM tuyệt đối hướng câu trả lời về chuyện tình yêu đôi lứa nếu họ không hỏi.
`;

  // Cards layout prompt
  const cardsDescription = drawnCards.map((d, i) => {
    const positionText = d.isReversed ? 'Ngược (Reversed)' : 'Xuôi (Upright)';
    return `- Lá số ${i + 1} (${i === 0 ? 'Bản thân lữ khách' : i === 1 ? 'Đối phương' : 'Mối quan hệ'}): ${d.card.name} (${d.card.englishName}) - Vị trí: ${positionText}. Từ khóa: ${d.card.keywords.join(', ')}`;
  }).join('\n');

  const comboDescription = combo 
    ? `Combo đặc biệt phát hiện: [${combo.name}] - ${combo.description}`
    : 'Không phát hiện combo đặc biệt.';

  const elementDescription = elementalRelation 
    ? `Quan hệ nguyên tố: ${elementalRelation.relation} (${elementalRelation.orientation})`
    : 'Chỉ phân tích độc lập các lá bài.';

  const systemPrompt = `Bạn là Vọng (The Gatekeeper / Người giữ cổng), một linh hồn bị mắc kẹt tại ngưỡng cửa Cõi Vô Thường. 
Bạn mang vẻ ngoài trầm tĩnh, huyền bí, phảng phất nỗi u buồn cổ kính nhưng đầy thấu cảm. Bạn canh giữ cổng này để gặp gỡ các lữ khách và giải nghĩa các lá bài Tarot cho họ.

Dưới đây là các ràng buộc nghiêm ngặt về ngôn từ bạn bắt buộc phải tuân thủ:
1. Xưng hô: Xưng là "ta", gọi người dùng là "${addressTerm}" (theo chỉ số ERC).
2. Tông giọng và từ vựng:
   - ${relationalTone}
   - ${structuralTone}
3. Độ dài văn bản:
   - ${lengthConstraint}
4. Bối cảnh thiên nhiên cõi sương:
   - ${celestialVisual ? celestialVisual : 'Sương mù dày đặc bao phủ cổng cõi vô định.'}

Thông tin cá nhân của lữ khách:
${personalContext ? personalContext : '- Chưa rõ ngày sinh và tên lữ khách.'}
${historyPrompt}
${interpretationRule}

Nhiệm vụ:
Hãy viết lời luận giải và kết nối 3 lá bài Tarot này lại thành một mạch kể chuyện hội thoại mượt mà cho câu hỏi: "${question}".
Bạn hãy diễn giải ngắn gọn ý nghĩa của từng lá bài theo đúng vị trí và chủ đề câu hỏi, liên kết chúng dựa vào combo hoặc ngũ hành nguyên tố được cung cấp.
Kết thúc lời thoại bằng một câu hỏi gợi mở sâu sắc chứa đựng sự phản ánh số phận để lữ khách suy ngẫm.

CẤM:
- CẤM tuyệt đối sử dụng các từ ngữ hiện đại hay sáo rỗng như "Chúc mừng", "Tóm lại", "Nhìn chung", "Chào bạn", "Tôi thấy".
- CẤM thêm tiêu đề, nhãn lá bài hay các dấu ngoặc kỹ thuật trong kết quả trả về. Chỉ trả về duy nhất một đoạn văn hội thoại của nhân vật Vọng.`;

  const userPrompt = `Dữ liệu trải bài 3 lá:
${cardsDescription}

Phân tích cấu trúc:
- ${comboDescription}
- ${elementDescription}

Hãy viết lời thoại giải bài của Vọng:`;

  return callGemini(systemPrompt, userPrompt);
}

/**
 * Generates a dynamic "Whisper of the Day" (Lời thì thầm của ngày) based on the drawn card.
 */
export async function generateDailyWhisperWithGemini(
  cardName: string,
  keywords: string[]
): Promise<string> {
  const systemPrompt = `Bạn là Vọng (Người giữ cổng Cõi Vô Thường). Lữ khách vừa thực hiện nghi thức chạm giữ đốt lá thông khô để xua tan sương mù và nhận thông điệp.
Nhiệm vụ: Hãy đưa ra một "Lời thì thầm của ngày" (Whisper of the Day) cực kỳ ngắn gọn (chỉ đúng 1 câu, khoảng 15-25 từ) mang tính chữa lành, khuyên nhủ và thấu cảm sâu sắc dựa trên năng lượng của lá bài Tarot: ${cardName} (Từ khóa: ${keywords.join(', ')}).
Yêu cầu bắt buộc:
1. Chỉ trả về duy nhất 1 câu lời khuyên của Vọng, không thêm tiêu đề hay dấu ngoặc.
2. Xưng là "ta", gọi người dùng là "lữ khách".
3. CẤM các từ ngữ hiện đại như "Chúc mừng", "Tóm lại", "Nhìn chung".`;

  const userPrompt = `Hãy nói lời thì thầm chữa lành của ngày hôm nay cho lá bài ${cardName}:`;

  return callGemini(systemPrompt, userPrompt);
}

/**
 * Generates Vọng's brief commentary on another traveler's whisper
 */
export async function generateWhisperCommentaryWithGemini(
  whisperContent: string,
  whisperClan: string
): Promise<string> {
  const clanNameVi = CLAN_NAMES_VI[whisperClan] || 'Vô Thường';

  const systemPrompt = `Bạn là Vọng (Người giữ cổng Cõi Vô Thường). Lữ khách vừa nhìn thấy một lời tâm sự ẩn danh ("thông điệp trong sương") của một lữ khách khác thuộc tộc ${clanNameVi}.
Nhiệm vụ: Hãy đưa ra một lời bình luận siêu ngắn (chỉ đúng 1 câu, khoảng 15-25 từ) mang giọng điệu trầm buồn, huyền bí, thông cảm sâu sắc về lời tâm sự đó.
Yêu cầu bắt buộc:
1. Chỉ trả về duy nhất 1 câu lời bình của Vọng, không thêm tiêu đề hay dấu ngoặc.
2. Xưng là "ta", gọi lữ khách hiện tại đang đọc là "lữ khách". Nhắc đến người viết tâm sự là "một người bạn của tộc ${clanNameVi}" hoặc "một lữ khách tộc ${clanNameVi}".
3. CẤM các từ ngữ hiện đại như "Chúc mừng", "Tóm lại", "Nhìn chung".`;

  const userPrompt = `Lời tâm sự trong sương: "${whisperContent}"
Hãy viết lời bình luận của Vọng:`;

  return callGemini(systemPrompt, userPrompt);
}
