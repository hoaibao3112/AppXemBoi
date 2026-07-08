// Applying pattern from: nextjs-fullstack-best-practices
import { NextRequest, NextResponse } from 'next/server';
import { threadService } from '@/services/thread.service';
import { handleError } from '@/lib/errors';
import { z } from 'zod';

const redeemSchema = z.object({
  code: z.string().min(1, 'Mã liên kết không được để trống').max(50),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Check feature flag
    if (process.env.NEXT_PUBLIC_ENABLE_THREAD_LINK === 'false') {
      return NextResponse.json({ error: 'Tính năng Sợi Chỉ Xuyên Sương đang được bảo trì.' }, { status: 403 });
    }

    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized. User context missing.' }, { status: 401 });
    }

    const body = await req.json();
    const { code } = redeemSchema.parse(body);

    const link = await threadService.redeemCode(userId, code);

    return NextResponse.json({
      success: true,
      message: 'Dệt sợi chỉ xuyên sương thành công!',
      link,
    });
  } catch (error) {
    // Custom error handler helper or directly returning structured error
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return handleError(error);
  }
}
