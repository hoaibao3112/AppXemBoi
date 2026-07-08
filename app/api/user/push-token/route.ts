// Applying pattern from: nextjs-fullstack-best-practices
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleError } from '@/lib/errors';
import { z } from 'zod';

const pushTokenSchema = z.object({
  pushToken: z.string().min(1).nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized. User context missing.' }, { status: 401 });
    }

    const body = await req.json();
    const { pushToken } = pushTokenSchema.parse(body);

    await prisma.user.update({
      where: { id: userId },
      data: { pushToken },
    });

    return NextResponse.json({
      message: 'Cập nhật push token thành công.',
      pushToken,
    });
  } catch (error) {
    return handleError(error);
  }
}
