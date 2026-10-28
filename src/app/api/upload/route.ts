import { put } from '@vercel/blob';
import { PrismaClient } from '../../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { NextResponse } from 'next/server';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const judul = formData.get('judul') as string;
    const tanggalDinas = formData.get('tanggal') as string;
    const userId = formData.get('userId') as string; // <-- Ambil ID Pegawai dari form

    if (!file || !judul || !tanggalDinas || !userId) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    // Upload file ke Vercel Blob
    const blob = await put(file.name, file, {
      access: 'public',
      allowOverwrite: true, 
    });

    // Logika status
    const tglDinas = new Date(tanggalDinas);
    const hariIni = new Date();
    const selisihHari = Math.floor((hariIni.getTime() - tglDinas.getTime()) / (1000 * 3600 * 24));
    const status = selisihHari > 3 ? 'TERLAMBAT' : 'TEPAT_WAKTU';

    // Simpan ke database dengan userId dari form
    const laporan = await prisma.laporan.create({
      data: {
        judul: judul,
        tanggalDinas: tglDinas,
        fileUrl: blob.url,
        status: status,
        userId: userId, // <-- Gunakan userId dari form
      },
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
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 });
  }
}