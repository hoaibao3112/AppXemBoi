// Applying pattern from: nextjs-fullstack-best-practices
import * as fs from 'fs';
import * as path from 'path';

// Load environmental variables manually from .env
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

import { NextRequest } from 'next/server';

async function runTests() {
  const { prisma } = await import('../lib/prisma');
  const { POST: checkCompatibility } = await import('../app/api/compatibility/check/route');

  console.log('===================================================');
  console.log('💖 Clan Element Compatibility Engine Tests 💖');
  console.log('===================================================');

  // 1. Create a test user (Tộc Diễm Hỏa)
  const email = `test-compat-${Date.now()}@test.com`;
  const user = await prisma.user.create({
    data: {
      email,
      password: 'hashed-password',
      name: 'Lữ Khách Diễm Hỏa',
      clan: 'DiemHoa',
      erc: 40, // Warm
      birthDate: new Date('1995-04-12'),
      soulCard: 'the-emperor'
    }
  });
  console.log(`Created test user: ${user.id} (${email})`);

  try {
    // -----------------------------------------------------------------
    // TEST 1: Element compatibility calculations (Diễm Hỏa vs Thủy Nguyệt)
    // -----------------------------------------------------------------
    console.log('\n--- 1. Testing Element Compatibility Check (DiemHoa vs ThuyNguyet) ---');
    
    // Partner: "Nguyễn Hoa" birthdate "1998-07-15" (High Priestess -> ThuyNguyet)
    // DiemHoa vs ThuyNguyet -> Tension (Tương Khắc)
    const checkReq1 = new NextRequest('http://localhost/api/compatibility/check', {
      method: 'POST',
      headers: {
        'x-user-id': user.id,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        partnerName: 'Nguyễn Hoa',
        partnerBirthDate: '2000-01-09'
      })
    });

    const res1 = await checkCompatibility(checkReq1);
    const data1 = await res1.json();
    console.log(`First Check Response (Status ${res1.status}):`, data1);

    if (
      res1.status === 200 &&
      data1.check.partnerClan === 'ThuyNguyet' &&
      data1.check.relationshipBranch === 'tension' &&
      data1.check.resultText
    ) {
      console.log('✅ PASS: Partner clan computed as ThuyNguyet, branch as tension, and AI commentary generated.');
    } else {
      console.log('❌ FAIL: Element compatibility calculation failed.');
    }

    // -----------------------------------------------------------------
    // TEST 2: Weekly Rate Limit Check
    // -----------------------------------------------------------------
    console.log('\n--- 2. Testing Weekly Rate Limit (1 check per 7 days) ---');
    
    const checkReq2 = new NextRequest('http://localhost/api/compatibility/check', {
      method: 'POST',
      headers: {
        'x-user-id': user.id,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        partnerName: 'Trần Bình',
        partnerBirthDate: '1996-10-10'
      })
    });

    const res2 = await checkCompatibility(checkReq2);
    const data2 = await res2.json();
    console.log(`Second Check Response (Status ${res2.status}):`, data2);

    if (res2.status === 403 && data2.error.includes('1 lần')) {
      console.log('✅ PASS: Successfully blocked second check within 7 days.');
    } else {
      console.log('❌ FAIL: Weekly rate limit bypass detected.');
    }

  } finally {
    // Clean up test data
    console.log('\nCleaning up test user & compatibility check logs...');
    await prisma.compatibilityCheck.deleteMany({ where: { userId: user.id } });
    await prisma.user.delete({ where: { id: user.id } });
    console.log('Cleanup complete.');
  }
}

runTests();
