import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0D0E14] flex flex-col">
      {/* Navbar */}
      <nav className="border-b border-[#252638] sticky top-0 z-50 bg-[#0D0E14]/95 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-[13px] font-bold text-white leading-none">E</span>
              </div>
              <span className="text-lg font-bold text-[#EEEEF8]">EnglishUp</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-4">
        <div className="mb-5">
          <h1 className="text-xl font-bold text-[#EEEEF8]">What do you want to practice?</h1>
          <p className="text-sm text-[#8888A8] mt-0.5">Choose a mode to get started</p>
        </div>

        <div className="space-y-2.5">
          {/* Basic Mode */}
          <Link
            href="/basic"
            className="flex items-center gap-4 p-4 rounded-xl border transition-all duration-150 bg-[#161720] border-[#252638] cursor-pointer hover:border-[#3A3A50] active:scale-[0.99] group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#30D158]/10 text-[#30D158] shrink-0 p-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[#EEEEF8]">Basic Mode</span>
              </div>
              <p className="text-xs text-[#8888A8] mt-0.5 truncate">Practice with flashcards and typing at your own pace</p>
            </div>
            <ArrowRight className="text-[#30D158]" />
          </Link>

          {/* AI Mode — coming soon */}
          <div className="flex items-center gap-4 p-4 rounded-xl border transition-all duration-150 bg-[#161720]/50 border-[#252638]/50 opacity-60 cursor-default">
            <div className="w-10 h-10 rounded-xl bg-[#7C6FF7]/10 text-[#7C6FF7] shrink-0 p-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                <path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[#EEEEF8]">AI Mode</span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#252638] text-[#55556A] text-2.5 font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  Coming Soon
                </span>
              </div>
              <p className="text-xs text-[#8888A8] mt-0.5 truncate">Get intelligent feedback powered by AI</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5 ${className ?? ''}`}>
      <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
    </svg>
  );
}
