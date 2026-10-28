'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [laporan, setLaporan] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifikasi, setNotifikasi] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // State untuk Filter & Pagination
  const [filterStatus, setFilterStatus] = useState('semua');
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const router = useRouter();

  const fetchData = (showLoading = false) => {
    if (showLoading) setLoading(true);
    fetch('/api/upload')
      .then((res) => res.json())
      .then((data) => {
        setLaporan(data);
        setLoading(false);

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
  };

  useEffect(() => {
    fetchData(true);
    
    // Notifikasi Real-time (Auto-refresh setiap 30 detik)
    const interval = setInterval(() => {
      fetchData(false);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus laporan ini?')) return;
    
    try {
      const res = await fetch(`/api/upload/${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('Laporan berhasil dihapus');
        fetchData();
      } else {
        alert('Gagal menghapus laporan');
      }
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan sistem');
    }
  };

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter & Pagination Logic
  const filteredLaporan = laporan.filter((item) => {
    const matchSearch = item.judul.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        item.user?.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === 'semua' || item.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filteredLaporan.length / itemsPerPage);
  const paginatedLaporan = filteredLaporan.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page ke 1 jika filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus, itemsPerPage]);

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
      .slice(0, 5);
  };

  const topPegawai = hitungPoin();

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        
        {notifikasi.length > 0 && (
          <div className="mb-8 bg-orange-500/10 border border-orange-500/50 rounded-xl p-4 shadow-lg animate-pulse-slow">
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

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 border-b border-slate-700 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              LAPORAN <span className="text-emerald-400">DINAS</span>
            </h1>
            <p className="text-slate-400 mt-1">Platform Internal Monitoring & Pengarsipan Perjalanan Dinas</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/laporan" className="bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 px-4 py-2.5 rounded-lg font-semibold transition-all flex items-center gap-2 text-sm shadow-sm">
              📁 Arsip
            </Link>
            <button onClick={handleLogout} className="bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/50 px-4 py-2.5 rounded-lg font-semibold transition-all flex items-center gap-2 text-sm shadow-sm">
              Keluar
            </button>
            <Link href="/upload" className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 px-6 py-2.5 rounded-lg font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 text-sm transform hover:-translate-y-0.5">
              <span className="text-xl font-bold">+</span> Buat Laporan
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl shadow-lg relative overflow-hidden group hover:bg-slate-800 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
            <div className="flex justify-between items-center pl-2">
              <div>
                <p className="text-slate-400 font-medium mb-1 text-sm">Total Laporan</p>
                <p className="text-4xl font-bold text-white">{loading ? '-' : totalLaporan}</p>
              </div>
              <div className="bg-blue-500/10 p-4 rounded-full border border-blue-500/20 text-blue-400 group-hover:scale-110 transition-transform"><span className="text-2xl">📄</span></div>
            </div>
          </div>
          
          <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl shadow-lg relative overflow-hidden group hover:bg-slate-800 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
            <div className="flex justify-between items-center pl-2">
              <div>
                <p className="text-slate-400 font-medium mb-1 text-sm">Tepat Waktu</p>
                <p className="text-4xl font-bold text-emerald-400">{loading ? '-' : tepatWaktu}</p>
              </div>
              <div className="bg-emerald-500/10 p-4 rounded-full border border-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform"><span className="text-2xl">✅</span></div>
            </div>
          </div>
          
          <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl shadow-lg relative overflow-hidden group hover:bg-slate-800 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
            <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
            <div className="flex justify-between items-center pl-2">
              <div>
                <p className="text-slate-400 font-medium mb-1 text-sm">Terlambat</p>
                <p className="text-4xl font-bold text-orange-400">{loading ? '-' : terlambat}</p>
              </div>
              <div className="bg-orange-500/10 p-4 rounded-full border border-orange-500/20 text-orange-400 group-hover:scale-110 transition-transform"><span className="text-2xl">⏰</span></div>
            </div>
          </div>
        </div>

        {/* RUNNING TEXT / MARQUEE - DIPINDAH KE BAWAH KARTU STATISTIK */}
        <div className="mb-6 bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden shadow-inner py-3 print:hidden">
          <div className="animate-marquee text-emerald-400 font-bold text-base flex items-center gap-6">
            <span>📢 Selamat Datang di Platform Laporan Dinas!</span>
            <span>•</span>
            <span>📌 Upload laporan maksimal 3 hari setelah dinas.</span>
            <span>•</span>
            <span>🏆 Jadilah Pegawai Terajin bulan ini!</span>
            <span>•</span>
            <span>📊 Ekspor data laporan di halaman Arsip.</span>
            <span>•</span>
            <span>🔍 Cari laporan dengan cepat di kolom pencarian.</span>
            <span>•</span>
            <span>📅 Pantau notifikasi batas waktu di Dashboard.</span>
            <span>•</span>
            <span>🖨️ Cetak laporan langsung dari halaman Arsip.</span>
            <span>•</span>
            <span>👤 Klik nama pegawai di Papan Peringkat untuk melihat profil.</span>
            <span>•</span>
            <span>📢 Selamat Datang di Platform Laporan Dinas!</span>
            <span>•</span>
            <span>📌 Upload laporan maksimal 3 hari setelah dinas.</span>
            <span>•</span>
            <span>🏆 Jadilah Pegawai Terajin bulan ini!</span>
            <span>•</span>
            <span>📊 Ekspor data laporan di halaman Arsip.</span>
            <span>•</span>
            <span>🔍 Cari laporan dengan cepat di kolom pencarian.</span>
            <span>•</span>
            <span>📅 Pantau notifikasi batas waktu di Dashboard.</span>
            <span>•</span>
            <span>🖨️ Cetak laporan langsung dari halaman Arsip.</span>
            <span>•</span>
            <span>👤 Klik nama pegawai di Papan Peringkat untuk melihat profil.</span>
            <span>•</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 bg-slate-800/50 rounded-2xl border border-slate-700 shadow-lg p-6 h-fit">
            <div className="border-b border-slate-700 pb-4 mb-5">
              <h2 className="text-lg font-bold text-white flex items-center gap-2"><span className="text-2xl">🏆</span> Pegawai Terajin</h2>
              <p className="text-xs text-slate-400 mt-1 ml-8">Peringkat Bulan Ini</p>
            </div>
            {topPegawai.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">Belum ada data bulan ini.</p>
            ) : (
              <div className="space-y-5">
                {topPegawai.map(([nama, jumlah], index) => (
                  <Link 
                    href={`/profil?nama=${encodeURIComponent(nama)}`}
                    key={nama} 
                    className="flex items-center gap-4 group hover:bg-slate-700/50 p-2 -m-2 rounded-xl transition-all cursor-pointer"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-inner relative ${
                      index === 0 ? 'bg-yellow-400 text-yellow-900 border-2 border-yellow-200' : 
                      index === 1 ? 'bg-slate-300 text-slate-800 border-2 border-white' : 
                      index === 2 ? 'bg-amber-700 text-white border-2 border-amber-600' :
                      'bg-slate-700 text-slate-300 border-2 border-slate-600'
                    }`}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                      {index === 0 && <span className="absolute -top-3 -right-2 text-xl animate-bounce">👑</span>}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white line-clamp-1 group-hover:text-emerald-400 transition-colors">{nama}</p>
                      <p className="text-xs text-emerald-500 font-medium">{jumlah} Laporan Tepat Waktu</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-3 bg-slate-800/50 rounded-2xl border border-slate-700 shadow-lg overflow-hidden">
            <div className="p-6 border-b border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/50">
              <h2 className="text-xl font-bold text-white flex items-center gap-2"><span className="w-2 h-6 bg-emerald-500 rounded-sm"></span> Daftar Laporan Terbaru</h2>
              <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                <select 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-slate-900 border border-slate-600 text-sm rounded-lg px-3 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="semua">Semua Status</option>
                  <option value="TEPAT_WAKTU">Tepat Waktu</option>
                  <option value="TERLAMBAT">Terlambat</option>
                </select>

                <div className="relative w-full md:w-64">
                  <input type="text" placeholder="Cari judul atau nama..." className="bg-slate-900 border border-slate-600 text-sm rounded-lg pl-10 pr-4 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 w-full transition-all" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  <span className="absolute left-3 top-3 text-slate-500">🔍</span>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-slate-400 text-xs uppercase tracking-wider">
                    <th className="p-4 font-semibold border-b border-slate-700">Judul Laporan</th>
                    <th className="p-4 font-semibold border-b border-slate-700">Pelaksana</th>
                    <th className="p-4 font-semibold border-b border-slate-700">Tanggal Dinas</th>
                    <th className="p-4 font-semibold border-b border-slate-700">Status</th>
                    <th className="p-4 font-semibold border-b border-slate-700 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {loading ? (
                    <tr><td colSpan={5} className="p-8 text-center text-slate-400">Memuat data...</td></tr>
                  ) : paginatedLaporan.length === 0 ? (
                    <tr><td colSpan={5} className="p-12 text-center text-slate-500"><div className="flex flex-col items-center justify-center"><span className="text-4xl mb-3">📭</span><p>Tidak ada laporan yang cocok.</p></div></td></tr>
                  ) : (
                    paginatedLaporan.map((item, index) => (
                      <tr key={item.id} className={`hover:bg-slate-800 transition-colors group ${index % 2 === 0 ? 'bg-slate-800/20' : 'bg-transparent'} animate-fade-in`}>
                        <td className="p-4 font-medium text-white group-hover:text-emerald-400 transition-colors">{item.judul}</td>
                        <td className="p-4 text-slate-300">{item.user?.name || 'Unknown'}</td>
                        <td className="p-4 text-slate-400">{new Date(item.tanggalDinas).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
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
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleDelete(item.id)}
                              className="inline-flex items-center gap-2 bg-slate-700 hover:bg-red-600 text-slate-300 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-all border border-slate-600 hover:border-red-500 shadow-sm"
                              title="Hapus Laporan"
                            >
                              🗑️
                            </button>
                            <button 
                              onClick={() => handleCopyLink(item.fileUrl, item.id)}
                              className="inline-flex items-center gap-2 bg-slate-700 hover:bg-blue-600 text-slate-300 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-all border border-slate-600 hover:border-blue-500 shadow-sm"
                              title="Copy Link File"
                            >
                              {copiedId === item.id ? '✅' : '🔗'}
                            </button>
                            <Link 
                              href={`/preview?url=${encodeURIComponent(item.fileUrl)}&name=${encodeURIComponent(item.judul)}`} 
                              className="inline-flex items-center gap-2 bg-slate-700 hover:bg-emerald-600 text-slate-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all border border-slate-600 hover:border-emerald-500 shadow-sm"
                            >
                              <span>👁️</span> Review
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-900/30">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <span>Tampilkan</span>
                <select 
                  value={itemsPerPage} 
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                </select>
                <span>laporan</span>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-slate-800 border border-slate-600 rounded text-sm text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  &laquo; Sebelumnya
                </button>
                <span className="text-sm text-slate-400">
                  Halaman {currentPage} dari {totalPages || 1}
                </span>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-3 py-1 bg-slate-800 border border-slate-600 rounded text-sm text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Selanjutnya &raquo;
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 text-center text-slate-500 text-sm">&copy; 2026 Platform Laporan Dinas. Internal Use Only.</div>
      </div>
    </div>
  );
}