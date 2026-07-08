// Applying pattern from: nextjs-fullstack-best-practices
import { describe, it, expect } from 'vitest';
import { calculateSoulCard } from '../../lib/auth';
import {
  calculatePartnerClan,
  determineCompatibilityBranch
} from '../../lib/compatibility';
import { drawCards } from '../../lib/tarot';

describe('Compatibility & Tarot Helpers Tests', () => {
  describe('calculateSoulCard', () => {
    it('should correctly calculate soul card from birthdate', () => {
      // 1998-07-15 -> 1+9+9+8+0+7+1+5 = 40 -> 4 -> the-emperor
      expect(calculateSoulCard('1998-07-15')).toBe('the-emperor');
      
      // 1995-10-10 -> 1+9+9+5+1+0+1+0 = 26 -> 2+6 = 8 -> strength
      expect(calculateSoulCard('1995-10-10')).toBe('strength');

      // Edge cases: empty/invalid string -> should fallback to the-fool
      expect(calculateSoulCard('')).toBe('the-fool');
    });
  });

  describe('calculatePartnerClan', () => {
    it('should resolve correct clan name from soul card ID', () => {
      expect(calculatePartnerClan('the-emperor')).toBe('DiemHoa');
      expect(calculatePartnerClan('the-high-priestess')).toBe('ThuyNguyet');
      expect(calculatePartnerClan('the-fool')).toBe('VoThuong');
      expect(calculatePartnerClan('invalid-id')).toBe('VoThuong');
    });
  });

  describe('determineCompatibilityBranch', () => {
    it('should determine "mirror" if clans are identical and not VoThuong', () => {
      expect(determineCompatibilityBranch('ThuyNguyet', 'ThuyNguyet')).toBe('mirror');
      expect(determineCompatibilityBranch('DiemHoa', 'DiemHoa')).toBe('mirror');
    });

    it('should determine "neutral" if either clan is VoThuong', () => {
      expect(determineCompatibilityBranch('ThuyNguyet', 'VoThuong')).toBe('neutral');
      expect(determineCompatibilityBranch('VoThuong', 'ThoKim')).toBe('neutral');
      expect(determineCompatibilityBranch('VoThuong', 'VoThuong')).toBe('neutral');
    });

    it('should determine "harmony" for generative (Tương Sinh) element pairs', () => {
      expect(determineCompatibilityBranch('ThuyNguyet', 'ThoKim')).toBe('harmony');
      expect(determineCompatibilityBranch('DiemHoa', 'PhongKiem')).toBe('harmony');
    });

    it('should determine "tension" for conflicting (Tương Khắc) element pairs', () => {
      expect(determineCompatibilityBranch('ThuyNguyet', 'DiemHoa')).toBe('tension');
      expect(determineCompatibilityBranch('PhongKiem', 'ThoKim')).toBe('tension');
    });
  });

  describe('drawCards', () => {
    it('should draw the exact number of cards requested', () => {
      const result = drawCards(3);
      expect(result).toHaveLength(3);
      expect(result[0]).toHaveProperty('card');
      expect(result[0]).toHaveProperty('isReversed');
    });

    it('should draw unique cards in a single draw session', () => {
      const result = drawCards(5);
      const ids = result.map(r => r.card.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(5);
    });

    it('should throw error if count is invalid', () => {
      expect(() => drawCards(0)).toThrow();
      expect(() => drawCards(100)).toThrow();
    });
  });
});
