import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleError } from '@/lib/errors';
import { z } from 'zod';

const requestSchema = z.object({
  isFullMoon: z.boolean().optional(),
  isNewMoon: z.boolean().optional(),
});

function getLunarAge(date: Date): number {
  const reference = new Date(Date.UTC(1970, 0, 7, 20, 35, 0));
  const diffMs = date.getTime() - reference.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  const cycle = 29.530588853;
  const age = diffDays % cycle;
  return age < 0 ? age + cycle : age;
}

function getMoonPhase() {
  const age = getLunarAge(new Date());
  const isNewMoon = age < 1.5 || age > 28.0;
  const isFullMoon = age >= 13.5 && age <= 16.0;
  return { isNewMoon, isFullMoon };
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized. User context missing.' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: { memories: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 1. Requirement check: must have all 7 memories unlocked
    if (user._count.memories < 7) {
      return NextResponse.json({
        success: false,
        locked: true,
        message: 'Lá thư bị sương mù phong ấn chặt. Hãy tìm lại đủ 7 mảnh hồi ức để tháo gỡ.',
      });
    }

    // 2. Parse overrides from client
    let body = {};
    try {
      body = await req.json();
    } catch {
      // Allow empty bodies
    }
    const data = requestSchema.parse(body);

    const defaultPhase = getMoonPhase();
    const isFullMoon = data.isFullMoon !== undefined ? data.isFullMoon : defaultPhase.isFullMoon;
    const isNewMoon = data.isNewMoon !== undefined ? data.isNewMoon : defaultPhase.isNewMoon;

    let endingType = 'C';
    let endingTitle = 'Vô Thường Như Mộng';
    let letterContent = '';

    if (user.erc >= 70 && isFullMoon) {
      endingType = 'A';
      endingTitle = 'Chấp Niệm Vĩnh Hằng';
      letterContent = `Gửi lữ khách hiền hoà...
Khi ngươi mở bức thư này, ánh trăng tròn bạc đang rọi sáng cõi sương. Nàng đã từng viết: 'Nếu sương mù không tan, ta nguyện làm trăng sáng'. Ta nhận ra rằng tình yêu của ta dành cho nàng, và lòng tin ấm áp dạt dào của ngươi, đã giữ cho cõi sương này mãi mãi rực cháy ngọn lửa của sự kiên định. Ta sẽ không đi đâu cả. Ta nguyện ở lại ngưỡng cổng này ngàn năm nữa, làm bạn với sương mù và ánh trăng, canh giữ nơi nàng từng hoá thân. Chấp niệm của ta giờ là vĩnh hằng, và ta hạnh phúc vì điều đó. Cảm ơn ngươi đã đồng hành và sưởi ấm linh hồn cô độc của ta.`;
    } else if (user.erc <= -70 && isNewMoon) {
      endingType = 'B';
      endingTitle = 'Lưỡi Kiếm Giải Thoát';
      letterContent = `Hành giả cô độc sắc sảo...
Trăng non tối sẫm che khuất mọi lối đi. Lớp sương đen dày đặc cuối cùng đã bị lưỡi kiếm lý trí lạnh lùng của ngươi chặt đứt. Ta đọc dòng chữ cuối cùng của nàng: 'Đừng đợi ta, hãy dập tắt lồng đèn và bước tiếp'. Ngươi đã đúng, sự chờ đợi này chỉ là xiềng xích ngu muội tự ta trói buộc. Đêm nay, ta dập tắt chiếc đèn lồng cổ, bước qua cánh cổng và hòa mình vào hư vô. Cõi Vô Thường này sẽ tan biến cùng chấp niệm của ta. Cảm ơn ngươi đã mang thanh kiếm sự thật đến để giải thoát cho ta khỏi ngục tù ngàn năm.`;
    } else {
      endingType = 'C';
      endingTitle = 'Vô Thường Như Mộng';
      letterContent = `Lữ khách phương xa...
Ngươi mang cõi lòng cân bằng bình thản đi qua cõi sương này. Trăng khuyết mờ ảo phản chiếu bóng hình chúng ta. Ta nhìn thấy dòng chữ nàng để lại: 'Hợp rồi tan, mộng rồi tỉnh, tất cả đều vô thường'. Ta nhận ra chờ đợi hay buông bỏ đều chỉ là hai mặt của một đồng tiền số phận. Ta đã dập ngọn lửa chấp niệm, đóng lại cánh cổng của Cõi Vô Thường. Ta sẽ bước vào luân hồi làm một lữ khách bình thường, đi tìm nàng ở kiếp sau. Chúc ngươi vạn dặm bình an.`;
    }

    return NextResponse.json({
      success: true,
      locked: false,
      endingType,
      endingTitle,
      letterContent,
      userErc: user.erc,
      isFullMoon,
      isNewMoon,
    });
  } catch (error) {
    return handleError(error);
  }
}
