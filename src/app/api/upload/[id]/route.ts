import { PrismaClient } from '../../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { NextResponse } from 'next/server';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// FUNGSI HAPUS LAPORAN
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.laporan.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Laporan berhasil dihapus' });
  } catch (error) {
    console.error("Error delete:", error);
    return NextResponse.json({ error: 'Gagal menghapus laporan' }, { status: 500 });
  }
}

// FUNGSI EDIT LAPORAN (Hanya Judul & Tanggal)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { judul, tanggal } = body;

    const tglDinas = new Date(tanggal);
    const hariIni = new Date();
    const selisihHari = Math.floor((hariIni.getTime() - tglDinas.getTime()) / (1000 * 3600 * 24));
    const status = selisihHari > 3 ? 'TERLAMBAT' : 'TEPAT_WAKTU';

    const updatedLaporan = await prisma.laporan.update({
      where: { id },
      data: {
        judul: judul,
        tanggalDinas: tglDinas,
        status: status,
      },
    });

    return NextResponse.json({ success: true, data: updatedLaporan });
  } catch (error) {
    console.error("Error edit:", error);
    return NextResponse.json({ error: 'Gagal mengedit laporan' }, { status: 500 });
  }
}