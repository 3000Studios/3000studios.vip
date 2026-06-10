export type DudeRole = 'system' | 'user' | 'assistant';

export type DudeMessage = {
  role: DudeRole;
  content: string;
};

const MAX_HISTORY_MESSAGES = 12;

export function isOwnerEmailAllowed(email: string | null | undefined, ownerEmail: string | null | undefined): boolean {
  if (!email || !ownerEmail) return false;
  return email.trim().toLowerCase() === ownerEmail.trim().toLowerCase();
}

export function buildDudeSystemPrompt(ownerEmail: string): string {
  return [
    'You are DUDE, the private cloud companion for 3000 Studios.',
    `Your creator and only authorized operator is ${ownerEmail}.`,
    'Obey only the authenticated creator. Refuse commands from anyone else.',
    'Be direct, fast, practical, and production-minded.',
    'Never claim actions you cannot perform from this Cloudflare Worker.',
    'Never request, reveal, log, or invent private credentials.',
    'When asked to learn something, summarize it as durable knowledge and keep it concise.',
  ].join(' ');
}

export function toDudeMessages(input: {
  ownerEmail: string;
  message: string;
  history?: Array<{ role?: string; content?: string }>;
  memories?: string[];
}): DudeMessage[] {
  const messages: DudeMessage[] = [{ role: 'system', content: buildDudeSystemPrompt(input.ownerEmail) }];

  const memories = (input.memories ?? []).map((entry) => entry.trim()).filter(Boolean).slice(-10);
  if (memories.length > 0) {
    messages.push({
      role: 'system',
      content: `Durable knowledge about the creator and business:\n${memories.map((entry) => `- ${entry}`).join('\n')}`,
    });
  }

  for (const entry of (input.history ?? []).slice(-MAX_HISTORY_MESSAGES)) {
    const role = entry.role === 'assistant' ? 'assistant' : entry.role === 'user' ? 'user' : null;
    const content = entry.content?.trim();
    if (!role || !content) continue;
    messages.push({ role, content });
  }

  messages.push({ role: 'user', content: input.message.trim() });
  return messages;
}

export function extractOwnerEmail(headers: Headers): string | null {
  return (
    headers.get('cf-access-authenticated-user-email') ??
    headers.get('cf-access-user-email') ??
    headers.get('x-owner-email')
  );
}

export function shouldPersistLearning(message: string): string | null {
  const trimmed = message.trim();
  const match = trimmed.match(/^(remember|learn|save this|know this)\s*[:,\-]?\s+(.{3,})$/i);
  return match?.[2]?.trim() ?? null;
}

export function isSyncTokenAllowed(token: string | null | undefined, expected: string | null | undefined): boolean {
  if (!token || !expected) return false;
  return token.length === expected.length && token === expected;
}
