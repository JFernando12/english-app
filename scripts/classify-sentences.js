const fs = require('fs');
const path = require('path');
const lessons = require('../sentences/lessons.json');

function classify(eng) {
  const normalized = eng.replace(/[\u2018\u2019]/g, "'");

  const advanced = [
    /\b(must|should|could|would|might|may|can't|cannot) have (been|gone|done|known|seen|found|told|left|taken|given|made|come|bought|thought|said|become)\b/i,
    /\bif .{3,}had .{3,}(would|could|might) have\b/i,
    /\bhad (been|gone|done|known|seen|found|left|taken|given|made|come|bought|thought|become)\b/i,
    /\b(insist|suggest|recommend|demand|require|propose|request)(ed|s)?\s+that\b/i,
    /\bby the time\b/i,
    /\bnot until\b/i,
    /\bno sooner\b/i,
    /\bhardly\b.{0,30}\bwhen\b/i,
    /\b(despite|in spite of|regardless of)\b/i,
    /\b(although|even though|whereas|nevertheless|furthermore|moreover|consequently)\b/i,
  ];

  const intermediate = [
    /\b(have|has|had) (been )?(\w+ing|\w+ed)\b/i,
    /\bhas(n't)? \w+(ed|en|t)\b/i,
    /\b(is|are|was|were) \w+ing\b/i,
    /\b(if|unless) .{3,}(will|would|can|could)\b/i,
    /\b(so|too|enough|such) .{0,20}that\b/i,
    /\b(who|which|whose|whom)\b/i,
    /\b(used to|be used to|get used to)\b/i,
    /\b(as soon as|as long as|as far as)\b/i,
    /\b(either|neither|both)\b/i,
    /, (isn't|aren't|doesn't|don't|didn't|won't|wouldn't|can't|haven't|hasn't|couldn't|wasn't|weren't) (it|he|she|they|we|you|there)\?/i,
  ];

  const advScore = advanced.filter((r) => r.test(normalized)).length;
  const intScore = intermediate.filter((r) => r.test(normalized)).length;
  const words = normalized.split(/\s+/).length;
  const avgLen =
    normalized.replace(/[^a-zA-Z\s]/g, '').split(/\s+/).reduce((s, w) => s + w.length, 0) / words;

  if (advScore >= 1) return 'advanced';
  if (intScore >= 1 || words >= 14 || avgLen > 5.2) return 'intermediate';
  return 'beginner';
}

const counts = { beginner: 0, intermediate: 0, advanced: 0 };

const updated = lessons.map((lesson) => ({
  ...lesson,
  sentences: lesson.sentences.map((s) => {
    const level = classify(s.english);
    counts[level]++;
    return { ...s, level };
  }),
}));

fs.writeFileSync(
  path.join(__dirname, '../sentences/lessons.json'),
  JSON.stringify(updated, null, 2)
);

const total = Object.values(counts).reduce((a, b) => a + b, 0);
console.log('Updated sentences/lessons.json');
console.log('Distribution:', counts, '| Total:', total);
