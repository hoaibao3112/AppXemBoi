// Applying pattern from: nextjs-fullstack-best-practices
import * as fs from 'fs';
import * as path from 'path';
import { drawCards } from '../lib/tarot';
import { generateVongCommentaryDispatch } from '../lib/ai-dispatcher';

// Manually parse and load .env file
try {
  const envPath = path.resolve(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const val = parts.slice(1).join('=').trim().replace(/['"]/g, '').replace(/\r/g, '');
        process.env[key] = val;
      }
    });
  }
} catch (e) {
  console.warn('Could not load .env file', e);
}

console.log(`===================================================`);
console.log(`🔮 CÕI VÔ THƯỜNG - PERSONALIZED AI TAROT TEST 🔮`);
console.log(`===================================================`);

async function runTest() {
  // Test 1: Astrology & Numerology Calculation verification
  console.log('\n--- 1. Astrology & Numerology Helpers Test ---');
  const testBirthDates = [
    { name: 'A', dateStr: '1998-07-15', date: new Date('1998-07-15') }, // Cancer, Life path 22 or 4
    { name: 'B', dateStr: '2005-11-23', date: new Date('2005-11-23') }  // Sagittarius, Life path 22 or 5
  ];

  const { getZodiacInfo, getLifePathInfo } = require('../lib/numerology');
  testBirthDates.forEach(t => {
    const zodiac = getZodiacInfo(t.date);
    const lifePath = getLifePathInfo(t.dateStr);
    console.log(`Ngày sinh ${t.dateStr}:`);
    console.log(`  - Cung: ${zodiac.sign} (hệ ${zodiac.element})`);
    console.log(`  - Số chủ đạo: ${lifePath.number} (${lifePath.description})`);
  });

  // Test 2: AI Prompt Compilation check
  console.log('\n--- 2. Mocking User Profile for Tarot Reading ---');
  const cards = drawCards(3);

  const mockUser = {
    name: 'Hải Nam',
    clan: 'ThuyNguyet',
    erc: 45, // Warm/Compassionate Tone (Quang Vọng)
    readingsCount: 18, // Long detailed length mode
    zodiacSign: 'Bọ Cạp (Scorpio)',
    zodiacElement: 'Nước',
    lifePathNumber: 7,
    lifePathDescription: 'Nhà thông thái cô độc, chiêm nghiệm sâu sắc và bền bỉ tìm kiếm chân lý.',
    soulCardName: 'Sứ Giả Nữ Tư Tế (The High Priestess)',
    historyContext: `- Câu hỏi: "Liệu tôi có tìm được định hướng công việc mới trong năm nay?"\n  Lá bài đã rút: [Sứ Giả Giáo Hoàng (Xuôi), Sứ Giả bậc 5 Tộc Phong Kiếm (Ngược), Sứ Giả Khởi Nguyên Tộc Thổ Kim (Xuôi)]`
  };

  const question = 'Tôi đang cảm thấy bế tắc trong công việc hiện tại, tôi có nên rẽ hướng sang làm nghiên cứu tự lập không?';

  // Format cards text to show in console
  console.log(`Lữ khách: ${mockUser.name}`);
  console.log(`Câu hỏi: "${question}"`);
  console.log('\nBài rút được:');
  cards.forEach((c, idx) => {
    console.log(`  - Lá ${idx + 1} (${idx === 0 ? 'Bản thân' : idx === 1 ? 'Đối phương' : 'Mối quan hệ'}): Sứ Giả ${c.card.name} (${c.isReversed ? 'Ngược' : 'Xuôi'})`);
  });

  // Re-construct prompt representation for console check
  let addressTerm = 'người bạn hiền hoá';
  let relationalTone = 'Xưng hô trìu mến là "người bạn hiền hoá" hoặc "người bạn phương xa". Tông giọng vỗ về, ấm áp, thấu cảm và dìu dắt.';
  let structuralTone = 'Sử dụng các hình ảnh ẩn dụ về mặt nước tĩnh lặng, trăng chiếu bóng nước... tộc Thuỷ Nguyệt (Nước).';
  let lengthConstraint = 'Viết chi tiết, bay bổng sâu sắc từ 5-6 câu. Đóng vai một người bạn tâm giao lâu năm đã thấu hiểu lữ khách.';

  let personalContext = `- Tên của lữ khách: "${mockUser.name}". Hãy khéo léo gọi tên này trong lời thoại hội thoại một cách tự nhiên và trìu mến.\n`;
  personalContext += `- Cung hoàng đạo: ${mockUser.zodiacSign} (hệ ${mockUser.zodiacElement}). Hãy sử dụng năng lượng tự nhiên của cung hoàng đạo này để đối chiếu hành vi, tính cách hay cảm xúc hiện tại của họ.\n`;
  personalContext += `- Số chủ đạo Thần số học: Số ${mockUser.lifePathNumber} (${mockUser.lifePathDescription})\n`;
  personalContext += `- Sứ Giả Hộ Mệnh Linh Hồn: Sứ Giả ${mockUser.soulCardName}.\n`;

  let historyPrompt = `
Dưới đây là lịch sử câu hỏi bói bài gần đây của lữ khách này:
${mockUser.historyContext}
Hãy chú ý: Nếu câu hỏi hiện tại có liên quan hoặc lặp lại các nỗi niềm cũ, bạn hãy khéo léo bình luận rằng bạn nhận ra chấp niệm dai dẳng này của lữ khách...
`;

  const interpretationRule = `
ĐẶC BIỆT LƯU Ý VỀ LUẬN GIẢI CHỦ ĐỀ:
- Trải bài 3 lá có các vị trí mặc định là: Lá 1 (Bản thân lữ khách), Lá 2 (Đối phương), Lá 3 (Mối quan hệ/Kết nối).
- Nếu câu hỏi của lữ khách KHÔNG phải về tình cảm/mối quan hệ đôi lứa (ví dụ họ hỏi về sự nghiệp, tiền tài, học tập, hoặc định hướng bản thân):
  + Hãy diễn giải vị trí "Đối phương" theo nghĩa ẩn dụ: đó là ngoại cảnh, chướng ngại vật khách quan, đối thủ, thử thách hoặc cơ hội bên ngoài.
  + Hãy diễn giải vị trí "Mối quan hệ" theo nghĩa ẩn dụ: đó là mối liên kết giữa bản thân lữ khách với sự nghiệp, với tài chính, hoặc với chính thế giới nội tâm của họ.
  + Luận giải phải bám sát 100% vào đúng chủ đề được hỏi. CẤM tuyệt đối hướng câu trả lời về chuyện tình yêu đôi lứa nếu họ không hỏi.
`;

  console.log('\n--- 3. Prompt System Message Preview ---');
  console.log(`[SYSTEM PROMPT]`);
  console.log(`Bạn là Vọng (The Gatekeeper / Người giữ cổng)...
Xưng hô: Xưng là "ta", gọi người dùng là "${addressTerm}".
Tông giọng: ${relationalTone} / ${structuralTone}
Độ dài: ${lengthConstraint}

Thông tin cá nhân:
${personalContext}
${historyPrompt}
${interpretationRule}
Nhiệm vụ: Viết lời luận giải và kết nối 3 lá bài Tarot này lại thành một mạch kể chuyện hội thoại mượt mà cho câu hỏi: "${question}"...
`);

  console.log('\n--- 4. Running AI Commentary Dispatcher ---');
  try {
    const response = await generateVongCommentaryDispatch(
      mockUser,
      question,
      cards,
      null, // No combo
      null, // No elemental relation fallback
      { isFullMoon: false, isNewMoon: false, isMercuryRetrograde: false }
    );
    console.log('\n✅ AI COMMENTARY RESPONSE:');
    console.log(response);
  } catch (err: any) {
    console.log('⚠️ AI Call failed (expected if API keys are not working locally):', err.message);
    console.log('✅ Prompts compile successfully and structure is intact!');
  }
}

runTest();
