import { getSentencesRepository } from '@/lib/repositories';
import { Category } from '@/lib/types';
import Link from 'next/link';
import SessionPicker from '@/components/session-picker';

const CATEGORY_CONFIG: Record<Category, { label: string; description: string }> = {
  general: { label: 'General', description: 'Everyday vocabulary and grammar' },
  standup: { label: 'Daily Standup', description: 'Yesterday, today, and blockers — work English' },
};

interface PageProps {
  searchParams: Promise<{ cat?: string }>;
}

export default async function BasicPage({ searchParams }: PageProps) {
  const { cat } = await searchParams;
  const category: Category = cat === 'standup' ? 'standup' : 'general';

  const allSentences = await getSentencesRepository().getAllSentences();
  const sentences = allSentences.filter((s) => s.category === category);

  return (
    <div className="min-h-screen bg-[#0D0E14] flex flex-col">
      {/* Navbar */}
      <nav className="border-b border-[#252638] sticky top-0 z-50 bg-[#0D0E14]/95 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex items-center h-16 gap-2">
            <Link href="/" className="flex items-center gap-1.5 text-[#8888A8] hover:text-[#EEEEF8] active:text-[#EEEEF8] transition-colors">
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
          <p className="text-sm text-[#8888A8] mt-0.5">{sentences.length} sentences</p>
        </div>

        {/* Category picker */}
        <div className="bg-[#161720] border border-[#252638] rounded-xl overflow-hidden divide-y divide-[#252638] mb-5">
          {(Object.keys(CATEGORY_CONFIG) as Category[]).map((c) => (
            <Link
              key={c}
              href={`/basic?cat=${c}`}
              className={`flex items-center gap-3 px-4 h-14 active:bg-[#1E1F2E] transition-colors ${
                category === c ? 'bg-[#1E1F2E]' : ''
              }`}
            >
              <div className="flex-1 min-w-0">
                <span className={`text-sm font-semibold ${category === c ? 'text-[#7C6FF7]' : 'text-[#EEEEF8]'}`}>
                  {CATEGORY_CONFIG[c].label}
                </span>
                <p className="text-xs text-[#8888A8] mt-0.5 truncate">{CATEGORY_CONFIG[c].description}</p>
              </div>
              <span className="text-xs text-[#8888A8] shrink-0">
                {allSentences.filter((s) => s.category === c).length}
              </span>
            </Link>
          ))}
        </div>

        <SessionPicker totalCount={sentences.length} category={category} />
      </main>
    </div>
  );
}
