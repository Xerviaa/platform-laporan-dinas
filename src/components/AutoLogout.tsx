'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// 15 menit dalam milidetik (15 * 60 * 1000)
const INACTIVITY_TIMEOUT = 15 * 60 * 1000;

export function AutoLogout() {
  const router = useRouter();
  const pathname = usePathname();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Jangan jalankan timer jika sedang di halaman login
  const isLoginPage = pathname === '/login';

  const handleLogout = useCallback(async () => {
    try {
      // Hapus cookie sesi dengan memanggil API logout (kita akan buat di langkah 2)
      await fetch('/api/logout', { method: 'POST' });
      // Tendang ke halaman login
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error("Gagal auto-logout:", error);
    }
  }, [router]);

  const resetTimer = useCallback(() => {
    if (isLoginPage) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set timer baru
    timeoutRef.current = setTimeout(() => {
      void handleLogout();
    }, INACTIVITY_TIMEOUT);
  }, [handleLogout, isLoginPage]);

  useEffect(() => {
    if (isLoginPage) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    // Jalankan timer saat pertama kali halaman dimuat
    resetTimer();

    // Daftar aktivitas yang dianggap "user sedang bekerja"
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    
    // Throttle agar tidak terlalu sering memanggil resetTimer (hemat performa)
    let lastReset = Date.now();
    const handleActivity = () => {
      const now = Date.now();
      if (now - lastReset > 1000) { // Reset maksimal 1 detik sekali
        resetTimer();
        lastReset = now;
      }
    };

    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Bersihkan event listener saat komponen di-unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [resetTimer, isLoginPage]);

  // Komponen ini tidak menampilkan apa-apa di layar
  return null;
}