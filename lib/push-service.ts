// Applying pattern from: nextjs-fullstack-best-practices
import { prisma } from './prisma';
import crypto from 'crypto';

export interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

/**
 * Sends a push notification to a user.
 * Supports standard FCM REST JSON payload structures.
 * Fallbacks to console/database log if FCM is not configured in local development.
 */
export async function sendPushNotification(
  userId: string,
  pushToken: string | null,
  triggerType: any,
  payload: PushPayload,
  relatedEntityId?: string
): Promise<boolean> {
  const { title, body, data } = payload;
  const logId = crypto.randomUUID();

  try {
    // 1. Perform actual push request first if credentials are configured
    const fcmServerKey = process.env.FCM_SERVER_KEY;
    if (fcmServerKey && pushToken) {
      const response = await fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `key=${fcmServerKey}`,
        },
        body: JSON.stringify({
          to: pushToken,
          notification: {
            title,
            body,
            sound: 'default',
          },
          data: {
            ...data,
            click_action: 'FLUTTER_NOTIFICATION_CLICK', // standard native receiver flag
            pushLogId: logId,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`FCM gateway returned error: ${response.status} - ${errorText}`);
        return false;
      }
    }

    // 2. Log push attempt in the database ONLY on success
    await prisma.pushLog.create({
      data: {
        id: logId,
        userId,
        triggerType,
        relatedEntityId: relatedEntityId || null,
        messageText: `${title}: ${body}`,
      },
    });

    console.log(`[PUSH NOTIFICATION] User: ${userId} | Token: ${pushToken || 'No Token'} | ID: ${logId}`);
    console.log(` > Title: "${title}"`);
    console.log(` > Body: "${body}"`);
    if (data) {
      console.log(` > Data:`, data);
    }

    return true;
  } catch (error) {
    console.error(`Failed to send push notification to user ${userId}:`, error);
    return false;
  }
}
