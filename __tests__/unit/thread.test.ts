// Applying pattern from: nextjs-fullstack-best-practices
import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { prisma } from '../../lib/prisma';
import { threadService } from '../../services/thread.service';

describe('Sợi Chỉ Xuyên Sương - Thread Link & Referral Tests', () => {
  let userAId: string;
  let userBId: string;
  let userCId: string;

  beforeEach(async () => {
    // Dọn dẹp dữ liệu để tránh xung đột giữa các test case
    await prisma.unlockedMemory.deleteMany();
    await prisma.threadLink.deleteMany();
    await prisma.reading.deleteMany();
    await prisma.user.deleteMany();

    // Tạo các tài khoản test mới
    const uA = await prisma.user.create({
      data: {
        email: 'usera@example.com',
        password: 'hashedpassword',
        name: 'Lữ Khách A',
      },
    });
    userAId = uA.id;

    const uB = await prisma.user.create({
      data: {
        email: 'userb@example.com',
        password: 'hashedpassword',
        name: 'Lữ Khách B',
      },
    });
    userBId = uB.id;

    const uC = await prisma.user.create({
      data: {
        email: 'userc@example.com',
        password: 'hashedpassword',
        name: 'Lữ Khách C',
      },
    });
    userCId = uC.id;
  });

  afterAll(async () => {
    // Dọn dẹp sạch sẽ sau khi kết thúc toàn bộ test suite
    await prisma.unlockedMemory.deleteMany();
    await prisma.threadLink.deleteMany();
    await prisma.reading.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('generateReferralCode', () => {
    it('should generate a unique 6-character code if not exist', async () => {
      const code = await threadService.generateReferralCode(userAId);
      expect(code).toBeDefined();
      expect(code).toHaveLength(6);

      const user = await prisma.user.findUnique({ where: { id: userAId } });
      expect(user?.referralCode).toBe(code);
    });

    it('should return existing code if user already has one', async () => {
      const code1 = await threadService.generateReferralCode(userAId);
      const code2 = await threadService.generateReferralCode(userAId);
      expect(code1).toBe(code2);
    });
  });

  describe('redeemCode', () => {
    it('should successfully link two users when constraints are met', async () => {
      const codeA = await threadService.generateReferralCode(userAId);
      const link = await threadService.redeemCode(userBId, codeA);

      expect(link).toBeDefined();
      expect(link.userAId).toBe(userAId);
      expect(link.userBId).toBe(userBId);
      expect(link.status).toBe('pending_b_reading');

      const userB = await prisma.user.findUnique({ where: { id: userBId } });
      expect(userB?.referredByCode).toBe(codeA);
    });

    it('should throw error when user B tries to redeem their own code', async () => {
      const codeA = await threadService.generateReferralCode(userAId);
      await expect(
        threadService.redeemCode(userAId, codeA)
      ).rejects.toThrow('Bạn không thể tự dệt sợi chỉ với chính mình.');
    });

    it('should throw error when code does not exist', async () => {
      await expect(
        threadService.redeemCode(userBId, 'NONEXST')
      ).rejects.toThrow('Mã liên kết không hợp lệ hoặc không tồn tại.');
    });

    it('should throw error when user B has already been referred', async () => {
      const codeA = await threadService.generateReferralCode(userAId);
      const codeC = await threadService.generateReferralCode(userCId);

      // B redeem A
      await threadService.redeemCode(userBId, codeA);

      // B tries to redeem C -> should fail
      await expect(
        threadService.redeemCode(userBId, codeC)
      ).rejects.toThrow('Bạn đã liên kết với một lữ khách khác trước đó.');
    });
  });

  describe('getThreadStatus', () => {
    it('should return status as unlinked when no thread exists', async () => {
      const status = await threadService.getThreadStatus(userAId);
      expect(status.isLinked).toBe(false);
      expect(status.isCompleted).toBe(false);
    });

    it('should return status correctly for active link', async () => {
      const codeA = await threadService.generateReferralCode(userAId);
      await threadService.redeemCode(userBId, codeA);

      const statusA = await threadService.getThreadStatus(userAId);
      expect(statusA.isLinked).toBe(true);
      expect(statusA.isCompleted).toBe(false);
      expect(statusA.partnerName).toBe('Lữ Khách B');
      expect(statusA.progress).toBe('0/2');
      expect(statusA.role).toBe('A');

      const statusB = await threadService.getThreadStatus(userBId);
      expect(statusB.isLinked).toBe(true);
      expect(statusB.isCompleted).toBe(false);
      expect(statusB.partnerName).toBe('Lữ Khách A');
      expect(statusB.progress).toBe('0/2');
      expect(statusB.role).toBe('B');
    });
  });

  describe('handleReadingHook & Memory Unlock', () => {
    it('should update progress on reading and unlock memory 8 when both done', async () => {
      const codeA = await threadService.generateReferralCode(userAId);
      await threadService.redeemCode(userBId, codeA);

      // A does a reading
      await threadService.handleReadingHook(userAId);

      let statusA = await threadService.getThreadStatus(userAId);
      expect(statusA.progress).toBe('1/2');
      expect(statusA.isCompleted).toBe(false);

      // Check that Memory 8 is not unlocked yet
      let memoriesA = await prisma.unlockedMemory.findMany({ where: { userId: userAId } });
      expect(memoriesA.some(m => m.memoryIndex === 8)).toBe(false);

      // B does a reading -> completes the thread
      await threadService.handleReadingHook(userBId);

      statusA = await threadService.getThreadStatus(userAId);
      expect(statusA.progress).toBe('2/2');
      expect(statusA.isCompleted).toBe(true);

      // Both should have Memory 8 unlocked!
      memoriesA = await prisma.unlockedMemory.findMany({ where: { userId: userAId } });
      expect(memoriesA.some(m => m.memoryIndex === 8)).toBe(true);

      const memoriesB = await prisma.unlockedMemory.findMany({ where: { userId: userBId } });
      expect(memoriesB.some(m => m.memoryIndex === 8)).toBe(true);
    });
  });
});
