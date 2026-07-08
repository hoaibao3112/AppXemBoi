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

async function runReport() {
  const { prisma } = await import('../lib/prisma');

  console.log('====================================================');
  console.log('📊   BÁO CÁO HIỆU QUẢ TƯƠNG TÁC (ENGAGEMENT REPORT) 📊');
  console.log('====================================================');

  // --- 1. Prophecy Verification Conversion Rates ---
  console.log('\n--- I. ĐỐI CHIẾU TIÊN TRI (PROPHECY ACCURACY STATS) ---');
  
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

  console.log(`- Số quẻ bói hiện nút đối chiếu (verify_prompt_shown): ${totalShown}`);
  console.log(`- Tổng số lượt click phản hồi: ${totalClicks} (${clickPercent.toFixed(1)}% tỉ lệ phản hồi)`);
  
  if (totalClicks > 0) {
    const correctPercent = (correctClicks / totalClicks) * 100;
    const incorrectPercent = (incorrectClicks / totalClicks) * 100;
    const snoozePercent = (snoozeClicks / totalClicks) * 100;

    console.log(`  + Đúng 👍 : ${correctClicks} (${correctPercent.toFixed(1)}%)`);
    console.log(`  + Sai 👎 : ${incorrectClicks} (${incorrectPercent.toFixed(1)}%)`);
    console.log(`  + Chưa rõ ⏳ : ${snoozeClicks} (${snoozePercent.toFixed(1)}%)`);
  } else {
    console.log('  (Chưa có dữ liệu phản hồi click)');
  }

  // --- 2. Push Notification Open Rates by Trigger Type ---
  console.log('\n--- II. THÔNG BÁO ĐẨY CÁ NHÂN HÓA (PUSH OPEN RATES) ---');

  // Fetch all push sent events
  const pushSentEvents = await prisma.appEvent.findMany({
    where: { eventType: 'push_sent' }
  });

  // Fetch all push opened events
  const pushOpenedEvents = await prisma.appEvent.findMany({
    where: { eventType: 'push_opened' }
  });

  // We need to resolve trigger types for opened pushes
  // Map pushLogId -> triggerType
  const pushOpenedLogs = await prisma.pushLog.findMany({
    where: {
      id: { in: pushOpenedEvents.map(e => e.relatedEntityId).filter(Boolean) as string[] }
    },
    select: { id: true, triggerType: true }
  });
  const pushLogTriggerMap = new Map(pushOpenedLogs.map(l => [l.id, l.triggerType]));

  // Count sent pushes by trigger type
  const sentCounts: Record<string, number> = {};
  pushSentEvents.forEach(e => {
    const meta = e.metadata as any;
    const triggerType = meta?.triggerType || 'unknown';
    sentCounts[triggerType] = (sentCounts[triggerType] || 0) + 1;
  });

  // Count opened pushes by trigger type
  const openedCounts: Record<string, number> = {};
  pushOpenedEvents.forEach(e => {
    const logId = e.relatedEntityId || '';
    const triggerType = pushLogTriggerMap.get(logId) || 'unknown';
    openedCounts[triggerType] = (openedCounts[triggerType] || 0) + 1;
  });

  const allTriggerTypes = Array.from(new Set([
    ...Object.keys(sentCounts),
    ...Object.keys(openedCounts)
  ]));

  if (allTriggerTypes.length > 0) {
    const tableData = allTriggerTypes.map(type => {
      const sent = sentCounts[type] || 0;
      const opened = openedCounts[type] || 0;
      const openRate = sent > 0 ? (opened / sent) * 100 : 0;
      return {
        'Loại Trigger': type,
        'Số lượng gửi': sent,
        'Số lượng mở': opened,
        'Tỷ lệ mở (%)': `${openRate.toFixed(1)}%`
      };
    });
    console.table(tableData);
  } else {
    console.log('  (Chưa có dữ liệu gửi hoặc mở push)');
  }
}

runReport();
