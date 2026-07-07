const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function runNarrativeTest() {
  console.log(`===================================================`);
  console.log(`🚀 NARRATIVE & CHOICE FLOW TEST SCRIPT`);
  console.log(`Target server: ${baseUrl}`);
  console.log(`===================================================`);

  const testEmail = `lukhach.${Date.now()}@coivothuong.com`;
  const testPassword = 'mystic_password_123';
  const birthDate = '1998-07-15'; // Soul card = the-emperor

  let token = '';
  let userId = '';

  // 1. Register
  console.log('\n--- 1. Registering User ---');
  try {
    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        name: 'Lữ Khách Hồn Nhiên',
        birthDate
      })
    });

    const regData = await regRes.json();
    if (!regRes.ok) {
      console.error(`❌ Registration failed:`, regData);
      return;
    }
    userId = regData.user.id;
    token = regData.token;
    console.log(`✅ Registered! ID: ${userId}, Soul Card: ${regData.user.soulCard}`);
  } catch (err) {
    console.error('❌ Connection error:', err);
    return;
  }

  // 2. Perform 3 Readings to trigger Memory 1 unlock
  console.log('\n--- 2. Performing 3 readings to test Clan Calculation and Memory Unlocks ---');
  for (let i = 1; i <= 3; i++) {
    console.log(`\n🔮 --- READING #${i} ---`);
    try {
      const readRes = await fetch(`${baseUrl}/api/tarot/reading`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          question: `Ta đang băn khoăn về ngã rẽ lần thứ ${i} trong đời mình.`,
          celestialEvents: {
            isFullMoon: i === 2 // Test Full Moon override on reading 2
          }
        })
      });

      const readData = await readRes.json();
      if (!readRes.ok) {
        console.error(`❌ Reading failed:`, readData);
        return;
      }

      console.log(`✅ Reading Success! ID: ${readData.readingId}`);
      console.log(`Vọng Greeting: "${readData.greeting.substring(0, 150)}..."`);
      console.log(`Outro: "${readData.outro}"`);
      if (readData.newlyUnlockedMemories && readData.newlyUnlockedMemories.length > 0) {
        console.log(`🎉 MEMORY UNLOCKED: Mảnh ${readData.newlyUnlockedMemories.join(', ')}`);
      }

      // Test posting choice
      const choiceId = i === 1 ? 'A' : i === 2 ? 'B' : 'C'; // Try different choices
      console.log(`👉 Sending Choice [${choiceId}] for this reading...`);
      
      const choiceRes = await fetch(`${baseUrl}/api/tarot/choice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          readingId: readData.readingId,
          choiceId
        })
      });

      const choiceData = await choiceRes.json();
      if (!choiceRes.ok) {
        console.error(`❌ Choice submission failed:`, choiceData);
        return;
      }
      console.log(`✅ Choice Success! ERC Change: ${choiceData.ercChange}, New ERC: ${choiceData.newErc}`);
      console.log(`Vọng Reaction: "${choiceData.reply}"`);
    } catch (err) {
      console.error(`❌ Connection error during reading #${i}:`, err);
      return;
    }
  }

  // 3. Perform 4th Reading (Expect Memory 1 to be displayed as a greeting since it is unlocked)
  console.log('\n--- 3. Performing 4th reading (Expect Unlocked Memory 1 to override greeting) ---');
  try {
    const readRes = await fetch(`${baseUrl}/api/tarot/reading`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        question: 'Hãy kể cho ta nghe tiếp câu chuyện của ngươi, Vọng.'
      })
    });

    const readData = await readRes.json();
    if (!readRes.ok) {
      console.error(`❌ 4th Reading failed:`, readData);
      return;
    }

    console.log(`✅ Reading Success!`);
    console.log(`Vọng Greeting (Expect Memory 1 dialog + outro bridge):\n`);
    console.log(`=========================================`);
    console.log(readData.greeting);
    console.log(`=========================================`);
    console.log(`Outro: "${readData.outro}"`);
  } catch (err) {
    console.error('❌ Connection error on 4th reading:', err);
  }

  // 4. Perform Daily Check-in Pine Leaf burning Ritual
  console.log('\n--- 4. Performing Daily check-in Pine Leaf burning Ritual (/api/tarot/ritual) ---');
  try {
    const ritualRes = await fetch(`${baseUrl}/api/tarot/ritual`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const ritualData = await ritualRes.json();
    if (!ritualRes.ok) {
      console.error(`❌ Ritual failed:`, ritualData);
      return;
    }

    console.log(`✅ Ritual API Success!`);
    console.log(`  Drawn Daily Card: ${ritualData.card.name} (${ritualData.card.englishName})`);
    console.log(`  Whisper of the Day: "${ritualData.whisper}"`);
    console.log(`  AI Generated: ${ritualData.isAiGenerated}`);
  } catch (err) {
    console.error('❌ Connection error during ritual check:', err);
  }

  console.log(`\n===================================================`);
  console.log(`🎉 Narrative flow integration test complete.`);
  console.log(`===================================================`);
}

runNarrativeTest();
