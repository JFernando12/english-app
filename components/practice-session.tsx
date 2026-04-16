'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Sentence, Level } from '@/lib/types';
import { LocalStorageProgressRepository } from '@/lib/repositories/impl/local-storage-progress-repository';
import { checkAnswer } from '@/lib/utils/answer-checker';
import AnswerDiff from './answer-diff';

const repo = new LocalStorageProgressRepository();

function speak(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  speechSynthesis.speak(utterance);
}

function SpeakButton({ text }: { text: string }) {
  return (
    <button
      onClick={() => speak(text)}
      aria-label="Speak English sentence"
      className="flex items-center justify-center w-8 h-8 rounded-full text-[#8888A8] hover:text-[#EEEEF8] active:opacity-70 transition-all"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" />
        <path d="M15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.486.75.75 0 0 1-1.06-1.061 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.06Z" />
      </svg>
    </button>
  );
}

const LEVEL_BADGE: Record<Level, { label: string; color: string }> = {
  beginner:     { label: 'Beginner',     color: 'text-[#30D158] bg-[#30D158]/10' },
  intermediate: { label: 'Intermediate', color: 'text-[#FF9F0A] bg-[#FF9F0A]/10' },
  advanced:     { label: 'Advanced',     color: 'text-[#FF453A] bg-[#FF453A]/10' },
};

const LEVEL_DOT: Record<Level, string> = {
  beginner:     'bg-[#30D158]',
  intermediate: 'bg-[#FF9F0A]',
  advanced:     'bg-[#FF453A]',
};

type Mode = 'flashcard' | 'typing';

