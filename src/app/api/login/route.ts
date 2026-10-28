import { prisma } from '../../../../lib/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Setup Prisma
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // 1. Cari user berdasarkan username (kolom 'username' di database)
    const user = await prisma.user.findUnique({ 
      where: { username: username } 
    });

    // 2. Cek password
    if (!user || user.password !== password) {
      return NextResponse.json({ error: 'Username atau password salah' }, { status: 401 });
    }

    // 3. Set Cookie dengan cara yang benar (wajib di-await)
    const cookieStore = await cookies();
    cookieStore.set({
      name: 'user_session',
      value: JSON.stringify({ id: user.id, name: user.name, role: user.role }),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 hari
      path: '/',
    });

    return NextResponse.json({ success: true, user });
    
  } catch (error: any) {
    // Tampilkan error asli di terminal agar kita tahu penyebabnya
    console.error("=== ERROR LOGIN ===");
    console.error(error.message);
    return NextResponse.json({ error: 'Terjadi kesalahan sistem. Cek terminal CMD.' }, { status: 500 });
  }
}