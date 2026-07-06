import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null, // Required by BullMQ
  enableReadyCheck: false,
});

export const notificationQueue = new Queue('notification', { connection });
