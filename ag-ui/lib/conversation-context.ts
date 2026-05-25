export interface ContextFeedItem {
  q: string;
  cardType: string;
  summary?: string;
}

export function buildConversationContext(feed: ContextFeedItem[], limit = 3): string {
  const recent = feed.slice(-limit).reverse();
  if (recent.length === 0) return "";
  const lines = recent.map((item, i) =>
    `${i + 1}. Q: '${item.q}' → ${item.cardType}: '${item.summary ?? "(no summary)"}'`
  );
  return `Prior turns (most recent first):\n${lines.join("\n")}`;
}
