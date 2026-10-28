'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Kita tetap mengirim data ke API dengan nama 'email' 
    // karena database kita menggunakan kolom 'email'
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      router.push('/');
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || 'Username atau password salah');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#2B3241] flex items-center justify-center p-4">
      <div className="bg-[#3A4355] p-8 rounded-2xl border border-gray-600 shadow-2xl w-full max-w-md">
        
        {/* Header Login */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            LAPORAN <span className="text-emerald-400">DINAS</span>
          </h1>
          <p className="text-gray-400">Silakan login untuk melanjutkan</p>
        </div>

        {/* Pesan Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
            <input 
              type="text" 
              className="w-full bg-[#2B3241] border border-gray-500 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
              placeholder="Masukkan username atau email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <input 
              type="password" 
              className="w-full bg-[#2B3241] border border-gray-500 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg transition-all mt-4 disabled:bg-gray-500"
          >
            {isLoading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

      </div>
    </div>
  );
}