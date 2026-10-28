'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ProfilContent() {
  const searchParams = useSearchParams();
  const nama = searchParams.get('nama');
  const [laporan, setLaporan] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/upload')
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.filter((item: any) => item.user?.name === nama);
        setLaporan(filtered);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [nama]);

  const totalLaporan = laporan.length;
  const tepatWaktu = laporan.filter((item) => item.status === 'TEPAT_WAKTU').length;
  const terlambat = laporan.filter((item) => item.status === 'TERLAMBAT').length;

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans p-8 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        
        <Link href="/dashboard" className="text-slate-400 hover:text-white mb-6 inline-flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-lg border border-slate-600 transition-colors">
          &larr; Kembali ke Dashboard
        </Link>

        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-8 mb-8 shadow-lg text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500"></div>
          <div className="w-24 h-24 bg-slate-700 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl border-4 border-slate-600 shadow-inner">
            👤
          </div>
          <h1 className="text-2xl font-bold text-white">{nama}</h1>
          <p className="text-slate-400 mt-1">Pegawai Pelaksana Dinas</p>
          
          <div className="flex justify-center gap-6 mt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">{totalLaporan}</p>
              <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">Total Laporan</p>
            </div>
            <div className="w-px bg-slate-600"></div>
            <div className="text-center">
              <p className="text-3xl font-bold text-emerald-400">{tepatWaktu}</p>
              <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">Tepat Waktu</p>
            </div>
            <div className="w-px bg-slate-600"></div>
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-400">{terlambat}</p>
              <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">Terlambat</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 shadow-lg overflow-hidden">
          <div className="p-6 border-b border-slate-700">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-2 h-6 bg-emerald-500 rounded-sm"></span> Riwayat Laporan
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="p-4 font-semibold border-b border-slate-700">Judul Laporan</th>
                  <th className="p-4 font-semibold border-b border-slate-700">Tanggal Dinas</th>
                  <th className="p-4 font-semibold border-b border-slate-700">Status</th>
                  <th className="p-4 font-semibold border-b border-slate-700 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {loading ? (
                  <tr><td colSpan={4} className="p-8 text-center text-slate-400">Memuat data...</td></tr>
                ) : laporan.length === 0 ? (
                  <tr><td colSpan={4} className="p-12 text-center text-slate-500">Belum ada laporan untuk pegawai ini.</td></tr>
                ) : (
                  laporan.map((item, index) => (
                    <tr key={item.id} className={`hover:bg-slate-800 transition-colors ${index % 2 === 0 ? 'bg-slate-800/20' : 'bg-transparent'}`}>
                      <td className="p-4 font-medium text-white">{item.judul}</td>
                      <td className="p-4 text-slate-400">{new Date(item.tanggalDinas).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          item.status === 'TEPAT_WAKTU' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'TEPAT_WAKTU' ? 'bg-emerald-400' : 'bg-orange-400'}`}></span>
                          {item.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Link 
                          href={`/preview?url=${encodeURIComponent(item.fileUrl)}&name=${encodeURIComponent(item.judul)}`} 
                          className="inline-flex items-center gap-2 bg-slate-700 hover:bg-emerald-600 text-slate-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all border border-slate-600 hover:border-emerald-500 shadow-sm"
                        >
                          <span>👁️</span> Review
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center">Memuat profil...</div>}>
      <ProfilContent />
    </Suspense>
  );
}