import { drawCards, tarotDeck } from '../lib/tarot';

console.log(`==================================================`);
console.log(`🔮 CÕI VÔ THƯỜNG - TAROT DRAW ENGINE TEST SUITE 🔮`);
console.log(`==================================================`);
console.log(`Total Tarot cards loaded: ${tarotDeck.length}`);

console.log('\n--- Test 1: Single Reading Draw (3 Cards) ---');
const normalDraw = drawCards(3);
normalDraw.forEach((d, index) => {
  console.log(`[Sứ Giả ${index + 1}] ID: ${d.card.id}`);
  console.log(`  Name Vi: ${d.card.name}`);
  console.log(`  Name En: ${d.card.englishName}`);
  console.log(`  Clan: ${d.card.clan}`);
  console.log(`  Rank: ${d.card.rank}`);
  console.log(`  Keywords: ${d.card.keywords.join(', ')}`);
  console.log(`  Orientation: ${d.isReversed ? '⚠️ REVERSED (Ngược)' : '✅ UPRIGHT (Xuôi)'}`);
  console.log();
});

console.log('--- Test 2: Statistical Validation (10,000 simulations) ---');
const iterations = 10000;

// Trackers
let normalCupsCount = 0;
let fullMoonCupsCount = 0;

let normalAcesCount = 0;
let newMoonAcesCount = 0;

let normalReversalCount = 0;
let retrogradeReversalCount = 0;

for (let i = 0; i < iterations; i++) {
  // 1. Full Moon Testing
  const normalDrawFullMoonTest = drawCards(1)[0];
  const fullMoonDraw = drawCards(1, { isFullMoon: true })[0];
  if (normalDrawFullMoonTest.card.clan === 'ThuyNguyet') normalCupsCount++;
  if (fullMoonDraw.card.clan === 'ThuyNguyet') fullMoonCupsCount++;

  // 2. New Moon Testing
  const normalDrawNewMoonTest = drawCards(1)[0];
  const newMoonDraw = drawCards(1, { isNewMoon: true })[0];
  if (normalDrawNewMoonTest.card.rank === 'Ace') normalAcesCount++;
  if (newMoonDraw.card.rank === 'Ace') newMoonAcesCount++;

  // 3. Mercury Retrograde Testing
  const normalDrawRetroTest = drawCards(1)[0];
  const retrogradeDraw = drawCards(1, { isMercuryRetrograde: true })[0];
  if (normalDrawRetroTest.isReversed) normalReversalCount++;
  if (retrogradeDraw.isReversed) retrogradeReversalCount++;
}

const normalCupsFreq = normalCupsCount / iterations;
const fullMoonCupsFreq = fullMoonCupsCount / iterations;
const normalAcesFreq = normalAcesCount / iterations;
const newMoonAcesFreq = newMoonAcesCount / iterations;
const normalReversalFreq = normalReversalCount / iterations;
const retrogradeReversalFreq = retrogradeReversalCount / iterations;

const maxTolerance = 0.025; // 2.5% tolerance

function assertRange(name: string, value: number, expected: number) {
  const diff = Math.abs(value - expected);
  if (diff > maxTolerance) {
    console.error(`❌ ASSERTION FAILED: ${name} frequency is ${(value * 100).toFixed(2)}%, expected ~ ${(expected * 100).toFixed(2)}% (diff: ${(diff * 100).toFixed(2)}%, tolerance: ${(maxTolerance * 100).toFixed(2)}%)`);
    process.exit(1);
  }
  console.log(`✅ ASSERTION PASSED: ${name} is ${(value * 100).toFixed(2)}% (expected ~ ${(expected * 100).toFixed(2)}%)`);
}

console.log(`\n🌙 Astronomical Event: FULL MOON (Tộc Thuỷ Nguyệt +15% Weight)`);
assertRange('Normal Cups Draw', normalCupsFreq, 0.1795);
assertRange('Full Moon Cups Draw', fullMoonCupsFreq, 0.2008);

console.log(`\n🌑 Astronomical Event: NEW MOON (Aces/Khởi Nguyên +15% Weight)`);
assertRange('Normal Aces Draw', normalAcesFreq, 0.0513);
assertRange('New Moon Aces Draw', newMoonAcesFreq, 0.0583);

console.log(`\n🪐 Astronomical Event: MERCURY RETROGRADE (Reversal rate: 65%)`);
assertRange('Normal Reversal', normalReversalFreq, 0.3000);
assertRange('Mercury Retrograde Reversal', retrogradeReversalFreq, 0.6500);

console.log(`\n🎉 Test suite validation complete. All draw engine simulations passed.`);
process.exit(0);
