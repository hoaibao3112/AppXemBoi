async function testEndpoints() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  console.log(`===================================================`);
  console.log(`🚀 INTEGRATION TEST: AUTH & TAROT READING API ENDPOINTS`);
  console.log(`Target server: ${baseUrl}`);
  console.log(`===================================================`);

  const testEmail = `lukhach.${Date.now()}@coivothuong.com`;
  const testPassword = 'mystic_password_123';
  const birthDate = '1998-07-15'; // Expected Soul Card sum = 4 (the-emperor / Sứ Giả Đá Nền)

  let token = '';

  // 1. Test registration & Soul Card calculation
  console.log('\n--- 1. Testing Registration (/api/auth/register) ---');
  try {
    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        name: 'Lữ Khách Phương Xa',
        birthDate: birthDate
      })
    });

    const regData = await regRes.json();
    if (!regRes.ok) {
      console.error(`❌ Registration failed (${regRes.status}):`, regData);
      return;
    }

    console.log('✅ Registration Successful!');
    console.log(`  User ID: ${regData.user.id}`);
    console.log(`  Email: ${regData.user.email}`);
    console.log(`  Birthdate: ${regData.user.birthDate}`);
    console.log(`  Soul Card (Computed): ${regData.user.soulCard}`);
    console.log(`  Expected Soul Card: the-emperor (Sum: 1+9+9+8+0+7+1+5 = 40 -> 4+0 = 4)`);
    
    if (regData.user.soulCard === 'the-emperor') {
      console.log('  🎉 SUCCESS: Soul Card calculated correctly!');
    } else {
      console.error(`  ❌ ERROR: Soul Card calculation mismatch. Got: ${regData.user.soulCard}`);
    }

    token = regData.token;
  } catch (err) {
    console.error('❌ Connection error during registration:', err);
    console.log('\n💡 PLEASE NOTE: Ensure Next.js dev server is running on http://localhost:3000 and PostgreSQL database is running.');
    return;
  }

  // 2. Test login
  console.log('\n--- 2. Testing Login (/api/auth/login) ---');
  try {
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });

    const loginData = await loginRes.json();
    if (!loginRes.ok) {
      console.error(`❌ Login failed (${loginRes.status}):`, loginData);
      return;
    }

    console.log('✅ Login Successful!');
    console.log(`  Acquired token (first 30 chars): ${loginData.token.substring(0, 30)}...`);
  } catch (err) {
    console.error('❌ Connection error during login:', err);
    return;
  }

  // 3. Test Tarot Reading API (Protected Route)
  console.log('\n--- 3. Testing Core Reading API (/api/tarot/reading) ---');
  try {
    const readingRes = await fetch(`${baseUrl}/api/tarot/reading`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        question: 'Liệu mối quan hệ của chúng tôi có cơ hội để bắt đầu lại không?',
        celestialEvents: {
          isFullMoon: true,
          isMercuryRetrograde: false
        }
      })
    });

    const readingData = await readingRes.json();
    if (!readingRes.ok) {
      console.error(`❌ Drawing reading failed (${readingRes.status}):`, readingData);
      return;
    }

    console.log('✅ Tarot Reading Successful!');
    console.log(`  Reading ID: ${readingData.readingId}`);
    console.log(`  Greeting of Vọng: "${readingData.greeting}"`);
    console.log(`  Cards Drawn:`);
    readingData.cards.forEach((c: any, i: number) => {
      console.log(`    [Card ${i + 1}] ${c.name} (${c.englishName}) - Clan: ${c.clan} - Position: ${c.isReversed ? 'REVERSED (Ngược)' : 'UPRIGHT (Xuôi)'}`);
    });
    
    if (readingData.combo) {
      console.log(`  Special Combo Detected: [${readingData.combo.name}] - ${readingData.combo.description}`);
    } else if (readingData.elementalRelation) {
      console.log(`  Elemental Affinity: ${readingData.elementalRelation.relation} (${readingData.elementalRelation.orientation})`);
    }

    console.log(`\n  Dialogue Commentary of Vọng:\n  "${readingData.commentary.replace(/\n/g, '\n  ')}"`);
    console.log(`\n  Dialogue Choices (ERC Paths):`);
    readingData.choices.forEach((ch: any) => {
      console.log(`    [Choice ${ch.id}] "${ch.text}" -> ERC Change: ${ch.ercChange}`);
    });

  } catch (err) {
    console.error('❌ Connection error during reading:', err);
  }

  console.log(`\n===================================================`);
  console.log(`🎉 Endpoint tests execution complete.`);
  console.log(`===================================================`);
}

testEndpoints();
