import { Suggestion } from './types';

export function suggestInterpretation(rawText: string): Suggestion {
  const text = rawText.trim().toLowerCase();

  let intentLabel: Suggestion['intentLabel'] = 'inform';
  let intentConfidence = 60;
  let toneLabel: Suggestion['toneLabel'] = 'neutral';
  let toneConfidence = 55;
  let suggestedCertainty = 50;

  if (/^(can you|could you|please)\b/.test(text)) {
    intentLabel = 'request';
    intentConfidence = 70;
  }

  if (/\b(i think|maybe|not sure)\b/.test(text)) {
    suggestedCertainty = 35;
  }

  if (/\b(asap|urgent|now)\b/.test(text)) {
    toneLabel = 'urgent';
    toneConfidence = 80;
  }

  if (/\b(i'm worried|im worried|scared)\b/.test(text)) {
    toneLabel = 'fearful';
    toneConfidence = 75;
  }

  if (/\b(thank you|appreciate)\b/.test(text)) {
    toneLabel = 'warm';
    toneConfidence = 65;
  }

  return {
    intentLabel,
    intentConfidence,
    toneLabel,
    toneConfidence,
    suggestedCertainty,
  };
}
