import { PrismaClient } from '../../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { NextResponse } from 'next/server';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export async function GET() {
  try {
    // Ambil semua user dengan role PEGAWAI, urutkan berdasarkan nama
    const users = await prisma.user.findMany({
      where: { role: 'PEGAWAI' },
      orderBy: { name: 'asc' },
    });
    
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error ambil data user:", error);
    return NextResponse.json({ error: 'Gagal mengambil data user' }, { status: 500 });
  }
}