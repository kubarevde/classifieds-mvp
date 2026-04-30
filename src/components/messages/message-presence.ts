export function formatPresence(input: { isOnline?: boolean; lastSeenAt?: string | null }): string {
  if (input.isOnline) {
    return "в сети";
  }
  if (!input.lastSeenAt) {
    return "не в сети";
  }
  const diffMs = Date.now() - new Date(input.lastSeenAt).getTime();
  const diffMin = Math.max(1, Math.round(diffMs / 60000));
  if (diffMin < 60) {
    return `был(а) в сети ${diffMin} мин назад`;
  }
  const diffHours = Math.round(diffMin / 60);
  return `был(а) в сети ${diffHours} ч назад`;
}

