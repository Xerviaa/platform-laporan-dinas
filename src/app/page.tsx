'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [laporan, setLaporan] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifikasi, setNotifikasi] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetch('/api/upload')
      .then((res) => res.json())
      .then((data) => {
        setLaporan(data);
        setLoading(false);

        // LOGIKA NOTIFIKASI BATAS WAKTU (3 HARI)
        const hariIni = new Date();
        const notifList: string[] = [];

        data.forEach((item: any) => {
          const tglDinas = new Date(item.tanggalDinas);
          const selisihHari = Math.floor((hariIni.getTime() - tglDinas.getTime()) / (1000 * 3600 * 24));
          
          if (item.status === 'TEPAT_WAKTU' && selisihHari >= 2 && selisihHari < 3) {
            const sisaHari = 3 - selisihHari;
            notifList.push(`Laporan "${item.judul}" oleh ${item.user?.name} mendekati batas waktu (sisa ${sisaHari} hari lagi).`);
          }
        });
        setNotifikasi(notifList);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const filteredLaporan = laporan.filter((item) => 
    item.judul.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.user?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalLaporan = laporan.length;
  const tepatWaktu = laporan.filter((item) => item.status === 'TEPAT_WAKTU').length;
  const terlambat = laporan.filter((item) => item.status === 'TERLAMBAT').length;

  const hitungPoin = () => {
    const poin: { [key: string]: number } = {};
    const hariIni = new Date();
    
    laporan.forEach((item) => {
      const tglUpload = new Date(item.createdAt); 
      const isBulanIni = tglUpload.getMonth() === hariIni.getMonth() && 
                         tglUpload.getFullYear() === hariIni.getFullYear();

      if (isBulanIni && item.status === 'TEPAT_WAKTU' && item.user?.name) {
        poin[item.user.name] = (poin[item.user.name] || 0) + 1;
      }
    });
    
    return Object.entries(poin)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);
  };

  const topPegawai = hitungPoin();

  return (
    <div className="min-h-screen bg-[#2B3241] text-white font-sans p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* KOP SURAT KHUSUS PRINT (Opsional) */}
        <div className="hidden print:block text-center mb-8 border-b-2 border-black pb-4">
          <h2 className="text-xl font-bold text-black uppercase">Kementerian Kelautan dan Perikanan</h2>
          <h3 className="text-lg font-semibold text-black">Balai Pengendalian dan Pengawasan Mutu Hasil Kelautan dan Perikanan Denpasar</h3>
          <p className="text-sm text-black mt-2">Laporan Perjalanan Dinas</p>
        </div>

        {/* BANNER NOTIFIKASI */}
        {notifikasi.length > 0 && (
          <div className="mb-8 bg-orange-500/10 border border-orange-500/50 rounded-xl p-4 shadow-lg print:hidden">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔔</span>
              <div>
                <h3 className="font-bold text-orange-400 mb-1">Peringatan Batas Pengumpulan Laporan!</h3>
                <ul className="list-disc list-inside text-sm text-gray-300">
                  {notifikasi.map((pesan, index) => (
                    <li key={index}>{pesan}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 border-b border-gray-600 pb-6 print:hidden">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-wide">
              LAPORAN <span className="text-emerald-400">DINAS</span>
            </h1>
            <p className="text-gray-300 mt-1">Platform Internal Monitoring & Pengarsipan Perjalanan Dinas</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/laporan" className="bg-[#3A4355] hover:bg-gray-600 border border-gray-500 text-white px-4 py-2.5 rounded-lg font-semibold transition-all flex items-center gap-2 text-sm">
              📁 Arsip
            </Link>
            <button onClick={handleLogout} className="bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/50 px-4 py-2.5 rounded-lg font-semibold transition-all flex items-center gap-2 text-sm">
              Keluar
            </button>
            <Link href="/upload" className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-lg font-semibold shadow-lg shadow-emerald-900/50 transition-all flex items-center gap-2 border border-emerald-500/50 text-sm">
              <span className="text-xl font-bold">+</span> Buat Laporan
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 print:hidden">
          <div className="bg-[#3A4355] border border-blue-500/30 p-6 rounded-2xl shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
            <div className="flex justify-between items-center pl-2">
              <div>
                <p className="text-gray-300 font-medium mb-1">Total Laporan</p>
                <p className="text-4xl font-bold text-white">{loading ? '-' : totalLaporan}</p>
              </div>
              <div className="bg-blue-500/10 p-3 rounded-full border border-blue-500/20 text-blue-400"><span className="text-2xl">📄</span></div>
            </div>
          </div>
          <div className="bg-[#3A4355] border border-emerald-500/30 p-6 rounded-2xl shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
            <div className="flex justify-between items-center pl-2">
              <div>
                <p className="text-gray-300 font-medium mb-1">Tepat Waktu</p>
                <p className="text-4xl font-bold text-emerald-400">{loading ? '-' : tepatWaktu}</p>
              </div>
              <div className="bg-emerald-500/10 p-3 rounded-full border border-emerald-500/20 text-emerald-400"><span className="text-2xl">✅</span></div>
            </div>
          </div>
          <div className="bg-[#3A4355] border border-orange-500/30 p-6 rounded-2xl shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
            <div className="flex justify-between items-center pl-2">
              <div>
                <p className="text-gray-300 font-medium mb-1">Terlambat</p>
                <p className="text-4xl font-bold text-orange-400">{loading ? '-' : terlambat}</p>
              </div>
              <div className="bg-orange-500/10 p-3 rounded-full border border-orange-500/20 text-orange-400"><span className="text-2xl">⏰</span></div>
            </div>
          </div>
        </div>

        {/* Leaderboard & Table */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 bg-[#3A4355] rounded-2xl border border-gray-600 shadow-lg p-6 h-fit print:hidden">
            <div className="border-b border-gray-600 pb-3 mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2"><span className="text-xl">🏆</span> Pegawai Terajin</h2>
              <p className="text-xs text-gray-400 mt-1 ml-7">Peringkat Bulan Ini</p>
            </div>
            {topPegawai.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Belum ada data bulan ini.</p>
            ) : (
              <div className="space-y-4">
                {topPegawai.map(([nama, jumlah], index) => (
                  <div key={nama} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? 'bg-yellow-500 text-black' : index === 1 ? 'bg-gray-300 text-black' : 'bg-orange-700 text-white'}`}>{index + 1}</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white line-clamp-1">{nama}</p>
                      <p className="text-xs text-emerald-400">{jumlah} Laporan Tepat Waktu</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-3 bg-[#3A4355] rounded-2xl border border-gray-600 shadow-lg overflow-hidden print:border-none print:shadow-none print:bg-white print:text-black">
            <div className="p-6 border-b border-gray-600 flex justify-between items-center bg-[#2B3241]/30 print:hidden">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2"><span className="w-2 h-6 bg-emerald-500 rounded-sm"></span> Daftar Laporan Terbaru</h2>
              <div className="relative">
                <input type="text" placeholder="Cari judul atau nama..." className="bg-[#2B3241] border border-gray-500 text-sm rounded-lg pl-10 pr-4 py-2 text-gray-300 focus:outline-none focus:border-emerald-500 w-64" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                <span className="absolute left-3 top-2.5 text-gray-500">🔍</span>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#2B3241] text-gray-300 text-sm uppercase tracking-wider print:bg-gray-100 print:text-black">
                    <th className="p-4 font-semibold border-b border-gray-600">Judul Laporan</th>
                    <th className="p-4 font-semibold border-b border-gray-600">Pelaksana</th>
                    <th className="p-4 font-semibold border-b border-gray-600">Tanggal Dinas</th>
                    <th className="p-4 font-semibold border-b border-gray-600">Status</th>
                    <th className="p-4 font-semibold border-b border-gray-600 text-right print:hidden">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-600/50">
                  {loading ? (
                    <tr><td colSpan={5} className="p-8 text-center text-gray-400">Memuat data...</td></tr>
                  ) : filteredLaporan.length === 0 ? (
                    <tr><td colSpan={5} className="p-12 text-center text-gray-400"><div className="flex flex-col items-center justify-center"><span className="text-4xl mb-3">📭</span><p>Tidak ada laporan yang cocok.</p></div></td></tr>
                  ) : (
                    filteredLaporan.map((item) => (
                      <tr key={item.id} className="hover:bg-[#2B3241]/50 transition-colors group print:hover:bg-transparent">
                        <td className="p-4 font-medium text-white print:text-black">{item.judul}</td>
                        <td className="p-4 text-emerald-400 font-medium print:text-black">{item.user?.name || 'Unknown'}</td>
                        <td className="p-4 text-gray-300 print:text-black">{new Date(item.tanggalDinas).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold ${item.status === 'TEPAT_WAKTU' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'TEPAT_WAKTU' ? 'bg-emerald-400' : 'bg-orange-400'}`}></span>
                            {item.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-4 text-right print:hidden">
                          {/* LINK REVIEW: Membawa data pelaksana, tanggal, dan status untuk cetak */}
                          <Link 
                            href={`/preview?url=${encodeURIComponent(item.fileUrl)}&name=${encodeURIComponent(item.judul)}&pelaksana=${encodeURIComponent(item.user?.name || 'Unknown')}&tanggal=${encodeURIComponent(new Date(item.tanggalDinas).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }))}&status=${encodeURIComponent(item.status.replace('_', ' '))}`} 
                            className="inline-flex items-center gap-2 bg-[#2B3241] hover:bg-emerald-600 text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-gray-500 hover:border-emerald-500"
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

        <div className="mt-10 text-center text-gray-400 text-sm print:hidden">&copy; 2026 Platform Laporan Dinas. Internal Use Only.</div>
      </div>
    </div>
  );
}