// Applying pattern from: nextjs-fullstack-best-practices
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleError } from '@/lib/errors';
import { tarotDeck } from '@/lib/tarot';
import {
  calculatePartnerSoulCard,
  calculatePartnerClan,
  determineCompatibilityBranch,
  drawWitnessCard,
  generateVongCompatibilityDispatch,
} from '@/lib/compatibility';
import { z } from 'zod';

const compatibilitySchema = z.object({
  partnerName: z.string().min(1).max(50),
  partnerBirthDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format. Expected ISO format (e.g. 1998-07-15)',
  }),
});

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized. User context missing.' }, { status: 401 });
    }

    const body = await req.json();
    const { partnerName, partnerBirthDate } = compatibilitySchema.parse(body);

    // 1. Rate Limit Enforcement (1 check per week)
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentChecksCount = await prisma.compatibilityCheck.count({
      where: {
        userId,
        createdAt: { gte: oneWeekAgo },
      },
    });

    if (recentChecksCount >= 1) {
      return NextResponse.json({
        error: 'Mỗi tuần lữ khách chỉ được thực hiện ghép đôi 1 lần. Vui lòng quay lại sau.',
      }, { status: 403 });
    }

    // 2. Query User Context
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'Người dùng không tồn tại.' }, { status: 404 });
    }

    // 3. Elements and Astrology Calculations
    const partnerSoulCardId = calculatePartnerSoulCard(partnerBirthDate);
    const partnerClan = calculatePartnerClan(partnerSoulCardId);

    const branch = determineCompatibilityBranch(user.clan, partnerClan);
    const witnessCard = drawWitnessCard();

    // Map names for the LLM prompt
    const partnerSoulCardName = tarotDeck.find((c) => c.id === partnerSoulCardId)?.name || partnerSoulCardId;
    const witnessCardId = witnessCard.split('|')[0];
    const witnessCardDetails = tarotDeck.find((c) => c.id === witnessCardId);
    const witnessCardName = witnessCardDetails
      ? `${witnessCardDetails.name} (${witnessCard.split('|')[1] === 'reversed' ? 'ngược' : 'xuôi'})`
      : witnessCard;

    // 4. Generate AI Commentary
    const commentary = await generateVongCompatibilityDispatch(
      user.clan,
      user.erc,
      partnerName,
      partnerClan,
      partnerSoulCardName,
      witnessCardName,
      branch
    );

    // 5. Save the compatibility check log in database
    const check = await prisma.compatibilityCheck.create({
      data: {
        userId,
        partnerName,
        partnerBirthDate: new Date(partnerBirthDate),
        partnerSoulCard: partnerSoulCardId,
        partnerClan,
        relationshipBranch: branch,
        witnessCard,
        resultText: commentary,
      },
    });

    return NextResponse.json({
      message: 'Ghép đôi thành công.',
      check: {
        id: check.id,
        partnerName: check.partnerName,
        partnerClan: check.partnerClan,
        partnerSoulCard: check.partnerSoulCard,
        relationshipBranch: check.relationshipBranch,
        witnessCard: check.witnessCard,
        resultText: check.resultText,
        createdAt: check.createdAt.toISOString(),
      },
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized. User context missing.' }, { status: 401 });
    }

    const checks = await prisma.compatibilityCheck.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      checks: checks.map((c) => ({
        id: c.id,
        partnerName: c.partnerName,
        partnerClan: c.partnerClan,
        partnerSoulCard: c.partnerSoulCard,
        relationshipBranch: c.relationshipBranch,
        witnessCard: c.witnessCard,
        resultText: c.resultText,
        createdAt: c.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    return handleError(error);
  }
}
