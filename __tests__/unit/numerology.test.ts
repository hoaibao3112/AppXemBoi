// Applying pattern from: nextjs-fullstack-best-practices
import { describe, it, expect } from 'vitest';
import { getZodiacInfo, getLifePathInfo } from '../../lib/numerology';

describe('Numerology Utility Tests', () => {
  describe('getZodiacInfo', () => {
    it('should correctly determine Aries (Bạch Dương - Lửa) and its boundary', () => {
      // Aries: Mar 21 - Apr 19
      const boundaryBefore = new Date('1995-03-20'); // Song Ngư (Nước)
      const boundaryStart = new Date('1995-03-21');  // Bạch Dương (Lửa)
      const boundaryEnd = new Date('1995-04-19');    // Bạch Dương (Lửa)
      const boundaryAfter = new Date('1995-04-20');  // Kim Ngưu (Đất)

      expect(getZodiacInfo(boundaryBefore)).toEqual({ sign: 'Song Ngư (Pisces)', element: 'Nước' });
      expect(getZodiacInfo(boundaryStart)).toEqual({ sign: 'Bạch Dương (Aries)', element: 'Lửa' });
      expect(getZodiacInfo(boundaryEnd)).toEqual({ sign: 'Bạch Dương (Aries)', element: 'Lửa' });
      expect(getZodiacInfo(boundaryAfter)).toEqual({ sign: 'Kim Ngưu (Taurus)', element: 'Đất' });
    });

    it('should correctly determine Taurus (Kim Ngưu - Đất) and its boundary', () => {
      // Taurus: Apr 20 - May 20
      const start = new Date('1995-04-20');
      const end = new Date('1995-05-20');
      const after = new Date('1995-05-21'); // Song Tử

      expect(getZodiacInfo(start)).toEqual({ sign: 'Kim Ngưu (Taurus)', element: 'Đất' });
      expect(getZodiacInfo(end)).toEqual({ sign: 'Kim Ngưu (Taurus)', element: 'Đất' });
      expect(getZodiacInfo(after).sign).toContain('Song Tử');
    });

    it('should correctly determine Gemini (Song Tử - Khí)', () => {
      // Gemini: May 21 - Jun 20
      expect(getZodiacInfo(new Date('1995-05-21')).element).toBe('Khí');
      expect(getZodiacInfo(new Date('1995-06-20')).element).toBe('Khí');
    });

    it('should correctly determine Cancer (Cự Giải - Nước)', () => {
      // Cancer: Jun 21 - Jul 22
      expect(getZodiacInfo(new Date('1995-06-21')).element).toBe('Nước');
      expect(getZodiacInfo(new Date('1995-07-22')).element).toBe('Nước');
    });

    it('should correctly determine Leo (Sư Tử - Lửa)', () => {
      // Leo: Jul 23 - Aug 22
      expect(getZodiacInfo(new Date('1995-07-23')).element).toBe('Lửa');
      expect(getZodiacInfo(new Date('1995-08-22')).element).toBe('Lửa');
    });

    it('should correctly determine Virgo (Xử Nữ - Đất)', () => {
      // Virgo: Aug 23 - Sep 22
      expect(getZodiacInfo(new Date('1995-08-23')).element).toBe('Đất');
      expect(getZodiacInfo(new Date('1995-09-22')).element).toBe('Đất');
    });

    it('should correctly determine Libra (Thiên Bình - Khí)', () => {
      // Libra: Sep 23 - Oct 22
      expect(getZodiacInfo(new Date('1995-09-23')).element).toBe('Khí');
      expect(getZodiacInfo(new Date('1995-10-22')).element).toBe('Khí');
    });

    it('should correctly determine Scorpio (Bọ Cạp - Nước)', () => {
      // Scorpio: Oct 23 - Nov 21
      expect(getZodiacInfo(new Date('1995-10-23')).element).toBe('Nước');
      expect(getZodiacInfo(new Date('1995-11-21')).element).toBe('Nước');
    });

    it('should correctly determine Sagittarius (Nhân Mã - Lửa)', () => {
      // Sagittarius: Nov 22 - Dec 21
      expect(getZodiacInfo(new Date('1995-11-22')).element).toBe('Lửa');
      expect(getZodiacInfo(new Date('1995-12-21')).element).toBe('Lửa');
    });

    it('should correctly determine Capricorn (Ma Kết - Đất)', () => {
      // Capricorn: Dec 22 - Jan 19
      expect(getZodiacInfo(new Date('1995-12-22')).element).toBe('Đất');
      expect(getZodiacInfo(new Date('1996-01-19')).element).toBe('Đất');
    });

    it('should correctly determine Aquarius (Bảo Bình - Khí)', () => {
      // Aquarius: Jan 20 - Feb 18
      expect(getZodiacInfo(new Date('1996-01-20')).element).toBe('Khí');
      expect(getZodiacInfo(new Date('1996-02-18')).element).toBe('Khí');
    });

    it('should correctly determine Pisces (Song Ngư - Nước)', () => {
      // Pisces: Feb 19 - Mar 20
      expect(getZodiacInfo(new Date('1996-02-19')).element).toBe('Nước');
      expect(getZodiacInfo(new Date('1996-03-20')).element).toBe('Nước');
    });
  });

  describe('getLifePathInfo', () => {
    it('should correctly calculate normal single-digit Life Path numbers', () => {
      // 1995-10-10 -> 1+9+9+5+1+0+1+0 = 26 -> 2+6 = 8
      expect(getLifePathInfo('1995-10-10').number).toBe(8);

      // 1990-01-01 -> 1+9+9+0+0+1+0+1 = 21 -> 2+1 = 3
      expect(getLifePathInfo('1990-01-01').number).toBe(3);
    });

    it('should correctly preserve Master Number 11', () => {
      // 2000-01-08 -> 2+0+0+0+0+1+0+8 = 11 (should not reduce to 2)
      const res = getLifePathInfo('2000-01-08');
      expect(res.number).toBe(11);
      expect(res.description).toContain('trực giác vĩ đại');

      // 1998-09-29 -> 1+9+9+8+0+9+2+9 = 47 -> 4+7 = 11
      expect(getLifePathInfo('1998-09-29').number).toBe(11);
    });

    it('should correctly preserve Master Number 22', () => {
      // 2000-09-29 -> 2+0+0+0+0+9+2+9 = 22 (should not reduce to 4)
      const res = getLifePathInfo('2000-09-29');
      expect(res.number).toBe(22);
      expect(res.description).toContain('kiến tạo bậc thầy');
    });

    it('should return fallback if input string has no digits', () => {
      expect(getLifePathInfo('abc-def').number).toBe(1);
    });
  });
});
