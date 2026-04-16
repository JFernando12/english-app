'use client';

import { checkAnswer } from '@/lib/utils/answer-checker';

interface AnswerDiffProps {
  expected: string;
  actual: string;
}

export default function AnswerDiff({ expected, actual }: AnswerDiffProps) {
  const { words, score } = checkAnswer(actual, expected);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {words.map((w, i) => (
          <span
            key={i}
            className={`px-2.5 py-1 rounded-lg text-[15px] font-medium ${
              w.status === 'correct'
                ? 'bg-[#30D158]/15 text-[#30D158]'
                : 'bg-[#FF453A]/15 text-[#FF453A]'
            }`}
          >
            {w.word}
            {w.status === 'missing' && <span className="opacity-60 text-3"> (missing)</span>}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-[#252638] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${score >= 70 ? 'bg-[#30D158]' : 'bg-[#FF9F0A]'}`}
            style={{ width: `${score}%` }}
          />
        </div>
        <span className={`text-[13px] font-semibold ${score >= 70 ? 'text-[#30D158]' : 'text-[#FF9F0A]'}`}>
          {score}%
        </span>
        <span className={`text-3 font-medium ${score >= 70 ? 'text-[#30D158]' : 'text-[#FF9F0A]'}`}>
          {score >= 90 ? '🎉 Excellent!' : score >= 70 ? '✓ Good job' : score >= 50 ? '💪 Almost' : '📚 Keep going'}
        </span>
      </div>
    </div>
  );
}
