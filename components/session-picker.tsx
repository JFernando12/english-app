'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LANGUAGES, DEFAULT_DIRECTION, parseDirection } from '@/lib/types';

const SESSION_SIZES = [
  { label: '10',  size: 10,   sub: 'Quick session' },
  { label: '20',  size: 20,   sub: 'Standard session' },
  { label: '50',  size: 50,   sub: 'Long session' },
  { label: 'All', size: null, sub: 'Full deck' },
];

const LANG_KEYS = Object.keys(LANGUAGES);

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
      className={`text-[#55556A] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function Checkmark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M3.5 9l4 4 7-7" stroke="#7C6FF7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default function SessionPicker({ totalCount }: { totalCount: number }) {
  const init = parseDirection(DEFAULT_DIRECTION);
  const [from, setFrom]       = useState(init.from);
  const [to, setTo]           = useState(init.to);
  const [open, setOpen]       = useState<'from' | 'to' | null>(null);

  const direction = `${from}-to-${to}`;
  const fromLang  = LANGUAGES[from];
  const toLang    = LANGUAGES[to];

  function pickFrom(lang: string) {
    setFrom(lang);
    if (lang === to) setTo(LANG_KEYS.find(k => k !== lang) ?? to);
    setOpen(null);
  }

  function pickTo(lang: string) {
    setTo(lang);
    if (lang === from) setFrom(LANG_KEYS.find(k => k !== lang) ?? from);
    setOpen(null);
  }

  function togglePicker(picker: 'from' | 'to') {
    setOpen(prev => prev === picker ? null : picker);
  }

  return (
    <div className="space-y-5">
      {/* Direction pickers — iOS Settings grouped style */}
      <div>
        <p className="text-xs font-semibold text-[#55556A] uppercase tracking-wider mb-3 px-1">
          Direction
        </p>
        <div className="bg-[#161720] border border-[#252638] rounded-xl overflow-hidden">

          {/* I speak row */}
          <button
            onClick={() => togglePicker('from')}
            className="w-full flex items-center justify-between px-4 h-14 active:bg-[#1E1F2E] transition-colors"
          >
            <span className="text-sm text-[#8888A8]">I speak</span>
            <div className="flex items-center gap-2">
              <span className="text-lg">{fromLang?.flag}</span>
              <span className="text-sm font-semibold text-[#EEEEF8]">{fromLang?.label}</span>
              <ChevronDown open={open === 'from'} />
            </div>
          </button>

          {open === 'from' && (
            <div className="border-t border-[#252638]">
              {LANG_KEYS.map((lang, i) => (
                <button
                  key={lang}
                  onClick={() => pickFrom(lang)}
                  className={`w-full flex items-center gap-3 px-4 h-12 active:bg-[#1E1F2E] transition-colors ${
                    i < LANG_KEYS.length - 1 ? 'border-b border-[#1E1F2E]' : ''
                  }`}
                >
                  <span className="text-xl">{LANGUAGES[lang].flag}</span>
                  <span className="text-sm font-medium text-[#EEEEF8] flex-1 text-left">{LANGUAGES[lang].label}</span>
                  {from === lang && <Checkmark />}
                </button>
              ))}
            </div>
          )}

          {/* Divider */}
          <div className="h-px bg-[#252638] mx-4" />

          {/* I'm learning row */}
          <button
            onClick={() => togglePicker('to')}
            className="w-full flex items-center justify-between px-4 h-14 active:bg-[#1E1F2E] transition-colors"
          >
            <span className="text-sm text-[#8888A8]">I&apos;m learning</span>
            <div className="flex items-center gap-2">
              <span className="text-lg">{toLang?.flag}</span>
              <span className="text-sm font-semibold text-[#EEEEF8]">{toLang?.label}</span>
              <ChevronDown open={open === 'to'} />
            </div>
          </button>

          {open === 'to' && (
            <div className="border-t border-[#252638]">
              {LANG_KEYS.map((lang, i) => (
                <button
                  key={lang}
                  onClick={() => pickTo(lang)}
                  className={`w-full flex items-center gap-3 px-4 h-12 active:bg-[#1E1F2E] transition-colors ${
                    i < LANG_KEYS.length - 1 ? 'border-b border-[#1E1F2E]' : ''
                  }`}
                >
                  <span className="text-xl">{LANGUAGES[lang].flag}</span>
                  <span className="text-sm font-medium text-[#EEEEF8] flex-1 text-left">{LANGUAGES[lang].label}</span>
                  {to === lang && <Checkmark />}
                </button>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* Session size picker */}
      <div>
        <p className="text-xs font-semibold text-[#55556A] uppercase tracking-wider mb-3 px-1">
          Start a session — {fromLang?.flag} {fromLang?.label} → {toLang?.flag} {toLang?.label}
        </p>
        <div className="space-y-2.5">
          {SESSION_SIZES.map(({ label, size, sub }) => {
            const params = new URLSearchParams({ dir: direction });
            if (size) params.set('size', String(size));
            const href = `/basic/all?${params.toString()}`;
            const title = label === 'All' ? 'Full Deck' : `${label} Sentences`;
            const displaySub = label === 'All' ? `All ${totalCount} sentences` : sub;
            return (
              <Link
                key={label}
                href={href}
                className="flex items-center gap-4 p-4 rounded-xl border transition-all duration-150 bg-[#161720] border-[#252638] cursor-pointer hover:border-[#3A3A50] active:scale-[0.99] group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#7C6FF7]/10 text-[#7C6FF7] shrink-0 flex items-center justify-center">
                  <span className="text-base font-bold">{label}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-[#EEEEF8]">{title}</span>
                  <p className="text-xs text-[#8888A8] mt-0.5 truncate">{displaySub}</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0 text-[#7C6FF7] transition-transform group-hover:translate-x-0.5 group-active:translate-x-0.5">
                  <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                </svg>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}


