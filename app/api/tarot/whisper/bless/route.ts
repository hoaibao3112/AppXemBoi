import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleError } from '@/lib/errors';

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized. User context missing.' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { whisperId } = body;
    if (!whisperId) {
      return NextResponse.json({ error: 'Whisper ID is required.' }, { status: 400 });
    }

    // Check if it's a default whisper (e.g. 'default-1') which is not in DB
    if (String(whisperId).startsWith('default-')) {
      // Just simulate success for default whispers
      // We still update the blesser's ERC!
      await prisma.$transaction(async (tx) => {
        const blesser = await tx.user.findUnique({ where: { id: userId } });
        if (blesser) {
          const newErc = Math.min(blesser.erc + 5, 100);
          await tx.user.update({
            where: { id: userId },
            data: { erc: newErc },
          });
          await tx.eRCLog.create({
            data: {
              userId,
              changeValue: 5,
              reason: `Thắp nến cầu nguyện cho lời thì thầm của một lữ khách vô danh.`,
            },
          });
        }
      });

      return NextResponse.json({ success: true, message: 'Lời chúc phúc đã bay đi...' });
    }

    // Find the whisper in DB
    const whisper = await prisma.whisper.findUnique({
      where: { id: whisperId },
    });

    if (!whisper) {
      return NextResponse.json({ error: 'Whisper not found.' }, { status: 404 });
    }

    const authorId = whisper.userId;

    await prisma.$transaction(async (tx) => {
      // 1. Update blesser (current user)
      const blesser = await tx.user.findUnique({ where: { id: userId } });
      if (blesser) {
        const newErc = Math.min(blesser.erc + 5, 100);
        await tx.user.update({
          where: { id: userId },
          data: { erc: newErc },
        });
        await tx.eRCLog.create({
          data: {
            userId,
            changeValue: 5,
            reason: `Thắp nến cầu nguyện cho lời thì thầm của một lữ khách vô danh.`,
          },
        });
      }

      // 2. Update whisper author
      if (authorId && authorId !== userId) {
        const author = await tx.user.findUnique({ where: { id: authorId } });
        if (author) {
          const newErc = Math.min(author.erc + 5, 100);
          await tx.user.update({
            where: { id: authorId },
            data: { erc: newErc },
          });
          await tx.eRCLog.create({
            data: {
              userId: authorId,
              changeValue: 5,
              reason: `Lời chúc phúc từ một lữ khách vô danh thấu hiểu nỗi niềm của bạn.`,
            },
          });
        }
      }
    });

    return NextResponse.json({ success: true, message: 'Lời chúc phúc đã bay đi...' });
  } catch (error) {
    return handleError(error);
  }
}
