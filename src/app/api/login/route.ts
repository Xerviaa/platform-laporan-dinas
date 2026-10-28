import { prisma } from '../../../../lib/prisma';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // 1. Cari user berdasarkan username
    const user = await prisma.user.findUnique({ 
      where: { username: username } 
    });

    // 2. Cek password
    if (!user || user.password !== password) {
      return NextResponse.json({ error: 'Username atau password salah' }, { status: 401 });
    }

    // 3. Set Cookie
    const cookieStore = await cookies();
    cookieStore.set({
      name: 'user_session',
      value: JSON.stringify({ id: user.id, name: user.name, role: user.role }),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24,
      path: '/',
    });

    return NextResponse.json({ success: true, user });
    
  } catch (error: any) {
    console.error("=== ERROR LOGIN ===");
    console.error(error.message);
    return NextResponse.json({ error: 'Terjadi kesalahan sistem. Cek terminal CMD.' }, { status: 500 });
  }
}