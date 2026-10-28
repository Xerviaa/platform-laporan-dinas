'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function ArsipContent() {
  const [laporan, setLaporan] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Ambil bulan aktif dari URL (jika ada)
  const bulanAktif = searchParams.get('bulan');

  useEffect(() => {
    fetch('/api/upload')
      .then((res) => res.json())
      .then((data) => {
        setLaporan(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filteredLaporan = laporan.filter((item) => 
    item.judul.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.user?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedLaporan = filteredLaporan.reduce((acc: any, item: any) => {
    const date = new Date(item.tanggalDinas);
    const key = date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const sortedMonths = Object.keys(groupedLaporan).sort((a, b) => {
    return new Date(`1 ${b}`).getTime() - new Date(`1 ${a}`).getTime();
  });

  const toggleMonth = (bulan: string) => {
    // Jika bulan yang diklik sama dengan yang aktif, tutup (hapus dari URL)
    // Jika berbeda, buka (simpan ke URL)
    if (bulanAktif === bulan) {
      router.push('/laporan', { scroll: false });
    } else {
      router.push(`/laporan?bulan=${encodeURIComponent(bulan)}`, { scroll: false });
    }
  };

  return (
    <div className="min-h-screen bg-[#2B3241] text-white font-sans p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Kop Surat Print */}
        <div className="hidden print:block text-center mb-8 border-b-2 border-black pb-4">
          <h2 className="text-xl font-bold text-black uppercase">Kementerian Kelautan dan Perikanan</h2>
          <h3 className="text-lg font-semibold text-black">Balai Pengendalian dan Pengawasan Mutu Hasil Kelautan dan Perikanan Denpasar</h3>
          <p className="text-sm text-black mt-2">Arsip Laporan Perjalanan Dinas</p>
        </div>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 border-b border-gray-600 pb-6 print:hidden">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-wide">
              ARSIP <span className="text-emerald-400">LAPORAN</span>
            </h1>
            <p className="text-gray-300 mt-1">Seluruh riwayat perjalanan dinas</p>
          </div>
          <div className="flex gap-2">
            <Link href="/" className="bg-[#3A4355] hover:bg-gray-600 border border-gray-500 text-white px-4 py-2.5 rounded-lg font-semibold transition-all flex items-center gap-2 text-sm">
              &larr; Dashboard
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-[#3A4355] rounded-t-2xl border border-gray-600 p-6 flex justify-between items-center print:hidden">
          <div>
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <span className="w-2 h-6 bg-emerald-500 rounded-sm"></span>
              Semua Data Laporan
            </h2>
            <p className="text-sm text-gray-400 ml-4">Klik bulan untuk melihat detail laporan.</p>
          </div>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Cari judul atau nama..." 
              className="bg-[#2B3241] border border-gray-500 text-sm rounded-lg pl-10 pr-4 py-2 text-gray-300 focus:outline-none focus:border-emerald-500 w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="absolute left-3 top-2.5 text-gray-500">🔍</span>
          </div>
        </div>

        {/* Daftar Laporan Dikelompokkan */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-[#3A4355] border border-gray-600 rounded-b-2xl p-8 text-center text-gray-400">
              Memuat data...
            </div>
          ) : sortedMonths.length === 0 ? (
            <div className="bg-[#3A4355] border border-gray-600 rounded-b-2xl p-12 text-center text-gray-400">
              <div className="flex flex-col items-center justify-center">
                <span className="text-4xl mb-3">📭</span>
                <p>Tidak ada laporan yang cocok.</p>
              </div>
            </div>
          ) : (
            sortedMonths.map((bulan) => (
              <div key={bulan} className="bg-[#3A4355] rounded-xl border border-gray-600 shadow-lg overflow-hidden print:border-none print:shadow-none print:bg-white print:text-black">
                
                {/* Tombol Bulan */}
                <button 
                  onClick={() => toggleMonth(bulan)}
                  className="w-full flex justify-between items-center p-4 bg-[#2B3241] hover:bg-gray-700 transition-colors print:bg-gray-100 print:hover:bg-gray-100"
                >
                  <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2 print:text-black">
                    <span>📅</span> {bulan}
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 bg-gray-800 px-3 py-1 rounded-full print:hidden">
                      {groupedLaporan[bulan].length} Laporan
                    </span>
                    <span className="text-xl text-white print:hidden">
                      {bulanAktif === bulan ? '▲' : '▼'}
                    </span>
                  </div>
                </button>
                
                {/* Isi Tabel */}
                {bulanAktif === bulan && (
                  <div className="overflow-x-auto animate-fade-in">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#3A4355] text-gray-300 text-sm uppercase tracking-wider print:bg-white print:text-black">
                          <th className="p-4 font-semibold border-b border-gray-600 print:border-black">Judul Laporan</th>
                          <th className="p-4 font-semibold border-b border-gray-600 print:border-black">Pelaksana</th>
                          <th className="p-4 font-semibold border-b border-gray-600 print:border-black">Tanggal Dinas</th>
                          <th className="p-4 font-semibold border-b border-gray-600 print:border-black">Status</th>
                          <th className="p-4 font-semibold border-b border-gray-600 text-right print:hidden">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-600/50">
                        {groupedLaporan[bulan].map((item: any) => (
                          <tr key={item.id} className="hover:bg-[#2B3241]/50 transition-colors group print:hover:bg-transparent">
                            <td className="p-4 font-medium text-white print:text-black">{item.judul}</td>
                            <td className="p-4 text-emerald-400 font-medium print:text-black">{item.user?.name || 'Unknown'}</td>
                            <td className="p-4 text-gray-300 print:text-black">
                              {new Date(item.tanggalDinas).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </td>
                            <td className="p-4">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold ${
                                item.status === 'TEPAT_WAKTU' 
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                  : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'TEPAT_WAKTU' ? 'bg-emerald-400' : 'bg-orange-400'}`}></span>
                                {item.status.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="p-4 text-right print:hidden">
                              <Link 
                                href={`/preview?url=${encodeURIComponent(item.fileUrl)}&name=${encodeURIComponent(item.judul)}`}
                                className="inline-flex items-center gap-2 bg-[#2B3241] hover:bg-emerald-600 text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-gray-500 hover:border-emerald-500"
                              >
                                <span>👁️</span> Review
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Suspense diperlukan karena useSearchParams() di Next.js
export default function ArsipLaporan() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#2B3241] text-white flex items-center justify-center">Memuat arsip...</div>}>
      <ArsipContent />
    </Suspense>
  );
}