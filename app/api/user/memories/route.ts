import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleError } from '@/lib/errors';
import { VONG_MEMORIES } from '@/lib/narrative';

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized. User context missing.' }, { status: 401 });
    }

    const dbMemories = await prisma.unlockedMemory.findMany({
      where: { userId },
      orderBy: { memoryIndex: 'asc' },
    });

    const unlocked = dbMemories.map((dbMem) => {
      const staticMem = VONG_MEMORIES.find((m) => m.index === dbMem.memoryIndex);
      return {
        index: dbMem.memoryIndex,
        title: staticMem ? staticMem.title : 'Ký ức ẩn giấu',
        dialogue: staticMem ? staticMem.dialogue : 'Chưa thể chạm tới mảnh ký ức này.',
        unlockedAt: dbMem.unlockedAt.toISOString(),
      };
    });

    const unlockedIndexes = dbMemories.map((m) => m.memoryIndex);
    const locked = [1, 2, 3, 4, 5, 6, 7].filter((index) => !unlockedIndexes.includes(index));

    return NextResponse.json({
      unlocked,
      locked,
    });
  } catch (error) {
    return handleError(error);
  }
}
