// Applying pattern from: nextjs-fullstack-best-practices
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const verifySchema = z.object({
  readingId: z.string().uuid(),
  status: z.enum(['correct', 'incorrect', 'snooze']),
});

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized. User context missing.' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = verifySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request body parameters.' }, { status: 400 });
    }

    const { readingId, status } = parsed.data;

    // Fetch the target reading
    const reading = await prisma.reading.findUnique({
      where: { id: readingId }
    });

    if (!reading || reading.userId !== userId) {
      return NextResponse.json({ error: 'Quẻ bói không tồn tại hoặc không thuộc về lữ khách.' }, { status: 404 });
    }

    // Verify time window limit: Must be between 3 and 30 days old
    const ageInMs = Date.now() - new Date(reading.createdAt).getTime();
    const ageInDays = ageInMs / (1000 * 60 * 60 * 24);
    if (ageInDays < 3 || ageInDays > 30) {
      return NextResponse.json({
        error: 'Chỉ được đối chiếu các quẻ bói trong khoảng thời gian từ 3 đến 30 ngày kể từ lúc rút.'
      }, { status: 400 });
    }

    // Handle Snooze
    if (status === 'snooze') {
      if (reading.verified !== null) {
        return NextResponse.json({ error: 'Quẻ bài đã được đối chiếu, không thể hoãn.' }, { status: 400 });
      }
      if (reading.snoozeCount >= 2) {
        return NextResponse.json({ error: 'Lữ khách đã hoãn đối chiếu quẻ này tối đa 2 lần.' }, { status: 400 });
      }

      const nextSnoozeCount = reading.snoozeCount + 1;
      const result = await prisma.reading.updateMany({
        where: {
          id: readingId,
          userId: userId,
          verified: null,
          snoozeCount: reading.snoozeCount
        },
        data: {
          snoozeCount: nextSnoozeCount,
          snoozeUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Hoãn 7 ngày
        }
      });

      if (result.count === 0) {
        return NextResponse.json({ error: 'Có lỗi xảy ra trong quá trình xử lý hoãn.' }, { status: 400 });
      }

      await prisma.appEvent.create({
        data: {
          userId,
          eventType: 'verify_clicked_snooze',
          relatedEntityId: readingId,
          metadata: { snoozeCount: nextSnoozeCount }
        }
      });

      return NextResponse.json({
        message: 'Đã hoãn đối chiếu thêm 7 ngày.',
        commentary: 'Được, có những chuyện sương mù cần thêm thời gian để lắng xuống mới thấy rõ đáy. Ta sẽ hỏi lại ngươi sau.',
        audioUrl: '/audio/verify-snooze.mp3',
      });
    }

    // Handle Correct / Incorrect
    const verifiedVal = status === 'correct';

    // Atomic update to mark reading verified, ensuring idempotency
    const updateResult = await prisma.reading.updateMany({
      where: {
        id: readingId,
        userId: userId,
        verified: null
      },
      data: {
        verified: verifiedVal,
        verifiedAt: new Date()
      }
    });

    if (updateResult.count === 0) {
      return NextResponse.json({ error: 'Quẻ bói đã được đối chiếu trước đó.' }, { status: 400 });
    }

    await prisma.appEvent.create({
      data: {
        userId,
        eventType: verifiedVal ? 'verify_clicked_correct' : 'verify_clicked_incorrect',
        relatedEntityId: readingId
      }
    });

    // Retrieve and atomically increment cumulative stats to avoid race conditions
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        totalVerified: { increment: 1 },
        totalCorrect: { increment: verifiedVal ? 1 : 0 },
      },
    });

    const totalVerified = updatedUser.totalVerified;
    const totalCorrect = updatedUser.totalCorrect;
    const accuracyPercent = (totalCorrect / totalVerified) * 100;

    let badgeTier = 'fog';
    if (totalVerified >= 5) {
      if (accuracyPercent < 40) {
        badgeTier = 'fog';
      } else if (accuracyPercent < 65) {
        badgeTier = 'understanding';
      } else if (accuracyPercent < 85) {
        badgeTier = 'confidant';
      } else {
        badgeTier = 'seer';
      }
    }

    // Write back the derived stats
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        accuracyPercent,
        badgeTier,
      },
    });

    // Select templates based on User's current ERC score
    let responseText = '';
    let audioUrl = '';

    if (verifiedVal) {
      if (user.erc >= 30) {
        responseText = 'Một trái tim rộng mở của người bạn hiền hòa luôn tìm thấy sự đồng điệu với sương mù. Vọng vui vì điều đó đã mang lại ý nghĩa cho ngươi.';
        audioUrl = '/audio/verify-correct-warm.mp3';
      } else if (user.erc <= -30) {
        responseText = 'Lý trí của hành giả cô độc đã đúng. Số mệnh hiển hiện lạnh lùng và chính xác trước mắt ngươi.';
        audioUrl = '/audio/verify-correct-cold.mp3';
      } else {
        responseText = 'Vọng cũng không ngờ sương mù lại soi tỏ đúng đến vậy. Ta ghi nhớ sự ứng nghiệm này, lữ khách.';
        audioUrl = '/audio/verify-correct-neutral.mp3';
      }
    } else {
      if (user.erc >= 30) {
        responseText = 'Người bạn hiền của ta, sương mù đôi khi cũng có những bóng mờ làm che lối. Cảm ơn ngươi đã bao dung chỉ bảo cho ta biết sự thật.';
        audioUrl = '/audio/verify-incorrect-warm.mp3';
      } else if (user.erc <= -30) {
        responseText = 'Sương mù đã đoán sai, và điều đó chứng minh ý chí tự lập của hành giả cô độc mạnh mẽ hơn số mệnh định sẵn. Ta trân trọng sự thẳng thắn này.';
        audioUrl = '/audio/verify-incorrect-cold.mp3';
      } else {
        responseText = 'Vậy sao... Vọng cũng không phải lúc nào cũng nhìn thấu hết cõi lòng con người. Cảm ơn lữ khách đã thành thật nói cho ta biết.';
        audioUrl = '/audio/verify-incorrect-neutral.mp3';
      }
    }

    return NextResponse.json({
      message: 'Đối chiếu thành công.',
      commentary: responseText,
      audioUrl,
      stats: {
        totalVerified,
        totalCorrect,
        accuracyPercent,
        badgeTier,
      }
    });
  } catch (error) {
    console.error('Verify API error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
