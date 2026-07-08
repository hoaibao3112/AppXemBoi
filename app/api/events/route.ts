// Applying pattern from: nextjs-fullstack-best-practices
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleError } from '@/lib/errors';
import { z } from 'zod';

const eventSchema = z.object({
  eventType: z.string().min(1),
  relatedEntityId: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.any()).nullable().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id') || null;

    const body = await req.json();
    const { eventType, relatedEntityId, metadata } = eventSchema.parse(body);

    const event = await prisma.appEvent.create({
      data: {
        userId,
        eventType,
        relatedEntityId,
        metadata: metadata || undefined,
      },
    });

    return NextResponse.json({
      message: 'Event logged successfully.',
      event,
    });
  } catch (error) {
    return handleError(error);
  }
}
