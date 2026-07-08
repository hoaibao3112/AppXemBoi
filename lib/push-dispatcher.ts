// Applying pattern from: nextjs-fullstack-best-practices
import { prisma } from './prisma';
import { getPushMessage } from './push-templates';
import { sendPushNotification } from './push-service';

/**
 * Hourly Cron dispatcher to find eligible users and send personalized pushes.
 */
export async function runPushDispatcher(): Promise<{
  processed: number;
  sent: number;
  skippedDedup: number;
  skippedOptout: number;
}> {
  console.log(`[PUSH ENGINE] Hourly cron execution started at ${new Date().toISOString()}`);

  const activeCutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // Active in last 90 days
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { createdAt: { gte: activeCutoff } },
        { readings: { some: { createdAt: { gte: activeCutoff } } } },
      ],
    },
    include: {
      readings: { orderBy: { createdAt: 'desc' } },
      memories: true,
      pushLogs: { orderBy: { sentAt: 'desc' } },
    },
  });

  let processedCount = 0;
  let sentCount = 0;
  let skippedDedupCount = 0;
  let skippedOptoutCount = 0;

  for (const user of users) {
    processedCount++;
    const now = new Date();

    // 1. Check if user already received any push today (within last 20 hours to prevent time drift overlap)
    const lastLog = user.pushLogs[0];
    if (lastLog) {
      const hoursSinceLastPush = (now.getTime() - lastLog.sentAt.getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastPush < 20) {
        console.log(`User ${user.id} already received push ${hoursSinceLastPush.toFixed(1)}h ago. Skipping.`);
        continue;
      }
    }

    // 2. Identify the highest priority trigger eligible for this user
    let selectedTrigger: {
      type: 'memory_pending' | 'prophecy_pending' | 'reengage_d3' | 'reengage_d7' | 'reengage_d14' | 'reengage_d30' | 'habit_time';
      relatedId?: string;
      extraData?: Record<string, string>;
    } | null = null;

    // --- TRIGGER 1: memory_pending (Memory unlocked but not yet notified) ---
    // Find unlocked memories that haven't been notified yet (no PushLog within 90 days for this memory index)
    for (const mem of user.memories) {
      const notified = user.pushLogs.some(
        (log) =>
          log.triggerType === 'memory_pending' &&
          log.relatedEntityId === String(mem.memoryIndex)
      );
      if (!notified) {
        selectedTrigger = {
          type: 'memory_pending',
          relatedId: String(mem.memoryIndex),
        };
        break;
      }
    }

    // --- TRIGGER 2: prophecy_pending (Unverified readings from 3-14 days ago) ---
    if (!selectedTrigger) {
      const eligibleReading = user.readings.find((r) => {
        const ageInMs = now.getTime() - r.createdAt.getTime();
        const ageInDays = ageInMs / (1000 * 60 * 60 * 24);
        const isAgeValid = ageInDays >= 3 && ageInDays <= 14;
        const isUnverified = r.verified === null;
        const isSnoozeOk = r.snoozeCount < 2 && (!r.snoozeUntil || r.snoozeUntil.getTime() < now.getTime());

        // Ensure we haven't already notified about this reading
        const notified = user.pushLogs.some(
          (log) => log.triggerType === 'prophecy_pending' && log.relatedEntityId === r.id
        );

        return isAgeValid && isUnverified && isSnoozeOk && !notified;
      });

      if (eligibleReading) {
        selectedTrigger = {
          type: 'prophecy_pending',
          relatedId: eligibleReading.id,
          extraData: { topicTag: eligibleReading.questionTopicTag || 'khac' },
        };
      }
    }

    // --- TRIGGER 3: reengage_dX (Inactivity markers for 3, 7, 14, 30 days) ---
    if (!selectedTrigger && user.readings.length > 0) {
      const lastReading = user.readings[0];
      const inactiveDays = (now.getTime() - lastReading.createdAt.getTime()) / (1000 * 60 * 60 * 24);

      const mocs: Array<{
        days: number;
        type: 'reengage_d3' | 'reengage_d7' | 'reengage_d14' | 'reengage_d30';
      }> = [
        { days: 30, type: 'reengage_d30' },
        { days: 14, type: 'reengage_d14' },
        { days: 7, type: 'reengage_d7' },
        { days: 3, type: 'reengage_d3' },
      ];

      for (const moc of mocs) {
        if (inactiveDays >= moc.days) {
          // Check if we already sent this specific re-engagement push
          const alreadySent = user.pushLogs.some((log) => log.triggerType === moc.type);
          if (!alreadySent) {
            selectedTrigger = { type: moc.type };
            break;
          }
        }
      }
    }

    // --- TRIGGER 4: habit_time (Reminder on their frequent usage hour) ---
    if (!selectedTrigger && user.readings.length >= 3) {
      // Find the most frequent hour of reading creation
      const hourCounts: Record<number, number> = {};
      user.readings.forEach((r) => {
        const hr = r.createdAt.getHours();
        hourCounts[hr] = (hourCounts[hr] || 0) + 1;
      });

      let habitHour = 20; // default 8 PM
      let maxCount = 0;
      for (const [hrStr, count] of Object.entries(hourCounts)) {
        const hr = parseInt(hrStr, 10);
        if (count > maxCount) {
          maxCount = count;
          habitHour = hr;
        }
      }

      const currentHour = now.getHours();
      if (currentHour === habitHour) {
        // Has user visited or done a reading today (last 18 hours)?
        const lastReading = user.readings[0];
        const hoursSinceLastActivity = (now.getTime() - lastReading.createdAt.getTime()) / (1000 * 60 * 60);

        if (hoursSinceLastActivity >= 18) {
          // Verify 48h same trigger limit
          const lastHabitPush = user.pushLogs.find((log) => log.triggerType === 'habit_time');
          const hoursSinceLastHabitPush = lastHabitPush
            ? (now.getTime() - lastHabitPush.sentAt.getTime()) / (1000 * 60 * 60)
            : 999;

          if (hoursSinceLastHabitPush >= 48) {
            selectedTrigger = { type: 'habit_time' };
          }
        }
      }
    }

    // 3. Process Selected Trigger
    if (!selectedTrigger) continue;

    // Check same trigger 48h limit
    const lastSameTrigger = user.pushLogs.find((log) => log.triggerType === selectedTrigger!.type);
    if (lastSameTrigger) {
      const hrsSinceSameTrigger = (now.getTime() - lastSameTrigger.sentAt.getTime()) / (1000 * 60 * 60);
      if (hrsSinceSameTrigger < 48) {
        console.log(`Skip user ${user.id}: Same trigger type ${selectedTrigger.type} sent ${hrsSinceSameTrigger.toFixed(1)}h ago (limit 48h).`);
        skippedDedupCount++;
        continue;
      }
    }

    // Generate personalized message copy
    const { title, body } = getPushMessage(
      selectedTrigger.type,
      user.clan,
      user.erc,
      selectedTrigger.extraData
    );

    // If memory or prophecy, append ID to messageText to allow search dedup
    let storedText = `${title}: ${body}`;
    if (selectedTrigger.type === 'memory_pending') {
      storedText = `[Mảnh ${selectedTrigger.relatedId}] ${storedText}`;
    } else if (selectedTrigger.type === 'prophecy_pending') {
      storedText = `[Quẻ ${selectedTrigger.relatedId}] ${storedText}`;
    }

    // Check opt-out (no push token)
    if (!user.pushToken) {
      // Create Skipped/Optout Log for testing visibility
      await prisma.pushTrigger.create({
        data: {
          userId: user.id,
          triggerType: selectedTrigger.type as any,
          relatedEntityId: selectedTrigger.relatedId,
          scheduledAt: now,
          sentAt: null,
          status: 'skipped_optout',
        },
      });
      skippedOptoutCount++;
      continue;
    }

    // 4. Send the push notification
    const success = await sendPushNotification(user.id, user.pushToken, selectedTrigger.type, {
      title,
      body,
      data: {
        triggerType: selectedTrigger.type,
        relatedId: selectedTrigger.relatedId || '',
      },
    }, selectedTrigger.relatedId);

    if (success) {
      const trigger = await prisma.pushTrigger.create({
        data: {
          userId: user.id,
          triggerType: selectedTrigger.type as any,
          relatedEntityId: selectedTrigger.relatedId,
          scheduledAt: now,
          sentAt: now,
          status: 'sent',
        },
      });

      await prisma.appEvent.create({
        data: {
          userId: user.id,
          eventType: 'push_sent',
          relatedEntityId: trigger.id,
          metadata: {
            triggerType: selectedTrigger.type,
            relatedEntityId: selectedTrigger.relatedId || null,
          },
        },
      });

      sentCount++;
    }
  }

  return {
    processed: processedCount,
    sent: sentCount,
    skippedDedup: skippedDedupCount,
    skippedOptout: skippedOptoutCount,
  };
}
