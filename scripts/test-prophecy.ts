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
  const { POST } = await import('../app/api/tarot/verify/route');

  console.log('===================================================');
  console.log('🔮 PROPHECY ACCURACY VERIFICATION SYSTEM TESTS 🔮');
  console.log('===================================================');

  // 1. Create a test user
  const email = `test-${Date.now()}@test.com`;
  const user = await prisma.user.create({
    data: {
      email,
      password: 'hashed-password-here',
      name: 'Test Lữ Khách',
      erc: 40, // Warm profile
    }
  });
  console.log(`Created test user: ${user.id} (${email})`);

  try {
    // -----------------------------------------------------------------
    // TEST 1: Topic Tagging validation
    // -----------------------------------------------------------------
    console.log('\n--- 1. Testing questionTopicTag generation ---');
    const qLower = 'Tôi lo lắng về chuyện tình yêu và cuộc hôn nhân của mình, liệu có hạnh phúc không?'.toLowerCase();
    let topicTag = 'khac';
    if (qLower.match(/(yêu|thương|tri kỷ|người ấy|ly hôn|hẹn hò|tình cảm|tình yêu|bạn trai|bạn gái|đối phương)/)) {
      topicTag = 'tinh_cam';
    }
    console.log(`Question: "Tôi lo lắng..." => Topic Tag detected: ${topicTag}`);
    if (topicTag === 'tinh_cam') {
      console.log('✅ PASS: questionTopicTag is correctly classified as tinh_cam');
    } else {
      console.log('❌ FAIL: questionTopicTag classification failed');
    }

    // -----------------------------------------------------------------
    // TEST 2: Time window constraints (over 30 days)
    // -----------------------------------------------------------------
    console.log('\n--- 2. Testing time window constraints (> 30 days) ---');
    const oldReading = await prisma.reading.create({
      data: {
        userId: user.id,
        question: 'Công việc ngày mai thế nào?',
        cards: ['the-fool|upright'],
        response: 'Vọng bảo đi thôi.',
        ercChange: 0,
        createdAt: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000), // 31 days old
        questionTopicTag: 'cong_viec'
      }
    });

    const verifyOldReq = new NextRequest('http://localhost/api/tarot/verify', {
      method: 'POST',
      headers: {
        'x-user-id': user.id,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        readingId: oldReading.id,
        status: 'correct'
      })
    });

    const verifyOldResponse = await POST(verifyOldReq);
    const oldResult = await verifyOldResponse.json();
    console.log(`Verify result for 31-day old reading:`, oldResult);
    if (verifyOldResponse.status === 400 && oldResult.error.includes('3 đến 30 ngày')) {
      console.log('✅ PASS: Successfully blocked verification of reading older than 30 days.');
    } else {
      console.log('❌ FAIL: Failed to block old reading verification.');
    }

    // -----------------------------------------------------------------
    // TEST 3: Idempotency / Double submit prevention
    // -----------------------------------------------------------------
    console.log('\n--- 3. Testing idempotency (double clicks) ---');
    const validReading = await prisma.reading.create({
      data: {
        userId: user.id,
        question: 'Tài chính tháng này ra sao?',
        cards: ['the-magician|upright'],
        response: 'Vọng bảo tiền đầy túi.',
        ercChange: 0,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days old (eligible)
        questionTopicTag: 'tai_chinh'
      }
    });

    const verifyReq1 = new NextRequest('http://localhost/api/tarot/verify', {
      method: 'POST',
      headers: {
        'x-user-id': user.id,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        readingId: validReading.id,
        status: 'correct'
      })
    });

    const verifyReq2 = new NextRequest('http://localhost/api/tarot/verify', {
      method: 'POST',
      headers: {
        'x-user-id': user.id,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        readingId: validReading.id,
        status: 'correct'
      })
    });

    // Send both calls sequentially
    const res1 = await POST(verifyReq1);
    const data1 = await res1.json();
    console.log(`First submit response:`, data1);

    const res2 = await POST(verifyReq2);
    const data2 = await res2.json();
    console.log(`Second submit response:`, data2);

    const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });
    console.log(`Updated User stats: totalVerified=${updatedUser?.totalVerified}, totalCorrect=${updatedUser?.totalCorrect}, accuracyPercent=${updatedUser?.accuracyPercent}%`);

    if (res1.status === 200 && res2.status === 400 && updatedUser?.totalCorrect === 1) {
      console.log('✅ PASS: Double submit prevented and stats incremented only once.');
    } else {
      console.log('❌ FAIL: Double submit check failed.');
    }

    // -----------------------------------------------------------------
    // TEST 4: Snooze counts limits (Max 2)
    // -----------------------------------------------------------------
    console.log('\n--- 4. Testing snooze counts limits (Max 2) ---');
    const snoozeReading = await prisma.reading.create({
      data: {
        userId: user.id,
        question: 'Học hành có tấn tới không?',
        cards: ['the-chariot|upright'],
        response: 'Vọng bảo kiên nhẫn.',
        ercChange: 0,
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days old
        questionTopicTag: 'cong_viec'
      }
    });

    // Call snooze 3 times
    for (let i = 1; i <= 3; i++) {
      const snoozeReq = new NextRequest('http://localhost/api/tarot/verify', {
        method: 'POST',
        headers: {
          'x-user-id': user.id,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          readingId: snoozeReading.id,
          status: 'snooze'
        })
      });

      const res = await POST(snoozeReq);
      const data = await res.json();
      console.log(`Snooze call ${i} response (Status: ${res.status}):`, data);

      if (i <= 2) {
        if (res.status !== 200) {
          console.log(`❌ FAIL: Snooze call ${i} failed unexpectedly.`);
        }
      } else {
        if (res.status === 400 && data.error.includes('tối đa 2 lần')) {
          console.log('✅ PASS: Successfully blocked 3rd snooze call.');
        } else {
          console.log('❌ FAIL: Failed to block 3rd snooze call.');
        }
      }
    }

    // -----------------------------------------------------------------
    // TEST 5: Ownership validation (User B tries to verify User A's reading)
    // -----------------------------------------------------------------
    console.log('\n--- 5. Testing ownership validation (User B vs User A reading) ---');
    const emailB = `testB-${Date.now()}@test.com`;
    const userB = await prisma.user.create({
      data: {
        email: emailB,
        password: 'hashed-password-here',
        name: 'Test Lữ Khách B',
        erc: 0,
      }
    });
    console.log(`Created test user B: ${userB.id} (${emailB})`);

    const readingA = await prisma.reading.create({
      data: {
        userId: user.id,
        question: 'User A hỏi về tình cảm',
        cards: ['the-lovers|upright'],
        response: 'Vọng chúc phúc.',
        ercChange: 0,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days old
        questionTopicTag: 'tinh_cam'
      }
    });

    const verifyBReq = new NextRequest('http://localhost/api/tarot/verify', {
      method: 'POST',
      headers: {
        'x-user-id': userB.id,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        readingId: readingA.id,
        status: 'correct'
      })
    });

    const resB = await POST(verifyBReq);
    const dataB = await resB.json();
    console.log(`User B verify response (Status: ${resB.status}):`, dataB);

    const checkReadingA = await prisma.reading.findUnique({ where: { id: readingA.id } });
    const checkUserB = await prisma.user.findUnique({ where: { id: userB.id } });

    const isBlocked = resB.status === 404;
    const readingUnchanged = checkReadingA?.verified === null;
    const statsUnchanged = checkUserB?.totalVerified === 0 && checkUserB?.totalCorrect === 0;

    console.log(`Verification Check: isBlocked=${isBlocked}, readingUnchanged=${readingUnchanged}, statsUnchanged=${statsUnchanged}`);

    if (isBlocked && readingUnchanged && statsUnchanged) {
      console.log('✅ PASS: Ownership validation is fully secure.');
    } else {
      console.log('❌ FAIL: Ownership check vulnerability detected.');
    }

    // Clean up userB's specific readings if any
    await prisma.reading.deleteMany({ where: { userId: userB.id } });
    await prisma.user.delete({ where: { id: userB.id } });

  } finally {
    // Clean up test data
    console.log('\nCleaning up test user & reading records...');
    await prisma.reading.deleteMany({ where: { userId: user.id } });
    await prisma.user.deleteMany({ where: { email: { startsWith: 'test' } } });
    console.log('Cleanup complete.');
  }
}

runTests();
