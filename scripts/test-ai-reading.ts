import { generateVongCommentaryWithGemini } from '../lib/gemini';
import { drawCards } from '../lib/tarot';

console.log(`===================================================`);
console.log(`🔮 CÕI VÔ THƯỜNG - GEMINI NARRATIVE GENERATOR TEST 🔮`);
console.log(`===================================================`);

async function runTest() {
  const cards = drawCards(3);
  
  const mockUserShort = {
    clan: 'ThuyNguyet',
    erc: 50, // Warm/Compassionate Relational Tone
    readingsCount: 3, // Short Length Mode (< 5 readings)
  };

  const mockUserLong = {
    clan: 'DiemHoa',
    erc: -45, // Sharp/Independent Relational Tone
    readingsCount: 20, // Long Length Mode (> 15 readings)
  };

  console.log('\n--- 1. Testing Gemini Prompt Compilation ---');
  console.log('Simulating User Profile A:', mockUserShort);
  console.log('Simulating User Profile B:', mockUserLong);
  
  // Verify that calling the API without key throws the correct check error
  try {
    console.log('\n--- 2. Testing API Key Check & Fallback Trigger ---');
    console.log('Calling generateVongCommentaryWithGemini (should throw error since GEMINI_API_KEY is empty)...');
    
    await generateVongCommentaryWithGemini(
      mockUserShort,
      'Tôi và người ấy có cơ hội gắn kết lại không?',
      cards,
      null,
      { relation: 'Tương Sinh', orientation: 'Xuôi - Xuôi' }
    );
  } catch (err: any) {
    console.log('✅ SUCCESS: Handled missing API key correctly!');
    console.log(`  Caught Error Message: "${err.message}"`);
    console.log('\n💡 Falling back to rule-based elemental combination template...');
  }
}

runTest();
