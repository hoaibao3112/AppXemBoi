const fs = require('fs');
const path = require('path');

const cardSuits = [
  { prefix: '', cards: ['the-fool', 'the-magician', 'the-high-priestess', 'the-empress', 'the-emperor', 'the-hierophant', 'the-lovers', 'the-chariot', 'strength', 'the-hermit', 'wheel-of-fortune', 'justice', 'the-hanged-man', 'death', 'temperance', 'the-devil', 'the-tower', 'the-star', 'the-moon', 'the-sun', 'judgement', 'the-world'] },
  { prefix: 'wands', cards: ['ace', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'page', 'knight', 'queen', 'king'] },
  { prefix: 'cups', cards: ['ace', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'page', 'knight', 'queen', 'king'] },
  { prefix: 'swords', cards: ['ace', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'page', 'knight', 'queen', 'king'] },
  { prefix: 'pentacles', cards: ['ace', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'page', 'knight', 'queen', 'king'] }
];

const cardsDir = path.join(__dirname, '..', 'public', 'cards');
let missingCount = 0;
let totalChecked = 0;

console.log('Verifying all 78 tarot cards in public/cards...');

cardSuits.forEach(suit => {
  suit.cards.forEach(card => {
    let filename = '';
    if (suit.prefix === '') {
      filename = `${card}.png`;
    } else {
      filename = `${card}-of-${suit.prefix}.png`;
    }
    
    totalChecked++;
    const filePath = path.join(cardsDir, filename);
    if (!fs.existsSync(filePath)) {
      console.error(` -> Missing: ${filename}`);
      missingCount++;
    }
  });
});

console.log(`\nVerification Summary:`);
console.log(` - Total Checked: ${totalChecked}`);
console.log(` - Missing: ${missingCount}`);
if (missingCount === 0) {
  console.log(` SUCCESS: All 78 cards are present in the public/cards folder!`);
} else {
  console.error(` FAILURE: ${missingCount} cards are missing!`);
}
