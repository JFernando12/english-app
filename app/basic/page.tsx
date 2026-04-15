import { getSentencesRepository } from '@/lib/repositories';
import { Level } from '@/lib/types';
import Link from 'next/link';

const LEVEL_CONFIG: Record<Level, { label: string; color: string; iconBg: string }> = {
  beginner:     { label: 'Beginner',     color: '#30D158', iconBg: 'bg-[#30D158]/10 text-[#30D158]' },
  intermediate: { label: 'Intermediate', color: '#FF9F0A', iconBg: 'bg-[#FF9F0A]/10 text-[#FF9F0A]' },
  advanced:     { label: 'Advanced',     color: '#FF453A', iconBg: 'bg-[#FF453A]/10 text-[#FF453A]' },
};

const SESSION_SIZES = [
  { label: '10',  size: 10,   sub: 'Quick session' },
  { label: '20',  size: 20,   sub: 'Standard session' },
  { label: '50',  size: 50,   sub: 'Long session' },
  { label: 'All', size: null, sub: 'Full deck' },
];

export default async function BasicPage() {
  const sentences = await getSentencesRepository().getAllSentences();

  const counts: Record<Level, number> = { beginner: 0, intermediate: 0, advanced: 0 };
  for (const s of sentences) counts[s.level]++;

  return (
    <div className="min-h-screen bg-[#0D0E14] flex flex-col">
      {/* Navbar */}
      <nav className="border-b border-[#252638] sticky top-0 z-50 bg-[#0D0E14]/95 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex items-center h-16 gap-2">
            <Link href="/" className="flex items-center gap-1.5 text-[#8888A8] hover:text-[#EEEEF8] transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="m15 18-6-6 6-6"/>
              </svg>
              <span className="text-sm">Home</span>
            </Link>
            <span className="text-[#252638] text-sm">/</span>
            <span className="text-sm text-[#EEEEF8]">Basic Mode</span>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-4">
        <div className="mb-5">
          <h1 className="text-xl font-bold text-[#EEEEF8]">Basic Mode</h1>
          <p className="text-sm text-[#8888A8] mt-0.5">{sentences.length} sentences · 3 levels</p>
        </div>

        {/* Level breakdown */}
        <div className="bg-[#161720] border border-[#252638] rounded-xl overflow-hidden divide-y divide-[#252638] mb-5">
          {(Object.keys(LEVEL_CONFIG) as Level[]).map((level) => (
            <div key={level} className="flex items-center gap-3 px-4 h-12">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: LEVEL_CONFIG[level].color }} />
              <span className="text-sm text-[#EEEEF8] flex-1 capitalize">{level}</span>
              <span className="text-xs text-[#8888A8]">{counts[level]} sentences</span>
            </div>
          ))}
        </div>

        {/* Session size picker */}
        <p className="text-xs font-semibold text-[#55556A] uppercase tracking-wider mb-3 px-1">
          Start a session
        </p>
        <div className="space-y-2.5">
          {SESSION_SIZES.map(({ label, size, sub }) => {
            const href = size ? `/basic/all?size=${size}` : '/basic/all';
            const title = label === 'All' ? 'Full Deck' : `${label} Sentences`;
            const displaySub = label === 'All' ? `All ${sentences.length} sentences` : sub;
            return (
              <Link
                key={label}
                href={href}
                className="flex items-center gap-4 p-4 rounded-xl border transition-all duration-150 bg-[#161720] border-[#252638] cursor-pointer hover:border-[#3A3A50] active:scale-[0.99] group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#7C6FF7]/10 text-[#7C6FF7] flex-shrink-0 flex items-center justify-center">
                  <span className="text-base font-bold">{label}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-[#EEEEF8]">{title}</span>
                  <p className="text-xs text-[#8888A8] mt-0.5 truncate">{displaySub}</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0 text-[#7C6FF7] transition-transform group-hover:translate-x-0.5">
                  <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                </svg>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
