'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Lesson, LessonProgress } from '@/lib/types';
import { LocalStorageProgressRepository } from '@/lib/repositories/impl/local-storage-progress-repository';

const repo = new LocalStorageProgressRepository();

interface LessonCardProps {
  lesson: Lesson;
}

export default function LessonCard({ lesson }: LessonCardProps) {
  const [progress, setProgress] = useState<LessonProgress | null>(null);

  useEffect(() => {
    setProgress(repo.getProgress(lesson.id));
  }, [lesson.id]);

  const highScore = progress?.highScore;
  const isDone = highScore !== undefined && highScore >= 80;
  const hasTried = highScore !== undefined && !isDone;

  return (
    <Link
      href={`/basic/${lesson.id}`}
      className="flex items-center gap-3 px-4 h-[62px] active:bg-[#F2F2F7] transition-colors"
    >
      {/* Lesson number badge */}
      <div className="w-8 h-8 rounded-lg bg-[#F2F2F7] flex items-center justify-center flex-shrink-0">
        <span className="text-[13px] font-bold text-[#6C6C70]">{lesson.lessonNumber}</span>
      </div>

      {/* Title + subtitle */}
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-semibold text-[#1C1C1E] leading-tight">Lección {lesson.lessonNumber}</p>
        <p className="text-[12px] text-[#6C6C70]">{lesson.sentences.length} sentences</p>
      </div>

      {/* Status badge */}
      {isDone && (
        <div className="w-5 h-5 rounded-full bg-[#34C759] flex items-center justify-center flex-shrink-0">
          <svg width="9" height="7" viewBox="0 0 10 8" fill="none">
            <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
      {hasTried && (
        <span className="text-[11px] font-bold text-[#FF9500] bg-[#FF9500]/10 px-1.5 py-0.5 rounded-full flex-shrink-0">
          {highScore}%
        </span>
      )}

      {/* Chevron */}
      <svg width="7" height="12" viewBox="0 0 8 14" fill="none" className="text-[#C7C7CC] flex-shrink-0">
        <path d="M1 1l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  );
}
