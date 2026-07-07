import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { signToken, calculateSoulCard } from '@/lib/auth';
import { handleError } from '@/lib/errors';

const registerSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  password: z.string().min(6),
  name: z.string().optional(),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD').optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);

    // Hash the password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Calculate Soul Card if birth date is provided
    let soulCard: string | null = null;
    let birthDate: Date | null = null;

    if (data.birthDate) {
      soulCard = calculateSoulCard(data.birthDate);
      birthDate = new Date(data.birthDate);
    }

    // Save user to database
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name || null,
        birthDate,
        soulCard,
        clan: 'VoThuong', // Default clan is VoThuong (Vô Thường)
        erc: 0,           // Initial ERC coefficient
      },
      select: {
        id: true,
        email: true,
        name: true,
        clan: true,
        erc: true,
        birthDate: true,
        soulCard: true,
        createdAt: true,
      },
    });

    // Generate JWT token
    const token = await signToken({ id: user.id, email: user.email });

    return NextResponse.json({ user, token }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
