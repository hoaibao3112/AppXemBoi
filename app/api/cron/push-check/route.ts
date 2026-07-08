// Applying pattern from: nextjs-fullstack-best-practices
import { NextRequest, NextResponse } from 'next/server';
import { runPushDispatcher } from '@/lib/push-dispatcher';
import { handleError } from '@/lib/errors';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    const cronSecret = process.env.CRON_SECRET;

    // Secure authorization checking in production (fail-closed)
    if (!cronSecret) {
      return NextResponse.json({ error: 'Server misconfigured: CRON_SECRET is missing.' }, { status: 500 });
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized. Invalid CRON token.' }, { status: 401 });
    }

    const stats = await runPushDispatcher();

    return NextResponse.json({
      message: 'Lập lịch gửi push hoàn tất.',
      stats,
    });
  } catch (error) {
    return handleError(error);
  }
}

// Support GET for external simple webhook tools (like Vercel Cron)
export async function GET(req: NextRequest) {
  return POST(req);
}
