'use client';

import { Lesson } from '@/lib/types';
import LessonCard from './lesson-card';

interface LessonGridProps {
  lessons: Lesson[];
}

export default function LessonGrid({ lessons }: LessonGridProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden divide-y divide-[#F2F2F7]">
      {lessons.map((lesson) => (
        <LessonCard key={lesson.id} lesson={lesson} />
      ))}
    </div>
  );
}
