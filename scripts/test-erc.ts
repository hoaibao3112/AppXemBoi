const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function testErcMatrix() {
  console.log(`===================================================`);
  console.log(`🚀 TESTING ERC MATRIX (ATTITUDE & OUTRO)`);
  console.log(`===================================================`);

  const testEmail = `lukhach.erc.${Date.now()}@coivothuong.com`;
  const testPassword = 'mystic_password_123';
  
  let token = '';

  // Register
  const regRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: testPassword,
      name: 'Hành Giả Thử Nghiệm',
      birthDate: '1995-10-10'
    })
  });
  const regData = await regRes.json();
  token = regData.token;

  // Let's do 1 reading first
  console.log('\n--- 1. Initial Reading (ERC = 0) ---');
  let readRes = await fetch(`${baseUrl}/api/tarot/reading`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ question: 'Ta nên đi tiếp hay dừng lại?' })
  });
  let readData = await readRes.json();
  console.log(`Greeting: "${readData.greeting.substring(0, 150)}..."`);
  console.log(`Outro (Expected Neutral): "${readData.outro}"`);
  
  if (!readData.readingId) {
    console.error('❌ FAIL: Reading ID is missing from initial reading');
    process.exit(1);
  }

  // Let's post Choice B three times to get ERC to +30
  console.log('\n--- 2. Sending Choice B 3 times to get ERC = +30 (Hướng Dương) ---');
  let currentErc = 0;
  for (let i = 0; i < 3; i++) {
    const choiceRes = await fetch(`${baseUrl}/api/tarot/choice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        readingId: readData.readingId,
        choiceId: 'B' // +10 ERC
      })
    });
    const choiceData = await choiceRes.json();
    currentErc = choiceData.newErc;
    console.log(`Choice B sent. User ERC is now: ${currentErc}`);
  }

  if (currentErc !== 30) {
    console.error(`❌ FAIL: Expected ERC to be 30, but got ${currentErc}`);
    process.exit(1);
  }
  console.log('✅ PASS: ERC successfully incremented to +30');

  // Now, call reading again to see the updated Hướng Dương Outro & Suffix
  console.log('\n--- 3. Calling Reading with ERC = +30 ---');
  readRes = await fetch(`${baseUrl}/api/tarot/reading`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ question: 'Mối duyên này có bền chặt không?' })
  });
  readData = await readRes.json();
  console.log(`Greeting (Expected "người bạn hiền hoà" / "lữ khách hiền hoà"): "${readData.greeting}"`);
  console.log(`Outro (Expected Hướng Dương): "${readData.outro}"`);

  const hasWarmKeyword = readData.greeting.toLowerCase().includes('hiền') || readData.greeting.toLowerCase().includes('phương xa') || readData.greeting.toLowerCase().includes('bạn');
  if (!hasWarmKeyword) {
    console.error(`❌ FAIL: Greeting does not contain warm keywords for ERC = +30`);
    process.exit(1);
  }
  console.log('✅ PASS: Warm profile greeting verified.');

  // Let's post Choice A six times to get ERC to -30
  console.log('\n--- 4. Sending Choice A 6 times to get ERC = -30 (Độc Lập) ---');
  for (let i = 0; i < 6; i++) {
    const choiceRes = await fetch(`${baseUrl}/api/tarot/choice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        readingId: readData.readingId,
        choiceId: 'A' // -10 ERC
      })
    });
    const choiceData = await choiceRes.json();
    currentErc = choiceData.newErc;
    console.log(`Choice A sent. User ERC is now: ${currentErc}`);
  }

  if (currentErc !== -30) {
    console.error(`❌ FAIL: Expected ERC to be -30, but got ${currentErc}`);
    process.exit(1);
  }
  console.log('✅ PASS: ERC successfully decremented to -30');

  // Call reading again to see the updated Độc Lập Outro & Suffix
  console.log('\n--- 5. Calling Reading with ERC = -30 ---');
  readRes = await fetch(`${baseUrl}/api/tarot/reading`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ question: 'Ta có nên cắt đứt mối quan hệ này?' })
  });
  readData = await readRes.json();
  console.log(`Greeting (Expected "hành giả cô độc" / "sắc sảo"): "${readData.greeting}"`);
  console.log(`Outro (Expected Độc Lập): "${readData.outro}"`);

  const hasColdKeyword = readData.greeting.toLowerCase().includes('cô độc') || readData.greeting.toLowerCase().includes('sắc sảo') || readData.greeting.toLowerCase().includes('hành giả');
  if (!hasColdKeyword) {
    console.error(`❌ FAIL: Greeting does not contain cold keywords for ERC = -30`);
    process.exit(1);
  }
  console.log('✅ PASS: Cold profile greeting verified.');

  console.log(`\n===================================================`);
  console.log(`🎉 ERC matrix testing complete. All assertions passed.`);
  console.log(`===================================================`);
  process.exit(0);
}

testErcMatrix().catch(err => {
  console.error('❌ FAIL: Unexpected error during ERC matrix test:', err);
  process.exit(1);
});
