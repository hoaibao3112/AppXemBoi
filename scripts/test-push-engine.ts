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
  const { runPushDispatcher } = await import('../lib/push-dispatcher');

  console.log('===================================================');
  console.log('🚀 PERSONALIZED PUSH ENGINE CRON TESTS 🚀');
  console.log('===================================================');

  // 1. Create a test user A (Warm ThuyNguyet)
  const emailA = `test-push-${Date.now()}@test.com`;
  const user = await prisma.user.create({
    data: {
      email: emailA,
      password: 'hashed-password',
      name: 'Test Lữ Khách Push',
      clan: 'ThuyNguyet',
      erc: 50,
      pushToken: 'mock-token-user-a',
    }
  });
  console.log(`Created test user: ${user.id} (${emailA})`);

  try {
    // -----------------------------------------------------------------
    // TEST 1: Memory Pending Trigger (Highest Priority)
    // -----------------------------------------------------------------
    console.log('\n--- 1. Testing Memory Pending Trigger (Warm ThuyNguyet) ---');
    
    // Unlock memory index 1
    await prisma.unlockedMemory.create({
      data: {
        userId: user.id,
        memoryIndex: 1
      }
    });

    const stats1 = await runPushDispatcher();
    console.log('Dispatcher Stats:', stats1);

    const log1 = await prisma.pushLog.findFirst({
      where: { userId: user.id, triggerType: 'memory_pending' }
    });

    console.log('Sent Log Content:', log1);
    if (stats1.sent === 1 && log1 && log1.messageText.includes('Thủy Nguyệt') && log1.messageText.includes('Tiếng Vọng Từ Ký Ức')) {
      console.log('✅ PASS: Memory pending triggered, personalized for ThuyNguyet and warm tone.');
    } else {
      console.log('❌ FAIL: Memory pending test failed.');
    }

    // -----------------------------------------------------------------
    // TEST 2: Prophecy Pending Trigger (Warm Tone)
    // -----------------------------------------------------------------
    console.log('\n--- 2. Testing Prophecy Pending Trigger ---');
    
    // Clear logs to bypass 20h limit
    await prisma.pushLog.deleteMany({ where: { userId: user.id } });
    await prisma.pushTrigger.deleteMany({ where: { userId: user.id } });
    await prisma.unlockedMemory.deleteMany({ where: { userId: user.id } });

    // Create eligible unverified reading (5 days old)
    const reading = await prisma.reading.create({
      data: {
        userId: user.id,
        question: 'Tôi trăn trở về chuyện tình cảm liệu có thành công?',
        cards: ['the-lovers|upright'],
        response: 'Vọng chúc phúc.',
        ercChange: 0,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days old
        questionTopicTag: 'tinh_cam'
      }
    });

    const stats2 = await runPushDispatcher();
    console.log('Dispatcher Stats:', stats2);

    const log2 = await prisma.pushLog.findFirst({
      where: { userId: user.id, triggerType: 'prophecy_pending' }
    });

    console.log('Sent Log Content:', log2);
    if (stats2.sent === 1 && log2 && log2.messageText.includes('tình cảm') && log2.messageText.includes('Lời Hẹn Của Sương Mù')) {
      console.log('✅ PASS: Prophecy pending successfully triggered and topic tag mapped correctly.');
    } else {
      console.log('❌ FAIL: Prophecy pending test failed.');
    }

    // -----------------------------------------------------------------
    // TEST 3: Priority Resolution (Memory > Prophecy)
    // -----------------------------------------------------------------
    console.log('\n--- 3. Testing Priority Resolution (Memory > Prophecy) ---');
    
    // Clear logs
    await prisma.pushLog.deleteMany({ where: { userId: user.id } });
    await prisma.pushTrigger.deleteMany({ where: { userId: user.id } });

    // Both memory index 2 is pending AND prophecy is pending (reading is still there)
    await prisma.unlockedMemory.create({
      data: {
        userId: user.id,
        memoryIndex: 2
      }
    });

    const stats3 = await runPushDispatcher();
    console.log('Dispatcher Stats:', stats3);

    const triggerLog = await prisma.pushLog.findFirst({
      where: { userId: user.id }
    });

    console.log('Sent Trigger Type:', triggerLog?.triggerType);
    if (stats3.sent === 1 && triggerLog?.triggerType === 'memory_pending') {
      console.log('✅ PASS: Memory trigger took priority over Prophecy trigger.');
    } else {
      console.log('❌ FAIL: Priority check failed.');
    }

    // -----------------------------------------------------------------
    // TEST 4: Deduplication 48h / 20h limit checking
    // -----------------------------------------------------------------
    console.log('\n--- 4. Testing In-day Deduplication (Limit 1 push / day) ---');
    
    // Do NOT clear log from Test 3 (which was sent just seconds ago)
    const stats4 = await runPushDispatcher();
    console.log('Dispatcher Stats:', stats4);

    if (stats4.sent === 0 && stats4.skippedDedup === 0) {
      console.log('✅ PASS: Sent 0 pushes because user is already notified within 20 hours.');
    } else {
      console.log('❌ FAIL: Deduplication bypass detected.');
    }

  } finally {
    // Clean up test data
    console.log('\nCleaning up test user & push records...');
    await prisma.pushLog.deleteMany({ where: { userId: user.id } });
    await prisma.pushTrigger.deleteMany({ where: { userId: user.id } });
    await prisma.unlockedMemory.deleteMany({ where: { userId: user.id } });
    await prisma.reading.deleteMany({ where: { userId: user.id } });
    await prisma.user.delete({ where: { id: user.id } });
    console.log('Cleanup complete.');
  }
}

runTests();
