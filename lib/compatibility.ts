// Applying pattern from: nextjs-fullstack-best-practices
import { calculateSoulCard } from './auth';
import { tarotDeck } from './tarot';
import { getElementalRelation } from './relations';
import { anthropic } from './anthropic';
import { getGeminiClient } from './gemini';

/**
 * Calculates Soul Card ID of the partner based on their date of birth (e.g. "1998-07-15").
 */
export function calculatePartnerSoulCard(birthDateStr: string): string {
  return calculateSoulCard(birthDateStr);
}

/**
 * Resolves the Clan name of the partner based on their Soul Card ID.
 */
export function calculatePartnerClan(soulCardId: string): string {
  const clanMap: Record<string, string> = {
    'the-fool': 'VoThuong',
    'the-magician': 'PhongKiem',
    'the-high-priestess': 'ThuyNguyet',
    'the-empress': 'ThoKim',
    'the-emperor': 'DiemHoa',
    'the-hierophant': 'ThoKim',
    'the-lovers': 'PhongKiem',
    'the-chariot': 'DiemHoa',
    'strength': 'DiemHoa',
    'the-hermit': 'ThoKim',
    'wheel-of-fortune': 'VoThuong',
    'justice': 'PhongKiem',
    'the-hanged-man': 'ThuyNguyet',
    'death': 'ThuyNguyet',
    'temperance': 'ThuyNguyet',
    'the-devil': 'DiemHoa',
    'the-tower': 'DiemHoa',
    'the-star': 'PhongKiem',
    'the-moon': 'ThuyNguyet',
    'the-sun': 'DiemHoa',
    'judgement': 'VoThuong',
    'the-world': 'ThoKim',
  };
  return clanMap[soulCardId] || 'VoThuong';
}

/**
 * Maps the relationship elements comparison between two clans into 4 distinct branches.
 */
export function determineCompatibilityBranch(clan1: string, clan2: string): 'harmony' | 'tension' | 'mirror' | 'neutral' {
  if (clan1 === clan2 && clan1 !== 'VoThuong') {
    return 'mirror';
  }

  if (clan1 === 'VoThuong' || clan2 === 'VoThuong') {
    return 'neutral';
  }

  const relation = getElementalRelation(clan1, clan2);
  if (relation === 'Tương Sinh') {
    return 'harmony';
  }
  if (relation === 'Tương Khắc') {
    return 'tension';
  }

  return 'neutral';
}

/**
 * Draws 1 random Tarot Card to serve as the relationship's "Sứ Giả Chứng Giám" (Witness Messenger).
 */
export function drawWitnessCard(): string {
  const randomIndex = Math.floor(Math.random() * tarotDeck.length);
  const card = tarotDeck[randomIndex];
  const isReversed = Math.random() > 0.7; // 30% chance of reversed card
  return `${card.id}|${isReversed ? 'reversed' : 'upright'}`;
}

/**
 * Dispatches the compatibility commentary generation to Anthropic Claude or Google Gemini.
 */
export async function generateVongCompatibilityDispatch(
  userClan: string,
  userErc: number,
  partnerName: string,
  partnerClan: string,
  partnerSoulCardName: string,
  witnessCardName: string,
  branch: 'harmony' | 'tension' | 'mirror' | 'neutral'
): Promise<string> {
  const isWarm = userErc >= 30;
  const isCold = userErc <= -30;

  const branchViMap = {
    harmony: 'Đồng Điệu (Tương Sinh)',
    tension: 'Đối Nghịch (Tương Khắc)',
    mirror: 'Soi Gương (Cùng Tộc)',
    neutral: 'Cân Bằng (Trung Tính)'
  };

  const systemPrompt = `Ngươi là Vọng, kẻ canh giữ cổng Cõi Vô Thường đầy sương mù.
Ngươi nói chuyện bằng tiếng Việt, giọng văn đầy chất thơ, tự sự, hoài niệm, có phần cô độc và trầm buồn.
Xưng hô: Gọi đối phương là "lữ khách" (hoặc "người bạn hiền" nếu ấm áp, hoặc "hành giả" nếu lạnh lùng), xưng "ta" hoặc "Vọng".
Điều chỉnh tông giọng theo chỉ số ERC của lữ khách:
- Nếu lữ khách ấm áp (isWarm = true): Gần gũi, bao dung, đồng cảm sâu sắc.
- Nếu lữ khách lạnh lùng (isCold = true): Trầm ổn, lý trí, thẳng thắn, độc lập.
- Nếu trung tính: Huyền bí, gợi mở chiêm nghiệm.

Nhiệm vụ: Viết một đoạn văn ngắn (100 - 150 từ, khoảng 4-6 câu) luận giải về sự tương hợp giữa hai người (Lữ khách và người đồng hành tên là "${partnerName}").
Tránh viết danh sách gạch đầu dòng hay chia tiêu đề, hãy viết thành một đoạn văn trôi chảy duy nhất của Vọng.`;

  const userPrompt = `
- Tộc Bản Mệnh của lữ khách: ${userClan}
- ERC hiện tại của lữ khách: ${userErc} (isWarm: ${isWarm}, isCold: ${isCold})
- Tên người đồng hành: ${partnerName}
- Tộc Bản Mệnh của người đồng hành: ${partnerClan} (Sứ Giả Hộ Mệnh: ${partnerSoulCardName})
- Nhánh tương hợp nguyên tố: ${branchViMap[branch]}
- Lá bài Sứ Giả Chứng Giám đại diện cho mối quan hệ: ${witnessCardName}

Hãy đưa ra lời bình thơ mộng của Vọng về mối liên kết này, kết hợp ý nghĩa tương sinh/tương khắc của hai nguyên tố tộc và thông điệp của Sứ Giả Chứng Giám.`;

  const hasAnthropicKey = !!process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.replace(/['"]/g, '').trim() !== '';
  if (hasAnthropicKey) {
    try {
      console.log('🤖 Dispatched compatibility commentary to Anthropic Claude.');
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 300,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      });
      const block = response.content[0];
      if (block && 'text' in block) {
        return block.text.trim();
      }
    } catch (error) {
      console.warn('⚠️ Anthropic Claude compatibility commentary failed, falling back to Gemini...', error);
    }
  }

  const hasGeminiKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.replace(/['"]/g, '').trim() !== '';
  if (hasGeminiKey) {
    try {
      console.log('🤖 Dispatched compatibility commentary to Google Gemini.');
      const genAI = getGeminiClient();
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: systemPrompt,
      });
      const result = await model.generateContent(userPrompt);
      const text = result.response.text();
      if (text) return text.trim();
    } catch (error) {
      console.warn('⚠️ Google Gemini compatibility commentary failed, falling back to static text...', error);
    }
  }

  return `Vọng nhìn thấy hai làn sương khói của ngươi và ${partnerName} đang cuộn vào nhau. Tương tác của nguyên tố ${branchViMap[branch]} cùng sự hiện diện của Sứ Giả Chứng Giám ${witnessCardName} cho thấy mối duyên này mang nhiều chiều sâu tự sự, cần sự kiên nhẫn thấu cảm để đi qua giông gió cõi trần.`;
}
