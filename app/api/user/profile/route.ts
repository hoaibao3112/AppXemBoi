import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleError } from '@/lib/errors';
import { calculateSoulCard } from '@/lib/auth';
import { z } from 'zod';

const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name cannot be empty').optional(),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid birthDate format (YYYY-MM-DD)').optional(),
});

interface FormatProfileInput {
  id: string;
  email: string;
  name: string | null;
  clan: string;
  erc: number;
  soulCard: string | null;
  birthDate: Date | null;
  createdAt: Date;
  memories: { memoryIndex: number }[];
  _count: { readings: number };
}

function formatProfile(user: FormatProfileInput) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    clan: user.clan,
    erc: user.erc,
    soulCard: user.soulCard,
    birthDate: user.birthDate ? user.birthDate.toISOString() : null,
    totalReadings: user._count.readings,
    unlockedMemories: user.memories.map((m) => m.memoryIndex).sort((a, b) => a - b),
    createdAt: user.createdAt.toISOString(),
  };
}

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized. User context missing.' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        memories: {
          select: { memoryIndex: true },
        },
        _count: {
          select: { readings: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(formatProfile(user));
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized. User context missing.' }, { status: 401 });
    }

    const body = await req.json();
    const data = updateProfileSchema.parse(body);

    const updateData: { name?: string; birthDate?: Date; soulCard?: string } = {};
    if (data.name !== undefined) {
      updateData.name = data.name;
    }
    if (data.birthDate !== undefined) {
      updateData.birthDate = new Date(data.birthDate);
      updateData.soulCard = calculateSoulCard(data.birthDate);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        memories: {
          select: { memoryIndex: true },
        },
        _count: {
          select: { readings: true },
        },
      },
    });

    return NextResponse.json(formatProfile(updatedUser));
  } catch (error) {
    return handleError(error);
  }
}
