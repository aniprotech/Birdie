export async function replayOwnedQueue(items, ownerId, deliver, describeError) {
  const remaining = [];
  let sent = 0;
  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    if (item.ownerId !== ownerId) {
      remaining.push(item);
      continue;
    }
    try {
      await deliver(item);
      sent += 1;
    } catch (error) {
      remaining.push({
        ...item,
        attempts: (item.attempts || 0) + 1,
        lastError: describeError(error),
      });
      remaining.push(...items.slice(index + 1));
      break;
    }
  }
  return { remaining, sent };
}
