import { PrismaClient } from '../../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('logo') as File;
    if (!file) return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 });

    // Upload ke Vercel Blob
    const blob = await put('logo-perusahaan.png', file, {
      access: 'public',
      allowOverwrite: true,
    });

    // Simpan URL ke database
    await prisma.pengaturan.upsert({
      where: { id: 'global' },
      update: { logoUrl: blob.url },
      create: { id: 'global', logoUrl: blob.url },
    });

    return NextResponse.json({ success: true, logoUrl: blob.url });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Gagal upload logo' }, { status: 500 });
  }
}