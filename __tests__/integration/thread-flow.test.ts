// Applying pattern from: nextjs-fullstack-best-practices
import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { prisma } from '../../lib/prisma';
import { NextRequest } from 'next/server';
import { POST as generateRoute } from '../../app/api/user/thread/generate/route';
import { POST as redeemRoute } from '../../app/api/user/thread/redeem/route';
import { GET as statusRoute } from '../../app/api/user/thread/status/route';
import { GET as memoriesRoute } from '../../app/api/user/memories/route';
import { POST as letterRoute } from '../../app/api/user/memories/letter/route';
import { threadService } from '../../services/thread.service';

describe('Integration Test - Sợi Chỉ Xuyên Sương Full Flow', () => {
  let userAId: string;
  let userBId: string;

  beforeEach(async () => {
    // Clean up DB before test runs
    await prisma.unlockedMemory.deleteMany();
    await prisma.threadLink.deleteMany();
    await prisma.reading.deleteMany();
    await prisma.user.deleteMany();

    // Create User A and User B
    const uA = await prisma.user.create({
      data: {
        email: 'usera_integration@example.com',
        password: 'hashedpassword',
        name: 'Người Mời A',
      },
    });
    userAId = uA.id;

    const uB = await prisma.user.create({
      data: {
        email: 'userb_integration@example.com',
        password: 'hashedpassword',
        name: 'Người Được Mời B',
      },
    });
    userBId = uB.id;
  });

  afterAll(async () => {
    // Clean up DB after test suite ends
    await prisma.unlockedMemory.deleteMany();
    await prisma.threadLink.deleteMany();
    await prisma.reading.deleteMany();
    await prisma.user.deleteMany();
  });

  it('should go through the entire flow: generate -> redeem -> check status -> perform readings -> unlock Memory 8 -> verify dynamic dialogue & letter constraints', async () => {
    // 1. User A generates referral code
    const reqGenerate = new NextRequest('http://localhost/api/user/thread/generate', {
      method: 'POST',
      headers: { 'x-user-id': userAId },
    });
    const resGenerate = await generateRoute(reqGenerate);
    const dataGenerate = await resGenerate.json();

    expect(resGenerate.status).toBe(200);
    expect(dataGenerate.success).toBe(true);
    expect(dataGenerate.referralCode).toHaveLength(6);
    expect(dataGenerate.deepLink).toContain(dataGenerate.referralCode);

    const referralCode = dataGenerate.referralCode;

    // 2. User B redeems the code
    const reqRedeem = new NextRequest('http://localhost/api/user/thread/redeem', {
      method: 'POST',
      headers: { 'x-user-id': userBId },
      body: JSON.stringify({ code: referralCode }),
    });
    const resRedeem = await redeemRoute(reqRedeem);
    const dataRedeem = await resRedeem.json();

    expect(resRedeem.status).toBe(200);
    expect(dataRedeem.success).toBe(true);
    expect(dataRedeem.link.userAId).toBe(userAId);
    expect(dataRedeem.link.userBId).toBe(userBId);
    expect(dataRedeem.link.status).toBe('pending_b_reading');

    // 3. Check status for User B
    const reqStatusB1 = new NextRequest('http://localhost/api/user/thread/status', {
      method: 'GET',
      headers: { 'x-user-id': userBId },
    });
    const resStatusB1 = await statusRoute(reqStatusB1);
    const dataStatusB1 = await resStatusB1.json();

    expect(resStatusB1.status).toBe(200);
    expect(dataStatusB1.isLinked).toBe(true);
    expect(dataStatusB1.isCompleted).toBe(false);
    expect(dataStatusB1.progress).toBe('0/2');
    expect(dataStatusB1.partnerName).toBe('Người Mời A');

    // 4. User A performs a reading
    await threadService.handleReadingHook(userAId);

    // 5. Check status for User B (should be 1/2)
    const reqStatusB2 = new NextRequest('http://localhost/api/user/thread/status', {
      method: 'GET',
      headers: { 'x-user-id': userBId },
    });
    const resStatusB2 = await statusRoute(reqStatusB2);
    const dataStatusB2 = await resStatusB2.json();

    expect(resStatusB2.status).toBe(200);
    expect(dataStatusB2.progress).toBe('1/2');

    // 6. User B performs a reading (should complete the link & unlock Memory 8)
    await threadService.handleReadingHook(userBId);

    // 7. Check status for User B (should be completed)
    const reqStatusB3 = new NextRequest('http://localhost/api/user/thread/status', {
      method: 'GET',
      headers: { 'x-user-id': userBId },
    });
    const resStatusB3 = await statusRoute(reqStatusB3);
    const dataStatusB3 = await resStatusB3.json();

    expect(resStatusB3.status).toBe(200);
    expect(dataStatusB3.isCompleted).toBe(true);

    // 8. Fetch memories for User A (User A is the Inviter)
    const reqMemoriesA = new NextRequest('http://localhost/api/user/memories', {
      method: 'GET',
      headers: { 'x-user-id': userAId },
    });
    const resMemoriesA = await memoriesRoute(reqMemoriesA);
    const dataMemoriesA = await resMemoriesA.json();

    expect(resMemoriesA.status).toBe(200);
    const memory8A = dataMemoriesA.unlocked.find((m: any) => m.index === 8);
    expect(memory8A).toBeDefined();
    // Should have Inviter dialogue (Khanh prequel role A dialogue)
    expect(memory8A.dialogue).toContain('Lữ khách, ngươi vừa làm được điều mà rất ít ai chịu làm');

    // 9. Fetch memories for User B (User B is the Invitee)
    const reqMemoriesB = new NextRequest('http://localhost/api/user/memories', {
      method: 'GET',
      headers: { 'x-user-id': userBId },
    });
    const resMemoriesB = await memoriesRoute(reqMemoriesB);
    const dataMemoriesB = await resMemoriesB.json();

    expect(resMemoriesB.status).toBe(200);
    const memory8B = dataMemoriesB.unlocked.find((m: any) => m.index === 8);
    expect(memory8B).toBeDefined();
    // Should have Invitee dialogue (Khanh prequel role B dialogue)
    expect(memory8B.dialogue).toContain('Ai đó đã nghĩ đến ngươi khi bước qua cổng sương này');

    // 10. Check Sealed Letter constraint (should still block opening because we only have 1 memory, index 8)
    const reqLetter = new NextRequest('http://localhost/api/user/memories/letter', {
      method: 'POST',
      headers: { 'x-user-id': userAId },
    });
    const resLetter = await letterRoute(reqLetter);
    const dataLetter = await resLetter.json();

    expect(resLetter.status).toBe(200);
    expect(dataLetter.locked).toBe(true);
    expect(dataLetter.message).toContain('Lá thư bị sương mù phong ấn chặt');
  });
});
