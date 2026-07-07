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

console.log(`\n🌙 Astronomical Event: FULL MOON (Tộc Thuỷ Nguyệt +15% Weight)`);
console.log(`  - Normal draw Cups frequency: ${(normalCupsCount / iterations * 100).toFixed(2)}% (Expected ~17.95%)`);
console.log(`  - Full Moon Cups draw frequency: ${(fullMoonCupsCount / iterations * 100).toFixed(2)}% (Expected ~20.08%)`);

console.log(`\n🌑 Astronomical Event: NEW MOON (Aces/Khởi Nguyên +15% Weight)`);
console.log(`  - Normal draw Aces frequency: ${(normalAcesCount / iterations * 100).toFixed(2)}% (Expected ~5.13%)`);
console.log(`  - New Moon Aces draw frequency: ${(newMoonAcesCount / iterations * 100).toFixed(2)}% (Expected ~5.83%)`);

console.log(`\n🪐 Astronomical Event: MERCURY RETROGRADE (Reversal rate: 65%)`);
console.log(`  - Normal draw Reversal frequency: ${(normalReversalCount / iterations * 100).toFixed(2)}% (Expected ~30.00%)`);
console.log(`  - Mercury Retrograde Reversal frequency: ${(retrogradeReversalCount / iterations * 100).toFixed(2)}% (Expected ~65.00%)`);
console.log(`\nTest suite validation complete.`);
