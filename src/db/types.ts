export const INTENT_LABELS = [
  'inform',
  'request',
  'propose',
  'warn',
  'set-boundary',
  'apologize',
  'challenge',
  'coordinate',
  'negotiate',
  'vent',
] as const;

export const TONE_LABELS = [
  'neutral',
  'warm',
  'urgent',
  'frustrated',
  'fearful',
  'sad',
  'confident',
  'playful',
  'formal',
] as const;

export type IntentLabel = (typeof INTENT_LABELS)[number];
export type ToneLabel = (typeof TONE_LABELS)[number];

export type Conversation = {
  id: string;
  title: string;
  createdAt: number;
};

export type Message = {
  id: string;
  conversationId: string;
  authorLabel: string;
  rawText: string;
  createdAt: number;
};

export type InterpretationVersion = {
  id: string;
  messageId: string;
  versionNumber: number;
  intentLabel: IntentLabel;
  toneLabel: ToneLabel;
  certainty: number;
  concernsJson: string;
  notes: string;
  createdAt: number;
};

export type InterpretationDraft = {
  intentLabel: IntentLabel;
  toneLabel: ToneLabel;
  certainty: number;
  concerns: string[];
  notes: string;
};

export type Suggestion = {
  intentLabel: IntentLabel;
  intentConfidence: number;
  toneLabel: ToneLabel;
  toneConfidence: number;
  suggestedCertainty: number;
};
