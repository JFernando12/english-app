import { getSentencesRepository } from '@/lib/repositories';
import PracticeSessionClient from '@/components/practice-session-client';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ lessonId: string }>;
  searchParams: Promise<{ size?: string; dir?: string }>;
}

export default async function LessonPage({ params, searchParams }: PageProps) {
  const { lessonId } = await params;
  const { size: sizeParam, dir } = await searchParams;
  const size = sizeParam ? parseInt(sizeParam, 10) : undefined;
  const direction = dir ?? 'es-to-en';

  const repo = getSentencesRepository();

  const sentences =
    lessonId === 'all'
      ? await repo.getAllSentences()
      : (await repo.getLessonById(lessonId))?.sentences ?? null;

  if (!sentences) {
    return (
    <main className="min-h-screen bg-[#0D0E14] flex flex-col items-center justify-center px-5 text-center">
        <h1 className="text-7 font-bold text-[#EEEEF8] mb-3">Lesson not found</h1>
        <p className="text-[15px] text-[#8888A8] mb-8">The lesson &quot;{lessonId}&quot; does not exist.</p>
        <Link href="/basic" className="text-[#7C6FF7] text-[17px]">← Back to lessons</Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0D0E14]">
      <PracticeSessionClient sessionId={lessonId} sentences={sentences} size={size} direction={direction} />
    </main>
  );
}
