import { prisma } from '../../../../lib/prisma';
import { NextResponse } from 'next/server';

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