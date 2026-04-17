'use client';

import dynamic from 'next/dynamic';
import type { Sentence, Direction } from '@/lib/types';

const PracticeSession = dynamic(() => import('./practice-session'), { ssr: false });

export default function PracticeSessionClient(props: {
  sessionId: string;
  sentences: Sentence[];
  size?: number;
  direction: Direction;
}) {
  return <PracticeSession {...props} />;
}
