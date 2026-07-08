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

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { erc: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    const dbMemories = await prisma.unlockedMemory.findMany({
      where: { userId },
      orderBy: { memoryIndex: 'asc' },
    });

    const unlocked = await Promise.all(dbMemories.map(async (dbMem) => {
      const staticMem = VONG_MEMORIES.find((m) => m.index === dbMem.memoryIndex);
      let dialogue = 'Chưa thể chạm tới mảnh ký ức này.';
      if (dbMem.memoryIndex === 8) {
        const link = await prisma.threadLink.findFirst({
          where: {
            OR: [
              { userAId: userId, status: 'completed' },
              { userBId: userId, status: 'completed' }
            ]
          }
        });
        if (link) {
          if (link.userBId === userId) {
            dialogue = `Ai đó đã nghĩ đến ngươi khi bước qua cổng sương này, lữ khách. Họ đã dệt một sợi chỉ và trao nó vào tay ngươi trước cả khi ngươi kịp hỏi vì sao. Đó là điều Khanh từng làm cho ta — chọn ở lại vì một người, không cần lý do to tát. Ngươi không cần phải đáp lại bằng điều gì lớn lao, lữ khách ạ. Chỉ cần nhớ rằng, hôm nay, có một người đã nghĩ đến ngươi trước.`;
          } else {
            dialogue = `Lữ khách, ngươi vừa làm được điều mà rất ít ai chịu làm — ngươi đã chìa tay ra và kéo một người khác bước qua cổng sương cùng mình. Đó chính xác là những gì Khanh đã từng làm cho ta. Khanh không phải người ta yêu, mà là người bạn đã chọn ở lại một mùa sương dài, chỉ để ta không phải một mình đếm bước chân qua cổng. Rồi một ngày, Khanh cũng rời đi, nhẹ nhàng như đến. Trước khi đi, Khanh nói: 'Tình bạn xuyên sương không cần níu giữ, nó chỉ cần được nhớ đến đúng lúc.' Ta nhớ đến Khanh mỗi khi thấy hai lữ khách cùng bước qua cổng này như hai người vừa làm. Cảm ơn ngươi đã cho ta nhớ lại điều đó.`;
          }
        }
      } else if (staticMem) {
        if (user.erc >= 30) {
          dialogue = staticMem.dialogueWarm;
        } else if (user.erc <= -30) {
          dialogue = staticMem.dialogueCold;
        } else {
          dialogue = staticMem.dialogueDefault;
        }
      }
      return {
        index: dbMem.memoryIndex,
        title: staticMem ? staticMem.title : 'Ký ức ẩn giấu',
        dialogue,
        unlockedAt: dbMem.unlockedAt.toISOString(),
      };
    }));

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
