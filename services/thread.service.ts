// Applying pattern from: nextjs-fullstack-best-practices
import { prisma } from '../lib/prisma';
import { sendPushNotification } from '../lib/push-service';

function generateRandomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const threadService = {
  /**
   * Generates a unique referral code for a user if they don't have one yet.
   */
  async generateReferralCode(userId: string): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { referralCode: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.referralCode) {
      return user.referralCode;
    }

    let referralCode = '';
    let attempts = 0;
    while (attempts < 10) {
      const code = generateRandomCode();
      const existing = await prisma.user.findUnique({
        where: { referralCode: code },
      });
      if (!existing) {
        referralCode = code;
        break;
      }
      attempts++;
    }

    if (!referralCode) {
      throw new Error('Không thể tạo mã giới thiệu duy nhất, vui lòng thử lại.');
    }

    await prisma.user.update({
      where: { id: userId },
      data: { referralCode },
    });

    return referralCode;
  },

  /**
   * Redeems a referral code, establishing a ThreadLink.
   */
  async redeemCode(userId: string, rawCode: string) {
    const code = rawCode.toUpperCase().trim();

    // 1. Get user B (invitee)
    const userB = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, referredByCode: true },
    });

    if (!userB) {
      throw new Error('User not found');
    }

    // Rule: One B can only be referred once in their lifetime
    if (userB.referredByCode) {
      throw new Error('Bạn đã liên kết với một lữ khách khác trước đó.');
    }

    const existingLink = await prisma.threadLink.findUnique({
      where: { userBId: userId },
    });
    if (existingLink) {
      throw new Error('Bạn đã liên kết với một lữ khách khác trước đó.');
    }

    // 2. Get user A (inviter)
    const userA = await prisma.user.findUnique({
      where: { referralCode: code },
      select: { id: true },
    });

    if (!userA) {
      throw new Error('Mã liên kết không hợp lệ hoặc không tồn tại.');
    }

    // Rule: Can't redeem own code
    if (userA.id === userId) {
      throw new Error('Bạn không thể tự dệt sợi chỉ với chính mình.');
    }

    // 3. Create ThreadLink and update User B referredByCode
    const [link] = await prisma.$transaction([
      prisma.threadLink.create({
        data: {
          userAId: userA.id,
          userBId: userId,
          status: 'pending_b_reading',
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { referredByCode: code },
      }),
    ]);

    return link;
  },

  /**
   * Gets the status of the thread link for a user.
   */
  async getThreadStatus(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { referralCode: true, referredByCode: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // User can be User B (at most one link)
    let link = await prisma.threadLink.findUnique({
      where: { userBId: userId },
      include: {
        userA: { select: { name: true, email: true } },
      },
    });

    let role: 'A' | 'B' = 'B';

    // If not found, User is User A (can have multiple, find active first, then completed)
    if (!link) {
      link = await prisma.threadLink.findFirst({
        where: {
          userAId: userId,
          status: { in: ['pending_a_reading', 'pending_b_reading'] },
        },
        include: {
          userB: { select: { name: true, email: true } },
        },
      });
      role = 'A';
    }

    if (!link) {
      link = await prisma.threadLink.findFirst({
        where: {
          userAId: userId,
          status: 'completed',
        },
        include: {
          userB: { select: { name: true, email: true } },
        },
      });
      role = 'A';
    }

    if (!link) {
      return {
        referralCode: user.referralCode,
        referredByCode: user.referredByCode,
        isLinked: false,
        isCompleted: false,
        progress: '0/2',
      };
    }

    const partnerName = role === 'A' ? link.userB.name : link.userA.name;
    const isCompleted = link.status === 'completed';
    
    let progress: '0/2' | '1/2' | '2/2' = '0/2';
    if (isCompleted) {
      progress = '2/2';
    } else if (link.aReadingDone || link.bReadingDone) {
      progress = '1/2';
    }

    return {
      referralCode: user.referralCode,
      referredByCode: user.referredByCode,
      isLinked: true,
      isCompleted,
      progress,
      partnerName: partnerName || 'Lữ Khách Phương Xa',
      aReadingDone: link.aReadingDone,
      bReadingDone: link.bReadingDone,
      role,
      status: link.status,
    };
  },

  /**
   * Hook called after a successful reading creation.
   * Updates ThreadLink reading completion and handles Memory 8 unlock.
   */
  async handleReadingHook(userId: string): Promise<number[]> {
    // Find active ThreadLink involving the user
    const activeLink = await prisma.threadLink.findFirst({
      where: {
        OR: [
          { userAId: userId, status: { in: ['pending_b_reading', 'pending_a_reading'] } },
          { userBId: userId, status: { in: ['pending_b_reading', 'pending_a_reading'] } },
        ],
      },
    });

    if (!activeLink) {
      return [];
    }

    const isUserA = activeLink.userAId === userId;
    const updateData: any = {};

    if (isUserA) {
      if (activeLink.aReadingDone) return []; // Already done
      updateData.aReadingDone = true;
    } else {
      if (activeLink.bReadingDone) return []; // Already done
      updateData.bReadingDone = true;
    }

    const bothDone = (isUserA && activeLink.bReadingDone) || (!isUserA && activeLink.aReadingDone);

    if (bothDone) {
      updateData.status = 'completed';
      updateData.completedAt = new Date();
    } else {
      updateData.status = isUserA ? 'pending_b_reading' : 'pending_a_reading';
    }

    const updatedLink = await prisma.threadLink.update({
      where: { id: activeLink.id },
      data: updateData,
    });

    if (updatedLink.status === 'completed') {
      // Unlock Memory 8 for both users!
      const unlockA = prisma.unlockedMemory.upsert({
        where: {
          userId_memoryIndex: {
            userId: activeLink.userAId,
            memoryIndex: 8,
          },
        },
        create: {
          userId: activeLink.userAId,
          memoryIndex: 8,
        },
        update: {},
      });

      const unlockB = prisma.unlockedMemory.upsert({
        where: {
          userId_memoryIndex: {
            userId: activeLink.userBId,
            memoryIndex: 8,
          },
        },
        create: {
          userId: activeLink.userBId,
          memoryIndex: 8,
        },
        update: {},
      });

      await prisma.$transaction([unlockA, unlockB]);

      // 1. Get push tokens
      const [userA, userB] = await Promise.all([
        prisma.user.findUnique({
          where: { id: activeLink.userAId },
          select: { pushToken: true },
        }),
        prisma.user.findUnique({
          where: { id: activeLink.userBId },
          select: { pushToken: true },
        }),
      ]);

      // 2. Send push notifications
      if (userA?.pushToken) {
        await sendPushNotification(
          activeLink.userAId,
          userA.pushToken,
          'memory_pending',
          {
            title: 'Sợi chỉ dệt sáng',
            body: 'Sợi chỉ ngươi dệt đã sáng lên trong sương mù. Mảnh Hồi Ức thứ 8 của Vọng đang chờ ngươi.',
            data: { triggerType: 'memory_pending', relatedId: '8' },
          },
          '8'
        );
      }

      if (userB?.pushToken) {
        await sendPushNotification(
          activeLink.userBId,
          userB.pushToken,
          'memory_pending',
          {
            title: 'Sợi chỉ vô hình',
            body: 'Một sợi chỉ vô hình vừa kéo ngươi lại gần cổng sương hơn. Vọng có điều muốn kể cho ngươi.',
            data: { triggerType: 'memory_pending', relatedId: '8' },
          },
          '8'
        );
      }

      return [8];
    }

    return [];
  },
};
