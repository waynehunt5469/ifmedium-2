import * as SQLite from 'expo-sqlite';
import { z } from 'zod';
import {
  Conversation,
  INTENT_LABELS,
  InterpretationDraft,
  InterpretationVersion,
  Message,
  TONE_LABELS,
} from './types';

const db = SQLite.openDatabaseSync('ifmedium.db');

const interpretationSchema = z.object({
  intentLabel: z.enum(INTENT_LABELS),
  toneLabel: z.enum(TONE_LABELS),
  certainty: z.number().int().min(0).max(100),
  concerns: z.array(z.string()),
  notes: z.string(),
});

function id(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function now(): number {
  return Date.now();
}

export async function initDb(): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS conversation(
      id TEXT PRIMARY KEY,
      title TEXT,
      createdAt INTEGER
    );

    CREATE TABLE IF NOT EXISTS message(
      id TEXT PRIMARY KEY,
      conversationId TEXT,
      authorLabel TEXT,
      rawText TEXT,
      createdAt INTEGER
    );

    CREATE TABLE IF NOT EXISTS interpretation_version(
      id TEXT PRIMARY KEY,
      messageId TEXT,
      versionNumber INTEGER,
      intentLabel TEXT,
      toneLabel TEXT,
      certainty INTEGER,
      concernsJson TEXT,
      notes TEXT,
      createdAt INTEGER
    );
  `);
}

export async function seedIfNeeded(): Promise<void> {
  const row = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM conversation');
  if (!row || row.count > 0) return;

  const conversationId = id('conv');
  const createdAt = now();
  await db.runAsync('INSERT INTO conversation (id, title, createdAt) VALUES (?, ?, ?)', [conversationId, 'First conversation', createdAt]);

  const msg1 = await createMessage(conversationId, 'me', 'Can you review this draft now?');
  await createMessage(conversationId, 'friend', "I think it's close, maybe tighten the ending.");
  await createMessage(conversationId, 'me', 'Thank you, I appreciate your help.');

  const latest = await getLatestInterpretation(msg1.id);
  if (latest) {
    await createInterpretationVersion(msg1.id, {
      intentLabel: 'request',
      toneLabel: 'urgent',
      certainty: 72,
      concerns: ['deadline pressure'],
      notes: 'Seeded v2 example.',
    });
  }
}

export async function getConversations(): Promise<Conversation[]> {
  return db.getAllAsync<Conversation>('SELECT * FROM conversation ORDER BY createdAt DESC');
}

export async function createConversation(title: string): Promise<void> {
  await db.runAsync('INSERT INTO conversation (id, title, createdAt) VALUES (?, ?, ?)', [id('conv'), title || 'Untitled conversation', now()]);
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  return db.getAllAsync<Message>('SELECT * FROM message WHERE conversationId = ? ORDER BY createdAt ASC', [conversationId]);
}

export async function getMessage(messageId: string): Promise<Message | null> {
  const found = await db.getFirstAsync<Message>('SELECT * FROM message WHERE id = ?', [messageId]);
  return found ?? null;
}

export async function createMessage(conversationId: string, authorLabel: string, rawText: string): Promise<Message> {
  const message: Message = {
    id: id('msg'),
    conversationId,
    authorLabel: authorLabel || 'unknown',
    rawText,
    createdAt: now(),
  };

  await db.runAsync(
    'INSERT INTO message (id, conversationId, authorLabel, rawText, createdAt) VALUES (?, ?, ?, ?, ?)',
    [message.id, message.conversationId, message.authorLabel, message.rawText, message.createdAt]
  );

  await db.runAsync(
    `INSERT INTO interpretation_version
      (id, messageId, versionNumber, intentLabel, toneLabel, certainty, concernsJson, notes, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id('iv'),
      message.id,
      1,
      'inform',
      'neutral',
      50,
      JSON.stringify([]),
      '',
      now(),
    ]
  );

  return message;
}

export async function getLatestInterpretation(messageId: string): Promise<InterpretationVersion | null> {
  const found = await db.getFirstAsync<InterpretationVersion>(
    'SELECT * FROM interpretation_version WHERE messageId = ? ORDER BY versionNumber DESC LIMIT 1',
    [messageId]
  );
  return found ?? null;
}

export async function getInterpretationHistory(messageId: string): Promise<InterpretationVersion[]> {
  return db.getAllAsync<InterpretationVersion>(
    'SELECT * FROM interpretation_version WHERE messageId = ? ORDER BY versionNumber ASC',
    [messageId]
  );
}

export async function createInterpretationVersion(messageId: string, draft: InterpretationDraft): Promise<void> {
  const parsed = interpretationSchema.parse(draft);
  const latest = await getLatestInterpretation(messageId);
  const nextVersionNumber = (latest?.versionNumber ?? 0) + 1;

  await db.runAsync(
    `INSERT INTO interpretation_version
      (id, messageId, versionNumber, intentLabel, toneLabel, certainty, concernsJson, notes, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id('iv'),
      messageId,
      nextVersionNumber,
      parsed.intentLabel,
      parsed.toneLabel,
      parsed.certainty,
      JSON.stringify(parsed.concerns),
      parsed.notes,
      now(),
    ]
  );
}
