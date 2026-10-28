import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Efek Background */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-[#0f172a] to-[#0f172a] -z-10"></div>

      <div className="text-center z-10 px-4">
        <div className="w-24 h-24 bg-white rounded-2xl mx-auto mb-8 flex items-center justify-center shadow-2xl shadow-emerald-500/20">
          <span className="text-[#0f172a] font-bold text-3xl">LOGO</span>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
          LAPORAN <span className="text-emerald-400">DINAS</span>
        </h1>
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