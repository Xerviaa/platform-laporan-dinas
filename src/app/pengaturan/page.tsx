'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PengaturanPage() {
  const [logoUrl, setLogoUrl] = useState('/logo.png');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch('/api/settings/logo-get')
      .then(res => res.json())
      .then(data => setLogoUrl(data.logoUrl));
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append('logo', file);

    const res = await fetch('/api/settings/logo', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      alert('Logo berhasil diubah!');
      const data = await res.json();
      setLogoUrl(data.logoUrl);
    } else {
      alert('Gagal upload logo.');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/dashboard" className="text-slate-400 hover:text-white mb-6 inline-block">
          &larr; Kembali ke Dashboard
        </Link>
        
        <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700 shadow-lg">
          <h1 className="text-2xl font-bold text-white mb-6">Pengaturan Logo</h1>
          
          <div className="mb-6 text-center">
            <p className="text-sm text-slate-400 mb-2">Logo Saat Ini:</p>
            <img src={logoUrl} alt="Logo" className="w-48 mx-auto bg-white p-2 rounded-lg" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Ganti Logo Perusahaan</label>
            <input 
              type="file" 
              accept="image/png, image/jpeg"
              onChange={handleUpload}
              disabled={isLoading}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-500 file:text-white hover:file:bg-emerald-400"
            />
            {isLoading && <p className="text-emerald-400 text-sm mt-2">Mengupload...</p>}
          </div>
        </div>
      </div>
    </div>
  );
}