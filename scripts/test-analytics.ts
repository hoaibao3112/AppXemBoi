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
  const { POST: logEventRoute } = await import('../app/api/events/route');
  const { POST: verifyRoute } = await import('../app/api/tarot/verify/route');
  const { runPushDispatcher } = await import('../lib/push-dispatcher');

  console.log('===================================================');
  console.log('📊 TESTING EVENT TRACKING & ANALYTICS FLOW 📊');
  console.log('===================================================');

  // 1. Create test user
  const email = `test-analytics-${Date.now()}@test.com`;
  const user = await prisma.user.create({
    data: {
      email,
      password: 'hashed-password',
      name: 'Test Lữ Khách Analytics',
      clan: 'DiemHoa',
      erc: 10,
      pushToken: 'mock-token-analytics',
    }
  });
  console.log(`Created test user: ${user.id} (${email})`);

  try {
    // -----------------------------------------------------------------
    // 1. Simulate frontend rendering Đúng/Sai buttons (verify_prompt_shown)
    // -----------------------------------------------------------------
    console.log('\n- Simulating: verify_prompt_shown');
    const reading = await prisma.reading.create({
      data: {
        userId: user.id,
        question: 'Ngày mai thế nào?',
        cards: ['the-fool|upright'],
        response: 'Vọng bảo đi thôi.',
        ercChange: 0,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days old (eligible)
        questionTopicTag: 'cong_viec'
      }
    });

    const promptReq = new NextRequest('http://localhost/api/events', {
      method: 'POST',
      headers: {
        'x-user-id': user.id,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        eventType: 'verify_prompt_shown',
        relatedEntityId: reading.id
      })
    });

    const promptRes = await logEventRoute(promptReq);
    console.log('Event log status:', promptRes.status);

    // -----------------------------------------------------------------
    // 2. Simulate user clicking "Đúng" (verify_clicked_correct)
    // -----------------------------------------------------------------
    console.log('\n- Simulating: verify_clicked_correct via verify API');
    const clickReq = new NextRequest('http://localhost/api/tarot/verify', {
      method: 'POST',
      headers: {
        'x-user-id': user.id,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        readingId: reading.id,
        status: 'correct'
      })
    });

    const clickRes = await verifyRoute(clickReq);
    console.log('Verify click status:', clickRes.status);

    // Verify click event recorded in AppEvent table
    const recordedClickEvent = await prisma.appEvent.findFirst({
      where: { userId: user.id, eventType: 'verify_clicked_correct' }
    });
    console.log('Recorded click event:', recordedClickEvent);

    // -----------------------------------------------------------------
    // 3. Simulate push sent (push_sent)
    // -----------------------------------------------------------------
    console.log('\n- Simulating: push_sent via push dispatcher');
    // Unlock memory to trigger a memory_pending push trigger
    await prisma.unlockedMemory.create({
      data: {
        userId: user.id,
        memoryIndex: 1
      }
    });

    const pushStats = await runPushDispatcher();
    console.log('Push dispatch stats:', pushStats);

    const recordedPushEvent = await prisma.appEvent.findFirst({
      where: { userId: user.id, eventType: 'push_sent' }
    });
    console.log('Recorded push_sent event:', recordedPushEvent);

    // -----------------------------------------------------------------
    // 4. Simulate user opening the app via push deep link (push_opened)
    // -----------------------------------------------------------------
    console.log('\n- Simulating: push_opened via deep link event');
    const pushLog = await prisma.pushLog.findFirst({
      where: { userId: user.id }
    });
    console.log('Created push log ID:', pushLog?.id);

    if (pushLog) {
      const openedReq = new NextRequest('http://localhost/api/events', {
        method: 'POST',
        headers: {
          'x-user-id': user.id,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          eventType: 'push_opened',
          relatedEntityId: pushLog.id
        })
      });

      const openedRes = await logEventRoute(openedReq);
      console.log('Push opened log status:', openedRes.status);
    }

    // -----------------------------------------------------------------
    // 5. Trigger the report-engagement console script to check output
    // -----------------------------------------------------------------
    console.log('\n- Running engagement metrics calculation...');
    const totalShown = await prisma.appEvent.count({
      where: { eventType: 'verify_prompt_shown' }
    });

    const correctClicks = await prisma.appEvent.count({
      where: { eventType: 'verify_clicked_correct' }
    });
    const incorrectClicks = await prisma.appEvent.count({
      where: { eventType: 'verify_clicked_incorrect' }
    });
    const snoozeClicks = await prisma.appEvent.count({
      where: { eventType: 'verify_clicked_snooze' }
    });

    const totalClicks = correctClicks + incorrectClicks + snoozeClicks;
    const clickPercent = totalShown > 0 ? (totalClicks / totalShown) * 100 : 0;

    console.log('\n>>> STAGES OUTPUT Assertions <<<');
    console.log(`- shown: ${totalShown}, clicks: ${totalClicks} (${clickPercent.toFixed(1)}% Conversion)`);
    console.log(`- correct: ${correctClicks}, incorrect: ${incorrectClicks}, snooze: ${snoozeClicks}`);
    
    if (totalShown === 1 && totalClicks === 1 && correctClicks === 1) {
      console.log('✅ PASS: Shown-to-click metrics successfully tracked and compiled.');
    } else {
      console.log('❌ FAIL: Analytical metrics assertions mismatch.');
    }

  } finally {
    // Clean up test data
    console.log('\nCleaning up test user & analytics records...');
    await prisma.appEvent.deleteMany({ where: { userId: user.id } });
    await prisma.pushLog.deleteMany({ where: { userId: user.id } });
    await prisma.pushTrigger.deleteMany({ where: { userId: user.id } });
    await prisma.unlockedMemory.deleteMany({ where: { userId: user.id } });
    await prisma.reading.deleteMany({ where: { userId: user.id } });
    await prisma.user.delete({ where: { id: user.id } });
    console.log('Cleanup complete.');
  }
}

runTests();
