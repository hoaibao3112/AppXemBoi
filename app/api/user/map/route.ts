import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleError } from '@/lib/errors';
import { tarotDeck } from '@/lib/tarot';

const clanNamesVi: Record<string, string> = {
  DiemHoa: 'Tộc Diễm Hoả',
  ThuyNguyet: 'Tộc Thuỷ Nguyệt',
  PhongKiem: 'Tộc Phong Kiếm',
  ThoKim: 'Tộc Thổ Kim',
  VoThuong: 'Cõi Vô Thường',
};

const treasureMap: Record<string, string> = {
  DiemHoa: 'Ngọn Lửa Không Tắt',
  ThuyNguyet: 'Chén Bạc Vô Tận',
  PhongKiem: 'Thanh Kiếm Phong Ấn',
  ThoKim: 'Hạt Giống Vĩnh Hằng',
  VoThuong: 'Mảnh Gương Vô Thường',
};

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized. User context missing.' }, { status: 401 });
    }

    // Get all user readings to compute encounters
    const readings = await prisma.reading.findMany({
      where: { userId },
      select: { cards: true },
    });

    // Count encounter frequency for each card
    const cardEncounterMap: Record<string, number> = {};
    for (const reading of readings) {
      for (const cardStr of reading.cards) {
        const cardId = cardStr.split('|')[0];
        cardEncounterMap[cardId] = (cardEncounterMap[cardId] || 0) + 1;
      }
    }

    const clansList = ['DiemHoa', 'ThuyNguyet', 'PhongKiem', 'ThoKim', 'VoThuong'];
    const regions = clansList.map((clan) => {
      const clanCards = tarotDeck.filter((c) => c.clan === clan);
      const totalCards = clanCards.length;

      const discoveredCards: {
        cardId: string;
        cardName: string;
        encounterCount: number;
        brightness: number;
      }[] = [];

      const undiscoveredCards: {
        cardId: string;
        cardName: string;
      }[] = [];

      for (const card of clanCards) {
        const count = cardEncounterMap[card.id] || 0;
        if (count > 0) {
          discoveredCards.push({
            cardId: card.id,
            cardName: card.name,
            encounterCount: count,
            brightness: Math.min(count / 5.0, 1.0),
          });
        } else {
          undiscoveredCards.push({
            cardId: card.id,
            cardName: card.name,
          });
        }
      }

      const discoveredCount = discoveredCards.length;
      const isCompleted = discoveredCount === totalCards;
      const treasure = isCompleted ? (treasureMap[clan] || null) : null;

      return {
        clan,
        clanNameVi: clanNamesVi[clan] || clan,
        totalCards,
        discoveredCards,
        undiscoveredCards,
        discoveredCount,
        isCompleted,
        treasure,
      };
    });

    return NextResponse.json({ regions });
  } catch (error) {
    return handleError(error);
  }
}
