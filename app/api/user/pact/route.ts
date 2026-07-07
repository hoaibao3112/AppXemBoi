import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleError } from '@/lib/errors';
import { tarotDeck } from '@/lib/tarot';

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized. User context missing.' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        activePactCardId: true,
        activePactTarget: true,
        activePactExpiresAt: true,
        erc: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if active pact has expired
    if (user.activePactExpiresAt && new Date() > new Date(user.activePactExpiresAt)) {
      // Auto fail or clean expired pact
      await prisma.user.update({
        where: { id: userId },
        data: {
          activePactCardId: null,
          activePactTarget: null,
          activePactExpiresAt: null,
        }
      });
      return NextResponse.json({ activePact: null, expired: true });
    }

    return NextResponse.json({
      activePact: user.activePactCardId ? {
        cardId: user.activePactCardId,
        target: user.activePactTarget,
        expiresAt: user.activePactExpiresAt,
      } : null,
      erc: user.erc,
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized. User context missing.' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { cardId } = body;
    if (!cardId) {
      return NextResponse.json({ error: 'Card ID is required to initiate a pact.' }, { status: 400 });
    }

    // Verify card is a royal card
    const card = tarotDeck.find(c => c.id === cardId);
    if (!card) {
      return NextResponse.json({ error: 'Tarot card not found.' }, { status: 404 });
    }

    const isRoyal = ['Page', 'Knight', 'Queen', 'King'].includes(card.rank);
    if (!isRoyal) {
      return NextResponse.json({ error: 'Chỉ các lá bài Hoàng gia mới có thể kích hoạt Khế ước.' }, { status: 400 });
    }

    // Assign a random pact target
    const targets = [
      'NO_NEGATIVE_ERC', // Không được để ERC bị trừ dưới 0
      'REACH_ERC_30',    // Đạt mốc ERC 30+
    ];
    const selectedTarget = targets[Math.floor(Math.random() * targets.length)];

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 3); // 3 days validity

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        activePactCardId: cardId,
        activePactTarget: selectedTarget,
        activePactExpiresAt: expiresAt,
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Khế ước của Sứ Giả đã được thiết lập.',
      activePact: {
        cardId: updatedUser.activePactCardId,
        target: updatedUser.activePactTarget,
        expiresAt: updatedUser.activePactExpiresAt,
      }
    });
  } catch (error) {
    return handleError(error);
  }
}

// Complete or claim a pact reward (gives 1 mirror shard)
export async function PUT(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized. User context missing.' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.activePactCardId) {
      return NextResponse.json({ error: 'Không tìm thấy khế ước đang hoạt động.' }, { status: 400 });
    }

    // Validate if the user met the target
    let completed = false;
    if (user.activePactTarget === 'NO_NEGATIVE_ERC' && user.erc >= 0) {
      completed = true;
    } else if (user.activePactTarget === 'REACH_ERC_30' && user.erc >= 30) {
      completed = true;
    }

    if (!completed) {
      return NextResponse.json({ error: 'Bạn chưa hoàn thành mục tiêu khế ước này.' }, { status: 400 });
    }

    // Award 1 mirror shard (index 1 to 6) that they do not have yet
    const existingShards = user.unlockedShards || [];
    const missingShards = [1, 2, 3, 4, 5, 6].filter(s => !existingShards.includes(s));
    
    let newShardAwarded: number | null = null;
    let nextShards = [...existingShards];

    if (missingShards.length > 0) {
      newShardAwarded = missingShards[Math.floor(Math.random() * missingShards.length)];
      nextShards.push(newShardAwarded);
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        activePactCardId: null,
        activePactTarget: null,
        activePactExpiresAt: null,
        unlockedShards: nextShards,
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Khế ước hoàn thành. Sứ Giả trao tặng bạn một Mảnh Gương Vỡ.',
      newShard: newShardAwarded,
      unlockedShards: nextShards,
    });
  } catch (error) {
    return handleError(error);
  }
}
