import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleError } from '@/lib/errors';
import { tarotDeck } from '@/lib/tarot';
import { z } from 'zod';

const readingsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).default(10),
  clan: z.enum(['DiemHoa', 'ThuyNguyet', 'PhongKiem', 'ThoKim', 'VoThuong']).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized. User context missing.' }, { status: 401 });
    }

    const url = new URL(req.url);
    const parsedQuery = readingsQuerySchema.parse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      clan: url.searchParams.get('clan') ?? undefined,
    });

    const { page, limit, clan } = parsedQuery;

    let paginatedReadings: any[] = [];
    let total = 0;

    if (!clan) {
      // Database level pagination when no clan filter is specified
      const [readings, count] = await prisma.$transaction([
        prisma.reading.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.reading.count({ where: { userId } }),
      ]);

      total = count;
      paginatedReadings = readings.map((reading) => {
        const mappedCards = reading.cards.map((cardStr, position) => {
          const [cardId, orientation] = cardStr.split('|');
          const isReversed = orientation === 'reversed';
          const deckCard = tarotDeck.find((c) => c.id === cardId);
          return {
            id: cardId,
            name: deckCard ? deckCard.name : 'Unknown Card',
            clan: deckCard ? deckCard.clan : 'Unknown Clan',
            isReversed,
            position,
          };
        });

        return {
          id: reading.id,
          question: reading.question,
          cards: mappedCards,
          response: reading.response,
          ercChange: reading.ercChange,
          verified: reading.verified,
          snoozeUntil: reading.snoozeUntil ? reading.snoozeUntil.toISOString() : null,
          snoozeCount: reading.snoozeCount,
          createdAt: reading.createdAt.toISOString(),
        };
      });
    } else {
      // In-memory pagination required since cards is an array of strings in PostgreSQL and needs tarotDeck lookup to identify clan
      const allReadings = await prisma.reading.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      const mappedReadings = allReadings.map((reading) => {
        const mappedCards = reading.cards.map((cardStr, position) => {
          const [cardId, orientation] = cardStr.split('|');
          const isReversed = orientation === 'reversed';
          const deckCard = tarotDeck.find((c) => c.id === cardId);
          return {
            id: cardId,
            name: deckCard ? deckCard.name : 'Unknown Card',
            clan: deckCard ? deckCard.clan : 'Unknown Clan',
            isReversed,
            position,
          };
        });

        return {
          id: reading.id,
          question: reading.question,
          cards: mappedCards,
          response: reading.response,
          ercChange: reading.ercChange,
          verified: reading.verified,
          snoozeUntil: reading.snoozeUntil ? reading.snoozeUntil.toISOString() : null,
          snoozeCount: reading.snoozeCount,
          createdAt: reading.createdAt.toISOString(),
        };
      });

      const filteredReadings = mappedReadings.filter((reading) =>
        reading.cards.some((card) => card.clan === clan)
      );

      total = filteredReadings.length;
      paginatedReadings = filteredReadings.slice((page - 1) * limit, page * limit);
    }

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      readings: paginatedReadings,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
