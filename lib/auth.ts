import { SignJWT, jwtVerify } from 'jose';
import { NextRequest } from 'next/server';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is missing');
}
const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function signToken(payload: { id: string; email: string }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

/**
 * Calculates the Soul Card (Sứ Giả Hộ Mệnh) based on date of birth (Tarot Numerology).
 * Birth date is expected in ISO/String format (e.g., "1998-07-15").
 */
export function calculateSoulCard(birthDateStr: string): string {
  // Extract digits (e.g. "1998-07-15" -> [1,9,9,8,0,7,1,5])
  const digits = birthDateStr.replace(/\D/g, '').split('').map(Number);
  
  if (digits.length === 0) {
    return 'the-fool'; // Fallback
  }

  // Sum all digits
  let sum = digits.reduce((acc, val) => acc + val, 0);

  // Reduce sum repeatedly if it exceeds 22
  while (sum > 22) {
    sum = sum.toString().split('').map(Number).reduce((acc, val) => acc + val, 0);
  }

  // Map result [0-22] to major arcana card IDs
  const map: Record<number, string> = {
    0: 'the-fool',
    22: 'the-fool',
    1: 'the-magician',
    2: 'the-high-priestess',
    3: 'the-empress',
    4: 'the-emperor',
    5: 'the-hierophant',
    6: 'the-lovers',
    7: 'the-chariot',
    8: 'strength',
    9: 'the-hermit',
    10: 'wheel-of-fortune',
    11: 'justice',
    12: 'the-hanged-man',
    13: 'death',
    14: 'temperance',
    15: 'the-devil',
    16: 'the-tower',
    17: 'the-star',
    18: 'the-moon',
    19: 'the-sun',
    20: 'judgement',
    21: 'the-world'
  };

  return map[sum] || 'the-fool';
}