interface Result {
  correct: boolean;
  score: number;
  level: Level;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function PracticeSession({
  sessionId,
  sentences,
  size,
}: {
  sessionId: string;
  sentences: Sentence[];
  size?: number;
}) {
  const buildDeck = useCallback(
    () => (size ? shuffle(sentences).slice(0, size) : shuffle(sentences)),
    [sentences, size]
  );

  const [deck, setDeck] = useState<Sentence[]>(buildDeck);
  const [mode, setMode] = useState<Mode>('flashcard');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [checked, setChecked] = useState(false);
  const [checkedScore, setCheckedScore] = useState(0);
  const [results, setResults] = useState<Result[]>([]);
  const [finished, setFinished] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const snap = useRef({ mode, showAnswer, finished, checked, userInput, checkedScore, results, currentIndex, deck });
  snap.current = { mode, showAnswer, finished, checked, userInput, checkedScore, results, currentIndex, deck };

  const current = deck[currentIndex];
  const progressPct = ((currentIndex) / deck.length) * 100;

  // ── Helpers ────────────────────────────────────────────────────────────────

  function doAdvance(newResults: Result[], fromIndex: number, currentDeck: Sentence[]) {
    if (fromIndex + 1 >= currentDeck.length) {
      const avg = newResults.length
        ? Math.round(newResults.reduce((s, r) => s + r.score, 0) / newResults.length)
        : 0;
      const existing = repo.getProgress(sessionId);
      repo.saveProgress(sessionId, {
        completedAt: new Date().toISOString(),
        attempts: (existing?.attempts ?? 0) + 1,
        lastScore: avg,
        highScore: Math.max(existing?.highScore ?? 0, avg),
      });
      setResults(newResults);
      setFinished(true);
    } else {
      setCurrentIndex(fromIndex + 1);
      setShowAnswer(false);
      setUserInput('');
      setChecked(false);
      setCheckedScore(0);
      setResults(newResults);
    }
  }

  function reset() {
    const newDeck = buildDeck();
    setDeck(newDeck);
    setCurrentIndex(0);
    setShowAnswer(false);
    setUserInput('');
    setChecked(false);
    setCheckedScore(0);
    setResults([]);
    setFinished(false);
  }

  function switchMode(m: Mode) {
    setMode(m);
    setCurrentIndex(0);
    setShowAnswer(false);
    setUserInput('');
    setChecked(false);
    setCheckedScore(0);
    setResults([]);
    setFinished(false);
  }

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const s = snap.current;
      if (s.finished) return;
      const inTextarea = e.target instanceof HTMLTextAreaElement;

      if (s.mode === 'flashcard' && !inTextarea) {
        if (!s.showAnswer && e.code === 'Space') {
          e.preventDefault();
          setShowAnswer(true);
        } else if (s.showAnswer) {
          if (e.code === 'ArrowLeft') {
            e.preventDefault();
            doAdvance([...s.results, { correct: false, score: 0, level: s.deck[s.currentIndex].level }], s.currentIndex, s.deck);
          }
          if (e.code === 'ArrowRight' || e.code === 'Enter') {
            e.preventDefault();
            doAdvance([...s.results, { correct: true, score: 100, level: s.deck[s.currentIndex].level }], s.currentIndex, s.deck);
          }
        }
      }

      if (s.mode === 'typing' && inTextarea && e.key === 'Enter' && !e.shiftKey) {
        if (!s.checked && s.userInput.trim()) {
          e.preventDefault();
          const { score } = checkAnswer(s.userInput, s.deck[s.currentIndex].english);
          setCheckedScore(score);
          setChecked(true);
        } else if (s.checked) {
          e.preventDefault();
          doAdvance([...s.results, { correct: s.checkedScore >= 70, score: s.checkedScore, level: s.deck[s.currentIndex].level }], s.currentIndex, s.deck);
        }
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-focus textarea ────────────────────────────────────────────────────
  useEffect(() => {
    if (mode === 'typing' && !checked) {
      textareaRef.current?.focus();
    }
  }, [mode, currentIndex, checked]);

  // ── Event handlers ─────────────────────────────────────────────────────────
  function handleGotIt() {
    doAdvance([...results, { correct: true, score: 100, level: current.level }], currentIndex, deck);
  }

  function handleTryAgain() {
    doAdvance([...results, { correct: false, score: 0, level: current.level }], currentIndex, deck);
  }

  function handleCheck() {
    const { score } = checkAnswer(userInput, current.english);
    setCheckedScore(score);
    setChecked(true);
  }

  function handleNext() {
    doAdvance([...results, { correct: checkedScore >= 70, score: checkedScore, level: current.level }], currentIndex, deck);
  }

  // ── Result screen ──────────────────────────────────────────────────────────
  if (finished) {
    const avg = results.length
      ? Math.round(results.reduce((s, r) => s + r.score, 0) / results.length)
      : 0;
    const correctCount = results.filter((r) => r.correct).length;
    const emoji = avg >= 80 ? '🎉' : avg >= 50 ? '💪' : '📚';

    const levels: Level[] = ['beginner', 'intermediate', 'advanced'];
    const levelStats = levels.map((level) => {
      const lr = results.filter((r) => r.level === level);
      if (lr.length === 0) return null;
      const lAvg = Math.round(lr.reduce((s, r) => s + r.score, 0) / lr.length);
      const lCorrect = lr.filter((r) => r.correct).length;
      return { level, count: lr.length, avg: lAvg, correct: lCorrect };
    }).filter(Boolean);

    return (
      <div className="min-h-screen bg-[#0D0E14] flex flex-col items-center px-5 py-12">
        <div className="w-full max-w-sm space-y-5">

          {/* Header */}
          <div className="text-center">
            <div className="text-6xl mb-4">{emoji}</div>
            <h2 className="text-6.5 font-bold text-[#EEEEF8]">Session Complete!</h2>
            <p className="text-3.5 text-[#8888A8] mt-1">{deck.length} sentences reviewed</p>
          </div>

          {/* Overall score */}
          <div className="bg-[#161720] border border-[#252638] rounded-2xl p-6 text-center">
            {mode === 'flashcard' ? (
              <>
                <p className="text-12 font-bold text-[#EEEEF8] leading-none">
                  {correctCount}<span className="text-7 text-[#8888A8]">/{deck.length}</span>
                </p>
                <p className="text-3.5 text-[#8888A8] mt-2">sentences correct</p>
              </>
            ) : (
              <>
                <p className="text-12 font-bold text-[#EEEEF8] leading-none">
                  {avg}<span className="text-7 text-[#8888A8]">%</span>
                </p>
                <p className="text-3.5 text-[#8888A8] mt-2">accuracy</p>
              </>
            )}
          </div>

          {/* Level breakdown */}
          {levelStats.length > 1 && (
            <div className="bg-[#161720] border border-[#252638] rounded-2xl overflow-hidden divide-y divide-[#252638]">
              <p className="px-5 pt-3 pb-2 text-[11px] font-semibold text-[#55556A] uppercase tracking-wider">
                By level
              </p>
              {levelStats.map((ls) => {
                if (!ls) return null;
                const pct = mode === 'flashcard'
                  ? Math.round((ls.correct / ls.count) * 100)
                  : ls.avg;
                const barColor = pct >= 80 ? '#30D158' : pct >= 50 ? '#FF9F0A' : '#FF453A';
                return (
                  <div key={ls.level} className="px-5 py-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${LEVEL_DOT[ls.level]}`} />
                        <span className="text-3.5 font-medium text-[#EEEEF8] capitalize">{ls.level}</span>
                        <span className="text-3 text-[#8888A8]">{ls.count}</span>
                      </div>
                      <span className="text-3.5 font-semibold text-[#EEEEF8]">{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-[#252638] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: barColor }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              onClick={reset}
              className="w-full h-12 rounded-xl bg-[#7C6FF7] text-white text-4 font-semibold active:opacity-80 transition-opacity"
            >
              Practice Again
            </button>
            <Link
              href="/basic"
              className="w-full h-12 rounded-xl bg-[#161720] border border-[#252638] text-[#EEEEF8] text-4 font-semibold flex items-center justify-center active:opacity-80 transition-opacity"
            >
              Back to Lessons
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Practice screen ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0D0E14] flex flex-col">

      {/* Nav bar */}
      <div className="sticky top-0 z-10 bg-[#0D0E14]/95 backdrop-blur-sm border-b border-[#252638]">
        <div className="max-w-lg mx-auto px-4">
          <div className="h-16 flex items-center justify-between">
            <Link href="/basic" className="flex items-center gap-1.5 text-[#8888A8] hover:text-[#EEEEF8] transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="m15 18-6-6 6-6"/>
              </svg>
              <span className="text-sm">Back</span>
            </Link>
            <span className="text-xs font-medium text-[#8888A8]">
              {currentIndex + 1} / {deck.length}
            </span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-[#252638]">
        <div
          className="h-full bg-[#7C6FF7] transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 max-w-lg mx-auto w-full px-5 pt-6 pb-8 flex flex-col gap-4">

        {/* Mode toggle */}
        <div className="bg-[#161720] border border-[#252638] p-0.5 rounded-xl flex self-center w-full">
          {(['flashcard', 'typing'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`flex-1 py-1.5 rounded-2.5 text-[13px] font-semibold transition-all ${
                mode === m
                  ? 'bg-[#1E1F2E] text-[#EEEEF8] shadow-sm'
                  : 'text-[#8888A8]'
              }`}
            >
              {m === 'flashcard' ? '🃏 Flashcard' : '⌨️ Typing'}
            </button>
          ))}
        </div>

        {/* Spanish prompt card */}
        <div className="bg-[#161720] border border-[#252638] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-semibold text-[#55556A] uppercase tracking-wider">
              Spanish · {currentIndex + 1} of {deck.length}
            </p>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${LEVEL_BADGE[current.level].color}`}>
              {LEVEL_BADGE[current.level].label}
            </span>
          </div>
          <p className="text-[19px] text-[#EEEEF8] leading-relaxed">{current.spanish}</p>
        </div>

        {/* ── Flashcard mode ── */}
        {mode === 'flashcard' && (
          <>
            {!showAnswer ? (
              <div className="space-y-1.5">
                <button
                  onClick={() => setShowAnswer(true)}
                  className="w-full h-14 rounded-2xl bg-[#7C6FF7] text-white text-[17px] font-semibold active:opacity-80 transition-opacity"
                >
                  Show Answer
                </button>
                <p className="text-center text-[11px] text-[#55556A]">space</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-[#30D158]/8 border border-[#30D158]/20 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-3 font-semibold text-[#30D158] uppercase tracking-wider">English</p>
                    <SpeakButton text={current.english} />
                  </div>
                  <p className="text-[19px] text-[#EEEEF8] leading-relaxed">{current.english}</p>
                </div>
                <div className="flex gap-3">
                  <div className="flex-1 space-y-1.5">
                    <button
                      onClick={handleTryAgain}
                      className="w-full h-14 rounded-2xl bg-[#161720] border border-[#252638] text-[#FF453A] text-[17px] font-semibold active:opacity-80 transition-opacity"
                    >
                      ✗ Try again
                    </button>
                    <p className="text-center text-[11px] text-[#55556A]">←</p>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <button
                      onClick={handleGotIt}
                      className="w-full h-14 rounded-2xl bg-[#30D158] text-white text-[17px] font-semibold active:opacity-80 transition-opacity"
                    >
                      ✓ Got it
                    </button>
                    <p className="text-center text-[11px] text-[#55556A]">→ · Enter</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── Typing mode ── */}
        {mode === 'typing' && (
          <div className="space-y-4">
            <div className="bg-[#161720] border border-[#252638] rounded-2xl p-4">
              <p className="text-3 font-semibold text-[#55556A] uppercase tracking-wider mb-2">Your answer</p>
              <textarea
                ref={textareaRef}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                disabled={checked}
                rows={3}
                placeholder="Type the English translation…"
                className="w-full text-[17px] text-[#EEEEF8] placeholder:text-[#55556A] resize-none bg-transparent focus:outline-none disabled:opacity-50"
              />
            </div>

            {checked && (
              <div className="bg-[#161720] border border-[#252638] rounded-2xl p-4 space-y-3">
                <p className="text-3 font-semibold text-[#55556A] uppercase tracking-wider">Result</p>
                <AnswerDiff expected={current.english} actual={userInput} />
                <div className="pt-3 border-t border-[#252638]">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[11px] font-semibold text-[#55556A] uppercase tracking-wider">Correct answer</p>
                    <SpeakButton text={current.english} />
                  </div>
                  <p className="text-[15px] text-[#EEEEF8] leading-relaxed">{current.english}</p>
                </div>
              </div>
            )}

            {!checked ? (
              <div className="space-y-1.5">
                <button
                  onClick={handleCheck}
                  disabled={!userInput.trim()}
                  className="w-full h-14 rounded-2xl bg-[#7C6FF7] text-white text-[17px] font-semibold active:opacity-80 transition-opacity disabled:opacity-30"
                >
                  Check Answer
                </button>
                <p className="text-center text-[11px] text-[#55556A]">Enter</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                <button
                  onClick={handleNext}
                  className="w-full h-14 rounded-2xl bg-[#161720] border border-[#252638] text-[#EEEEF8] text-[17px] font-semibold active:opacity-80 transition-opacity"
                >
                  {currentIndex + 1 < deck.length ? 'Next →' : 'Finish'}
                </button>
                <p className="text-center text-[11px] text-[#55556A]">Enter</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
