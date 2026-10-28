import { prisma } from '../../../lib/prisma';
import { NextResponse } from 'next/server';
import { del } from '@vercel/blob';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const laporan = await prisma.laporan.findUnique({ where: { id } });

    if (!laporan) return NextResponse.json({ error: 'Laporan tidak ditemukan' }, { status: 404 });

    if (laporan.fileUrl) {
      try {
        await del(laporan.fileUrl);
      } catch (blobError) {
        console.warn("Gagal hapus file Blob:", blobError);
      }
    }

    await prisma.laporan.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Laporan berhasil dihapus' });
  } catch (error) {
    console.error("Error delete:", error);
    return NextResponse.json({ error: 'Gagal menghapus laporan' }, { status: 500 });
  }
}

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
      data: { judul, tanggalDinas: tglDinas, status },
    });

    return NextResponse.json({ success: true, data: updatedLaporan });
  } catch (error) {
    console.error("Error edit:", error);
    return NextResponse.json({ error: 'Gagal mengedit laporan' }, { status: 500 });
  }
}