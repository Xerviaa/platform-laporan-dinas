'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Select from 'react-select';

export default function UploadLaporan() {
  const [judul, setJudul] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [userId, setUserId] = useState(''); 
  
  const [users, setUsers] = useState<any[]>([]); 
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/users')
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error(err));
  }, []);

  const userOptions = users.map((user) => ({
    value: user.id,
    label: user.name,
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !judul || !tanggal || !userId) return alert('Isi semua data!');
    
    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('judul', judul);
    formData.append('tanggal', tanggal);
    formData.append('userId', userId);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setShowToast(true);
        setTimeout(() => { router.push('/dashboard'); }, 2000); // Ubah ke /dashboard
      } else {
        alert('Gagal upload laporan.');
      }
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan sistem.');
    } finally {
      setIsLoading(false);
    }
  };

  const customStyles = {
    control: (provided: any) => ({
      ...provided,
      backgroundColor: '#2B3241',
      borderColor: '#6B7280',
      color: 'white',
      padding: '4px',
      borderRadius: '0.5rem',
      boxShadow: 'none',
      '&:hover': { borderColor: '#10B981' },
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: '#3A4355',
      border: '1px solid #4B5563',
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isFocused ? '#2B3241' : '#3A4355',
      color: 'white',
      cursor: 'pointer',
      '&:active': { backgroundColor: '#10B981' },
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: 'white',
    }),
    input: (provided: any) => ({
      ...provided,
      color: 'white',
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: '#9CA3AF',
    }),
  };

  return (
    <div className="min-h-screen bg-[#2B3241] text-white font-sans p-8 relative">
      {showToast && (
        <div className="fixed top-5 right-5 bg-emerald-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in z-50 border border-emerald-400">
          <span className="text-2xl">✅</span>
          <div>
            <p className="font-bold text-lg">Berhasil!</p>
            <p className="text-sm text-emerald-100">Laporan berhasil diupload.</p>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto">
        <Link href="/dashboard" className="text-gray-300 hover:text-white mb-6 inline-flex items-center gap-2 bg-[#3A4355] px-4 py-2 rounded-lg border border-gray-600 transition-colors shadow-sm">
          &larr; Kembali ke Menu Utama
        </Link>

        <div className="bg-[#3A4355] rounded-2xl p-8 border border-gray-600 shadow-xl mt-4">
          <h1 className="text-2xl font-bold mb-6 border-b border-gray-600 pb-4 flex items-center gap-3">
            <span className="w-2 h-6 bg-emerald-500 rounded-sm"></span>
            Formulir Upload Laporan Dinas
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Nama Pegawai (Pelaksana Dinas)</label>
              <Select
                options={userOptions}
                onChange={(selectedOption: any) => setUserId(selectedOption?.value || '')}
                placeholder="Ketik untuk mencari nama..."
                isSearchable={true}
                styles={customStyles}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Judul Laporan / Tujuan Dinas</label>
              <input 
                type="text" 
                className="w-full bg-[#2B3241] border border-gray-500 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                placeholder="Contoh: Surveilan PT Gilontas"
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tanggal Pelaksanaan Dinas</label>
              <input 
                type="date" 
                className="w-full bg-[#2B3241] border border-gray-500 rounded-lg px-4 py-3 text-gray-300 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Upload File Laporan (PDF/DOCX)</label>
              <input 
                type="file" 
                accept=".pdf,.doc,.docx"
                className="w-full bg-[#2B3241] border border-gray-500 rounded-lg px-4 py-3 text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#4A5568] file:text-white hover:file:bg-[#5A6578] transition-colors"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full font-bold py-3.5 rounded-lg transition-all border shadow-lg mt-6 ${
                isLoading ? 'bg-gray-500 cursor-not-allowed border-gray-500' : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500/50 shadow-emerald-900/30'
              }`}
            >
              {isLoading ? 'Mengirim...' : 'Kirim Laporan'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}