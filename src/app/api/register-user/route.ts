import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { NextResponse } from 'next/server';

// Setup Prisma dengan Adapter (Sesuai Prisma 7)
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export async function POST(request: Request) {
  try {
    const { id, email, name } = await request.json();

    // Validasi sederhana
    if (!id || !email || !name) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    // Simpan user baru ke database
    await prisma.user.create({
      data: { 
        id: id, 
        email: email, 
        name: name, 
        password: '-', // Password tidak dipakai lagi karena autentikasi via Supabase Auth
        role: 'PEGAWAI' 
      },
    });

    return NextResponse.json({ success: true, message: 'User berhasil didaftarkan' });
  } catch (error) {
    console.error("Error register user:", error);
    return NextResponse.json({ error: 'Gagal menyimpan data user ke database' }, { status: 500 });
  }
}