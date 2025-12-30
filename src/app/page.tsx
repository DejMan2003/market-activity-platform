import { Dashboard } from "@/components/dashboard"

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0B0F19] text-slate-100 overflow-x-hidden selection:bg-indigo-500/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-violet-600/10 blur-[100px]" />
      </div>

      <div className="relative z-10">
        <Dashboard />

        <footer className="py-10 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-700 border-t border-white/5 mt-20">
          <p>© {new Date().getFullYear()} The Bazaar. AI Intelligence Division.</p>
          <p className="mt-1">Not financial advice.</p>
        </footer>
      </div>
    </main>
  );
}
