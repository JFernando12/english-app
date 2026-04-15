export interface WordResult {
  word: string;
  status: 'correct' | 'wrong' | 'missing';
}

export interface AnswerCheck {
  score: number;    // 0-100 percentage
  isClose: boolean; // score >= 70
  words: WordResult[];
}

function normalize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s']/g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

export function checkAnswer(userAnswer: string, expectedAnswer: string): AnswerCheck {
  const expected = normalize(expectedAnswer);
  const user = normalize(userAnswer);

  const words: WordResult[] = [];
  let correct = 0;

  for (let i = 0; i < expected.length; i++) {
    const userWord = user[i];
    if (userWord === expected[i]) {
      words.push({ word: expected[i], status: 'correct' });
      correct++;
    } else if (userWord !== undefined) {
      words.push({ word: expected[i], status: 'wrong' });
    } else {
      words.push({ word: expected[i], status: 'missing' });
    }
  }

  const score = expected.length > 0 ? Math.round((correct / expected.length) * 100) : 0;

  return {
    score,
    isClose: score >= 70,
    words,
  };
}
