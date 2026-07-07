import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export function handleError(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: 'Validation error', details: error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }
  }

  console.error('[API Error]', error);
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}
