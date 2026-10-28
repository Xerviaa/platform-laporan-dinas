'use client';

import { useSearchParams, useRouter } from 'next/navigation'; // Tambahkan useRouter
import Link from 'next/link';
import { Suspense } from 'react';

function PreviewContent() {
  const searchParams = useSearchParams();
  const router = useRouter(); // Inisialisasi router
  const fileUrl = searchParams.get('url');
  const fileName = searchParams.get('name') || 'File Laporan';

  if (!fileUrl) {
    return <div className="text-white text-center mt-20">File tidak ditemukan.</div>;
  }

  // Menggunakan Google Docs Viewer untuk menampilkan DOCX/PDF di dalam iframe
  const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`;

  return (
    <div className="min-h-screen bg-[#2B3241] text-white font-sans p-8 flex flex-col">
      <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col">
        
        {/* Header Preview */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 bg-[#3A4355] p-4 rounded-xl border border-gray-600 shadow-lg print:hidden">
          <div>
            <h1 className="text-xl font-bold text-white">Review Laporan</h1>
            <p className="text-sm text-gray-400">{fileName}</p>
            <p className="text-xs text-orange-400 mt-2">
              * File Word tidak dapat dicetak langsung dari browser. Silakan unduh file, lalu buka di Microsoft Word untuk mencetak.
            </p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            {/* TOMBOL KEMBALI: Menggunakan router.back() */}
            <button 
              onClick={() => router.back()}
              className="bg-[#2B3241] hover:bg-gray-600 border border-gray-500 text-white px-4 py-2 rounded-lg font-semibold transition-all text-sm"
            >
              Kembali
            </button>
            
            <a 
              href={fileUrl} 
              download 
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-semibold transition-all text-sm flex items-center gap-2 shadow-lg shadow-emerald-900/30"
            >
              ⬇️ Download File
            </a>
          </div>
        </div>

        {/* Area Preview */}
        <div className="flex-1 bg-white rounded-xl overflow-hidden shadow-2xl border border-gray-600">
          <iframe 
            src={viewerUrl} 
            className="w-full h-[75vh]" 
            title="File Preview"
          />
        </div>

      </div>
    </div>
  );
}

export default function PreviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#2B3241] text-white flex items-center justify-center">Memuat preview...</div>}>
      <PreviewContent />
    </Suspense>
  );
}