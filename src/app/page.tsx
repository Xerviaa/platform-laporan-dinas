import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Efek Background Gradient */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-[#0f172a] to-[#0f172a] -z-10"></div>

      <div className="text-center z-10 px-4">
        {/* LOGO LENGKAP */}
        <div className="w-64 md:w-80 mx-auto mb-8 flex items-center justify-center">
          <img 
            src="/logo.png" 
            alt="Logo Laporan Dinas" 
            className="w-full h-auto object-contain"
          />
        </div>
        
        <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
          Platform Internal Monitoring & Pengarsipan Perjalanan Dinas. 
          Kelola laporan perjalanan dinas Anda dengan mudah, cepat, dan terpusat.
        </p>

        <Link 
          href="/login" 
          className="inline-flex items-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-slate-900 px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-emerald-500/30 transition-all transform hover:-translate-y-1"
        >
          Masuk ke Aplikasi
          <span className="text-2xl">→</span>
        </Link>
      </div>

      <div className="absolute bottom-8 text-slate-500 text-sm">
        &copy; 2026 Platform Laporan Dinas. Internal Use Only.
      </div>
    </div>
  );
}