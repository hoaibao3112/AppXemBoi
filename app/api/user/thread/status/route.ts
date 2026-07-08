// Applying pattern from: nextjs-fullstack-best-practices
import { NextRequest, NextResponse } from 'next/server';
import { threadService } from '@/services/thread.service';
import { handleError } from '@/lib/errors';

export async function GET(req: NextRequest) {
  try {
    // 1. Check feature flag
    if (process.env.NEXT_PUBLIC_ENABLE_THREAD_LINK === 'false') {
      return NextResponse.json({ error: 'Tính năng Sợi Chỉ Xuyên Sương đang được bảo trì.' }, { status: 403 });
    }

    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized. User context missing.' }, { status: 401 });
    }

    const status = await threadService.getThreadStatus(userId);

    return NextResponse.json(status);
  } catch (error) {
    return handleError(error);
  }
}
