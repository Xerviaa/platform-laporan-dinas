import { PrismaClient } from '../../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const judul = formData.get('judul') as string;
    const tanggalDinas = formData.get('tanggal') as string;
    const userId = formData.get('userId') as string;

    if (!file || !judul || !tanggalDinas || !userId) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    const blob = await put(file.name, file, { access: 'public', allowOverwrite: true });

    const tglDinas = new Date(tanggalDinas);
    const hariIni = new Date();
    const selisihHari = Math.floor((hariIni.getTime() - tglDinas.getTime()) / (1000 * 3600 * 24));
    const status = selisihHari > 3 ? 'TERLAMBAT' : 'TEPAT_WAKTU';

    const laporan = await prisma.laporan.create({
      data: { judul, tanggalDinas: tglDinas, fileUrl: blob.url, status, userId },
    });

    return NextResponse.json({ success: true, data: laporan });
  } catch (error) {
    console.error("Error detail:", error);
    return NextResponse.json({ error: 'Gagal upload laporan' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const laporan = await prisma.laporan.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true } } }
    });
    return NextResponse.json(laporan);
  } catch (error) {
    console.error("Error GET detail:", error);
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 });
  }
}