const fs = require('fs');
const path = require('path');

const cards = [
  // Swords (Phong Kiếm) - grey and ice blue theme, crystal swords
  {
    id: "five-of-swords",
    prompt: "A smug warrior holding three swords, looking at two defeated figures in the background who left their swords on the ground, windy sky, dark fantasy tarot card illustration, grey and ice blue theme, glowing neon highlights, mystic runes, crystal swords, ethereal mist, high contrast, cinematic lighting, gothic fantasy art style, clear borders, no text"
  },
  {
    id: "six-of-swords",
    prompt: "A ferryman rowing a boat carrying a passenger towards a quiet shore, six swords standing upright in the boat, calm waters ahead, dark fantasy tarot card illustration, grey and ice blue theme, glowing neon highlights, mystic runes, crystal swords, ethereal mist, high contrast, cinematic lighting, gothic fantasy art style, clear borders, no text"
  },
  {
    id: "seven-of-swords",
    prompt: "A thief carrying away five swords from an enemy camp, looking back at two swords left behind, stealthy night setting, dark fantasy tarot card illustration, grey and ice blue theme, glowing neon highlights, mystic runes, crystal swords, ethereal mist, high contrast, cinematic lighting, gothic fantasy art style, clear borders, no text"
  },
  {
    id: "eight-of-swords",
    prompt: "A bound and blindfolded figure surrounded by a cage of eight swords planted in the muddy ground, castle in the background, mental trap, dark fantasy tarot card illustration, grey and ice blue theme, glowing neon highlights, mystic runes, crystal swords, ethereal mist, high contrast, cinematic lighting, gothic fantasy art style, clear borders, no text"
  },
  {
    id: "nine-of-swords",
    prompt: "A figure sitting up in bed, face buried in hands, nine swords hanging on the wall above them, nightmare and anxiety theme, dark fantasy tarot card illustration, grey and ice blue theme, glowing neon highlights, mystic runes, crystal swords, ethereal mist, high contrast, cinematic lighting, gothic fantasy art style, clear borders, no text"
  },
  {
    id: "ten-of-swords",
    prompt: "A figure lying face down on a dark beach, ten swords pierced into their back, a yellow dawn breaking in the far horizon, end of pain, dark fantasy tarot card illustration, grey and ice blue theme, glowing neon highlights, mystic runes, crystal swords, ethereal mist, high contrast, cinematic lighting, gothic fantasy art style, clear borders, no text"
  },
  {
    id: "page-of-swords",
    prompt: "A young agile warrior holding a sword in both hands, standing on a windy hill, storm clouds gather, watchful expression, dark fantasy tarot card illustration, grey and ice blue theme, glowing neon highlights, mystic runes, crystal swords, ethereal mist, high contrast, cinematic lighting, gothic fantasy art style, clear borders, no text"
  },
  {
    id: "knight-of-swords",
    prompt: "A knight charging forward on a horse into a storm, holding a sword high, wind blowing wildly, aggression and speed, dark fantasy tarot card illustration, grey and ice blue theme, glowing neon highlights, mystic runes, crystal swords, ethereal mist, high contrast, cinematic lighting, gothic fantasy art style, clear borders, no text"
  },
  {
    id: "queen-of-swords",
    prompt: "A stern queen sitting on a throne of clouds, holding a sword upright, left hand extended, looking ahead with absolute clarity, dark fantasy tarot card illustration, grey and ice blue theme, glowing neon highlights, mystic runes, crystal swords, ethereal mist, high contrast, cinematic lighting, gothic fantasy art style, clear borders, no text"
  },
  {
    id: "king-of-swords",
    prompt: "A judge king sitting on a throne, holding a sword of justice, stern face, wind blowing his cloak, stardust in the background, dark fantasy tarot card illustration, grey and ice blue theme, glowing neon highlights, mystic runes, crystal swords, ethereal mist, high contrast, cinematic lighting, gothic fantasy art style, clear borders, no text"
  },

  // Pentacles (Thổ Kim) - green and gold theme, jade coins
  {
    id: "ace-of-pentacles",
    prompt: "A hand emerging from glowing vines, holding a large jade coin with glowing gold runes, lush green forest background, dark fantasy tarot card illustration, green and gold theme, glowing neon highlights, mystic runes, glowing vines, jade coins, ethereal mist, high contrast, cinematic lighting, gothic fantasy art style, clear borders, no text"
  },
  {
    id: "two-of-pentacles",
    prompt: "A dancer juggling two glowing green coins connected by a golden infinity ribbon, turbulent waves in the background, dark fantasy tarot card illustration, green and gold theme, glowing neon highlights, mystic runes, glowing vines, jade coins, ethereal mist, high contrast, cinematic lighting, gothic fantasy art style, clear borders, no text"
  },
  {
    id: "three-of-pentacles",
    prompt: "A stonemason working on a cathedral, two priests holding architectural plans, three glowing green coins carved on the wall, dark fantasy tarot card illustration, green and gold theme, glowing neon highlights, mystic runes, glowing vines, jade coins, ethereal mist, high contrast, cinematic lighting, gothic fantasy art style, clear borders, no text"
  },
  {
    id: "four-of-pentacles",
    prompt: "A hoarder holding one green coin tight, stepping on two, and wearing one on his head, standing in a dark obsidian city, greed theme, dark fantasy tarot card illustration, green and gold theme, glowing neon highlights, mystic runes, glowing vines, jade coins, ethereal mist, high contrast, cinematic lighting, gothic fantasy art style, clear borders, no text"
  },
  {
    id: "five-of-pentacles",
    prompt: "Two beggars walking in a snowy storm, passing by a stained glass church window glowing with five green coins, hardship theme, dark fantasy tarot card illustration, green and gold theme, glowing neon highlights, mystic runes, glowing vines, jade coins, ethereal mist, high contrast, cinematic lighting, gothic fantasy art style, clear borders, no text"
  },
  {
    id: "six-of-pentacles",
    prompt: "A wealthy figure in robes giving glowing coins to two kneeling beggars, scales in hand, charity theme, dark fantasy tarot card illustration, green and gold theme, glowing neon highlights, mystic runes, glowing vines, jade coins, ethereal mist, high contrast, cinematic lighting, gothic fantasy art style, clear borders, no text"
  },
  {
    id: "seven-of-pentacles",
    prompt: "A tired farmer leaning on his shovel, looking at a vine growing seven glowing green coins, waiting for harvest, dark fantasy tarot card illustration, green and gold theme, glowing neon highlights, mystic runes, glowing vines, jade coins, ethereal mist, high contrast, cinematic lighting, gothic fantasy art style, clear borders, no text"
  },
  {
    id: "eight-of-pentacles",
    prompt: "A craftsman carving runes onto eight green coins hung on a wall, workshop setting, focus and dedication, dark fantasy tarot card illustration, green and gold theme, glowing neon highlights, mystic runes, glowing vines, jade coins, ethereal mist, high contrast, cinematic lighting, gothic fantasy art style, clear borders, no text"
  },
  {
    id: "nine-of-pentacles",
    prompt: "A noblewoman standing in a lush vineyard, a falcon resting on her glove, nine glowing coins on the vines, abundance theme, dark fantasy tarot card illustration, green and gold theme, glowing neon highlights, mystic runes, glowing vines, jade coins, ethereal mist, high contrast, cinematic lighting, gothic fantasy art style, clear borders, no text"
  },
  {
    id: "ten-of-pentacles",
    prompt: "An old patriarch sitting with his dogs, a family in the background under an arch decorated with ten glowing green coins, legacy, dark fantasy tarot card illustration, green and gold theme, glowing neon highlights, mystic runes, glowing vines, jade coins, ethereal mist, high contrast, cinematic lighting, gothic fantasy art style, clear borders, no text"
  },
  {
    id: "page-of-pentacles",
    prompt: "A young scholar holding a glowing green coin, examining its ancient runes, peaceful meadow, dark fantasy tarot card illustration, green and gold theme, glowing neon highlights, mystic runes, glowing vines, jade coins, ethereal mist, high contrast, cinematic lighting, gothic fantasy art style, clear borders, no text"
  },
  {
    id: "knight-of-pentacles",
    prompt: "A steady knight on a plow horse, standing in a plowed field, holding a glowing green coin, patient guardian, dark fantasy tarot card illustration, green and gold theme, glowing neon highlights, mystic runes, glowing vines, jade coins, ethereal mist, high contrast, cinematic lighting, gothic fantasy art style, clear borders, no text"
  },
  {
    id: "queen-of-pentacles",
    prompt: "A nurturing queen sitting on a throne in a forest, holding a green coin, surrounded by flowers and a small rabbit, warm green glow, dark fantasy tarot card illustration, green and gold theme, glowing neon highlights, mystic runes, glowing vines, jade coins, ethereal mist, high contrast, cinematic lighting, gothic fantasy art style, clear borders, no text"
  },
  {
    id: "king-of-pentacles",
    prompt: "A wealthy king sitting on a throne inside a palace of gold and roots, holding a scepter and a green coin, castle garden background, dark fantasy tarot card illustration, green and gold theme, glowing neon highlights, mystic runes, glowing vines, jade coins, ethereal mist, high contrast, cinematic lighting, gothic fantasy art style, clear borders, no text"
  }
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function generateAll() {
  const cardsDir = path.join(__dirname, '..', 'public', 'cards');
  if (!fs.existsSync(cardsDir)) {
    fs.mkdirSync(cardsDir, { recursive: true });
  }

  console.log(`Starting to generate ${cards.length} tarot cards using Pollinations AI (Flux)...`);

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const outputPath = path.join(cardsDir, `${card.id}.png`);

    // Avoid overwriting if file already exists
    if (fs.existsSync(outputPath)) {
      console.log(`[${i + 1}/${cards.length}] ${card.id} already exists. Skipping.`);
      continue;
    }

    console.log(`[${i + 1}/${cards.length}] Generating image for: ${card.id}...`);
    const encodedPrompt = encodeURIComponent(card.prompt);
    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=600&height=900&model=flux&nologo=true`;

    let success = false;
    let retries = 3;

    while (retries > 0 && !success) {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`API error (${response.status}): ${response.statusText}`);
        }
        const buffer = Buffer.from(await response.arrayBuffer());
        fs.writeFileSync(outputPath, buffer);
        console.log(` -> Saved successfully to public/cards/${card.id}.png`);
        success = true;
      } catch (err) {
        retries--;
        console.error(` -> Error generating ${card.id}: ${err.message}. Retries remaining: ${retries}`);
        if (retries > 0) {
          console.log('Waiting 5 seconds before retrying...');
          await sleep(5000);
        }
      }
    }

    if (!success) {
      console.error(`Failed to generate ${card.id} after all retries.`);
    }

    // Delay 1.5 seconds between generations to be polite to the API
    await sleep(1500);
  }

  console.log('All generation tasks completed!');
}

generateAll();
