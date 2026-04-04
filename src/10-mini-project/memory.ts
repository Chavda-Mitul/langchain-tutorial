/**
 * 10-mini-project/memory.ts
 * ─────────────────────────
 * Conversation memory management for the Research Assistant.
 */

import { InMemoryChatMessageHistory } from "@langchain/core/chat_history";

const messageHistories: Record<string, InMemoryChatMessageHistory> = {};

export function getMessageHistory(sessionId: string): InMemoryChatMessageHistory {
  if (!messageHistories[sessionId]) {
    messageHistories[sessionId] = new InMemoryChatMessageHistory();
  }
  return messageHistories[sessionId];
}

export function listSessions(): string[] {
  return Object.keys(messageHistories);
}

export async function getSessionMessageCount(sessionId: string): Promise<number> {
  const history = messageHistories[sessionId];
  if (!history) return 0;
  const messages = await history.getMessages();
  return messages.length;
}
