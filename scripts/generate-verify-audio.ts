// Applying pattern from: nextjs-fullstack-best-practices
import * as fs from 'fs';
import * as path from 'path';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

const audioDir = path.resolve(__dirname, '../public/audio');
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

const VOICES = {
  male: 'vi-VN-NamMinhNeural',
  female: 'vi-VN-HoaiMyNeural',
  neutral: 'vi-VN-NamMinhNeural'
};

const TEMPLATES = [
  // Correct variants
  {
    filename: 'verify-correct-warm.mp3',
    voice: VOICES.female,
    text: 'Một trái tim rộng mở của người bạn hiền hòa luôn tìm thấy sự đồng điệu với sương mù. Vọng vui vì điều đó đã mang lại ý nghĩa cho ngươi.'
  },
  {
    filename: 'verify-correct-cold.mp3',
    voice: VOICES.male,
    text: 'Lý trí của hành giả cô độc đã đúng. Số mệnh hiển hiện lạnh lùng và chính xác trước mắt ngươi.'
  },
  {
    filename: 'verify-correct-neutral.mp3',
    voice: VOICES.neutral,
    text: 'Vọng cũng không ngờ sương mù lại soi tỏ đúng đến vậy. Ta ghi nhớ sự ứng nghiệm này, lữ khách.'
  },
  
  // Incorrect variants
  {
    filename: 'verify-incorrect-warm.mp3',
    voice: VOICES.female,
    text: 'Người bạn hiền của ta, sương mù đôi khi cũng có những bóng mờ làm che lối. Cảm ơn ngươi đã bao dung chỉ bảo cho ta biết sự thật.'
  },
  {
    filename: 'verify-incorrect-cold.mp3',
    voice: VOICES.male,
    text: 'Sương mù đã đoán sai, và điều đó chứng minh ý chí tự lập của hành giả cô độc mạnh mẽ hơn số mệnh định sẵn. Ta trân trọng sự thẳng thắn này.'
  },
  {
    filename: 'verify-incorrect-neutral.mp3',
    voice: VOICES.neutral,
    text: 'Vậy sao... Vọng cũng không phải lúc nào cũng nhìn thấu hết cõi lòng con người. Cảm ơn lữ khách đã thành thật nói cho ta biết.'
  },
  
  // Snooze variant
  {
    filename: 'verify-snooze.mp3',
    voice: VOICES.neutral,
    text: 'Được, có những chuyện sương mù cần thêm thời gian để lắng xuống mới thấy rõ đáy. Ta sẽ hỏi lại ngươi sau.'
  }
];

async function generateAll() {
  console.log('--- Generating Static Verification Audio Files ---');
  
  for (const t of TEMPLATES) {
    const tts = new MsEdgeTTS();
    const filePath = path.join(audioDir, t.filename);
    console.log(`Generating ${t.filename} (Voice: ${t.voice})...`);
    
    try {
      await tts.setMetadata(t.voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
      const { audioStream } = tts.toStream(t.text);
      const chunks: Buffer[] = [];
      
      const audioBuffer = await new Promise<Buffer>((resolve, reject) => {
        audioStream.on('data', (chunk: Buffer) => {
          chunks.push(chunk);
        });
        audioStream.on('end', () => {
          resolve(Buffer.concat(chunks));
        });
        audioStream.on('error', (err: any) => {
          reject(err);
        });
      });
      
      fs.writeFileSync(filePath, audioBuffer);
      console.log(`✅ Success: Generated and saved ${t.filename}`);
    } catch (e: any) {
      console.error(`❌ Error generating ${t.filename}:`, e.message);
    }
  }
  console.log('\nAll static audio files generation complete.');
}

generateAll();
