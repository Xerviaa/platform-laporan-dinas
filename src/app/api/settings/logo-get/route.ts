import { PrismaClient } from '../../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { NextResponse } from 'next/server';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export async function GET() {
  try {
    const setting = await prisma.pengaturan.findUnique({ where: { id: 'global' } });
    return NextResponse.json({ logoUrl: setting?.logoUrl || '/logo.png' }); // Fallback ke logo default
  } catch (error) {
    return NextResponse.json({ logoUrl: '/logo.png' });
  }
}