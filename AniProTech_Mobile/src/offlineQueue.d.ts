export type QueueItem = { ownerId: string; attempts: number; lastError: string; [key: string]: unknown };
export function replayOwnedQueue<T extends QueueItem>(
  items: T[],
  ownerId: string,
  deliver: (item: T) => Promise<unknown>,
  describeError: (error: unknown) => string,
): Promise<{ remaining: T[]; sent: number }>;
