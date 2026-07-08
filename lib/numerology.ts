// Applying pattern from: nextjs-fullstack-best-practices
// Utility file to calculate Zodiac Sign and Life Path number based on date of birth.

export interface ZodiacInfo {
  sign: string;
  element: 'Lửa' | 'Nước' | 'Khí' | 'Đất';
}

export interface LifePathInfo {
  number: number;
  description: string;
}

/**
 * Calculates the Zodiac sign and its elemental association from a birthDate object.
 */
export function getZodiacInfo(birthDate: Date): ZodiacInfo {
  const month = birthDate.getMonth() + 1; // 1-12
  const day = birthDate.getDate(); // 1-31

  // Aries: Mar 21 - Apr 19 (Lửa)
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) {
    return { sign: 'Bạch Dương (Aries)', element: 'Lửa' };
  }
  // Taurus: Apr 20 - May 20 (Đất)
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) {
    return { sign: 'Kim Ngưu (Taurus)', element: 'Đất' };
  }
  // Gemini: May 21 - Jun 20 (Khí)
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) {
    return { sign: 'Song Tử (Gemini)', element: 'Khí' };
  }
  // Cancer: Jun 21 - Jul 22 (Nước)
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) {
    return { sign: 'Cự Giải (Cancer)', element: 'Nước' };
  }
  // Leo: Jul 23 - Aug 22 (Lửa)
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) {
    return { sign: 'Sư Tử (Leo)', element: 'Lửa' };
  }
  // Virgo: Aug 23 - Sep 22 (Đất)
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) {
    return { sign: 'Xử Nữ (Virgo)', element: 'Đất' };
  }
  // Libra: Sep 23 - Oct 22 (Khí)
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) {
    return { sign: 'Thiên Bình (Libra)', element: 'Khí' };
  }
  // Scorpio: Oct 23 - Nov 21 (Nước)
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) {
    return { sign: 'Bọ Cạp (Scorpio)', element: 'Nước' };
  }
  // Sagittarius: Nov 22 - Dec 21 (Lửa)
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) {
    return { sign: 'Nhân Mã (Sagittarius)', element: 'Lửa' };
  }
  // Capricorn: Dec 22 - Jan 19 (Đất)
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
    return { sign: 'Ma Kết (Capricorn)', element: 'Đất' };
  }
  // Aquarius: Jan 20 - Feb 18 (Khí)
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) {
    return { sign: 'Bảo Bình (Aquarius)', element: 'Khí' };
  }
  // Pisces: Feb 19 - Mar 20 (Nước)
  return { sign: 'Song Ngư (Pisces)', element: 'Nước' };
}

/**
 * Calculates the Life Path Number and its corresponding personality trait from a birthDate ISO string.
 */
export function getLifePathInfo(birthDateStr: string): LifePathInfo {
  // Extract all digits from birthDate string (e.g. "1998-07-15" -> [1, 9, 9, 8, 0, 7, 1, 5])
  const digits = birthDateStr.replace(/\D/g, '').split('').map(Number);
  
  if (digits.length === 0) {
    return { number: 1, description: 'Người tiên phong, quyết đoán và độc lập.' };
  }

  // Sum all digits
  let sum = digits.reduce((acc, val) => acc + val, 0);

  // Reduce sum repeatedly unless it is a master number (11, 22) or single digit (1-9)
  while (sum > 9 && sum !== 11 && sum !== 22) {
    sum = sum.toString().split('').map(Number).reduce((acc, val) => acc + val, 0);
  }

  const descriptions: Record<number, string> = {
    1: 'Người tiên phong, độc lập, quyết đoán và có tài lãnh đạo thiên bẩm.',
    2: 'Người hòa giải, thấu cảm sâu sắc, nhạy bén và giỏi kết nối tâm giao.',
    3: 'Người truyền cảm hứng, sáng tạo phong phú và tràn đầy khả năng biểu đạt.',
    4: 'Người xây dựng, thực tế, kỷ luật, vững chãi và cực kỳ đáng tin cậy.',
    5: 'Kẻ tự do, thích phiêu lưu, khao khát trải nghiệm và thích nghi nhạy bén.',
    6: 'Người nuôi dưỡng, giàu lòng nhân ái, có trách nhiệm che chở và yêu thương.',
    7: 'Nhà thông thái cô độc, chiêm nghiệm sâu sắc và bền bỉ tìm kiếm chân lý.',
    8: 'Nhà điều hành mạnh mẽ, tham vọng lớn, hướng tới sự thịnh vượng bền vững.',
    9: 'Nhà nhân đạo, bao dung, có lý tưởng cao đẹp và năng lực chữa lành tự nhiên.',
    11: 'Nhà trực giác vĩ đại, mang năng lượng tâm linh nhạy bén và truyền cảm hứng.',
    22: 'Nhà kiến tạo bậc thầy, có khả năng hiện thực hóa các tầm nhìn vĩ mô.'
  };

  return {
    number: sum,
    description: descriptions[sum] || 'Linh hồn chiêm nghiệm, trầm lắng.'
  };
}
