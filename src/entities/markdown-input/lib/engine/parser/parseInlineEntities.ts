import { MarkdownOutputEntity } from "../../markdownInput.types";

export function parseInlineEntities(text: string): MarkdownOutputEntity[] {
  const entities: MarkdownOutputEntity[] = [];
  if (!text) return entities;

  const regex =
    /(:[a-zA-Z0-9_+-]+:)|(@[\w\d_]+)|(#[\w\d_]+)|!\[([^\]]*)\]\(([^\)]+)\)|\[([^\]]+)\]\(([^\)]+)\)|(\*\*|__)(.*?)\8|(\*|_)(.*?)\10|`([^`]+)`/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const plain = text.slice(lastIndex, match.index);
      if (plain.trim()) {
        entities.push({
          text: plain,
          markdownEntity: "plain",
          metadata: { type: "inline" },
        });
      }
    }
    if (match[1]) {
      entities.push({
        text: match[1],
        markdownEntity: "emoji",
        metadata: { type: "inline" },
      });
    } else if (match[2]) {
      entities.push({
        text: match[2],
        markdownEntity: "mention",
        metadata: { type: "inline" },
      });
    } else if (match[3]) {
      entities.push({
        text: match[3],
        markdownEntity: "hashtag",
        metadata: { type: "inline" },
      });
    } else if (match[4] !== undefined && match[5] !== undefined) {
      entities.push({
        text: match[4],
        markdownEntity: "image",
        metadata: { src: match[5], alt: match[4], type: "inline" },
      });
    } else if (match[6] !== undefined && match[7] !== undefined) {
      entities.push({
        text: match[6],
        markdownEntity: "link",
        metadata: { url: match[7], type: "inline" },
      });
    } else if (match[8] && match[9] !== undefined) {
      entities.push({
        text: match[9],
        markdownEntity: "bold",
        metadata: { type: "inline" },
      });
    } else if (match[10] && match[11] !== undefined) {
      entities.push({
        text: match[11],
        markdownEntity: "italic",
        metadata: { type: "inline" },
      });
    } else if (match[12]) {
      entities.push({
        text: match[12],
        markdownEntity: "code",
        metadata: { type: "inline" },
      });
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    const plain = text.slice(lastIndex);
    if (plain.trim()) {
      entities.push({
        text: plain,
        markdownEntity: "plain",
        metadata: { type: "inline" },
      });
    }
  }
  return entities;
}
