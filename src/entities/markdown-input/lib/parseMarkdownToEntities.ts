import MarkdownIt from "markdown-it";
import type {
  MarkdownOutput,
  MarkdownOutputEntity,
} from "./markdownInput.types";

function parseInlineEntities(text: string): MarkdownOutputEntity[] {
  const entities: MarkdownOutputEntity[] = [];
  let rest = text;
  // Emoji :smile:
  rest = rest.replace(/(:[a-zA-Z0-9_+-]+:)/g, (m) => {
    entities.push({
      text: m,
      markdownEntity: "emoji",
      metadata: { type: "inline" },
    });
    return "";
  });
  // Mention @user
  rest = rest.replace(/(@[\w\d_]+)/g, (m) => {
    entities.push({
      text: m,
      markdownEntity: "mention",
      metadata: { type: "inline" },
    });
    return "";
  });
  // Hashtag #tag (ignore heading)
  rest = rest.replace(/(^|\s)(#[\w\d_]+)/g, (m, p1, p2) => {
    if (p1.trim() === "") {
      entities.push({
        text: p2,
        markdownEntity: "hashtag",
        metadata: { type: "inline" },
      });
      return p1;
    }
    return m;
  });
  // Image ![alt](src)
  rest = rest.replace(/!\[([^\]]*)\]\(([^\)]+)\)/g, (_, alt, src) => {
    entities.push({
      text: alt,
      markdownEntity: "image",
      metadata: { src, alt, type: "inline" },
    });
    return "";
  });
  // Link [text](url) (не изображение)
  rest = rest.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, (_, txt, url) => {
    entities.push({
      text: txt,
      markdownEntity: "link",
      metadata: { url, type: "inline" },
    });
    return "";
  });
  // Bold **text** or __text__
  rest = rest.replace(/(\*\*|__)(.*?)\1/g, (_, __, val) => {
    entities.push({
      text: val,
      markdownEntity: "bold",
      metadata: { type: "inline" },
    });
    return "";
  });
  // Italic *text* or _text_
  rest = rest.replace(/(\*|_)(.*?)\1/g, (_, __, val) => {
    entities.push({
      text: val,
      markdownEntity: "italic",
      metadata: { type: "inline" },
    });
    return "";
  });
  // Inline code `code`
  rest = rest.replace(/`([^`]+)`/g, (_, val) => {
    entities.push({
      text: val,
      markdownEntity: "code",
      metadata: { type: "inline" },
    });
    return "";
  });
  // Plain text left
  if (rest.trim()) {
    entities.push({
      text: rest,
      markdownEntity: "plain",
      metadata: { type: "inline" },
    });
  }
  return entities;
}

export async function parseMarkdownToOutput(
  text: string,
): Promise<MarkdownOutput> {
  const md = new MarkdownIt({ html: false, linkify: true, typographer: true });
  const html = md.render(text);
  const lines = text.split(/\n+/);
  const entities: MarkdownOutputEntity[] = [];
  let inCodeBlock = false;
  let codeLang = undefined;
  let codeLines: string[] = [];
  let tableMode = false;
  let tableRows: string[][] = [];
  let listMode = false;
  let listType: "ordered" | "unordered" = "unordered";
  let listItems: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    // Code block
    if (/^\s*```/.test(line)) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeLang = line.replace(/^\s*```/, "").trim() || undefined;
        continue;
      } else {
        inCodeBlock = false;
        entities.push({
          text: codeLines.join("\n"),
          markdownEntity: "code",
          metadata: { language: codeLang, type: "block" },
        });
        codeLines = [];
        codeLang = undefined;
        continue;
      }
    }
    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }
    // Horizontal rule
    if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
      entities.push({
        text: line,
        markdownEntity: "horizontalRule",
        metadata: { type: "block" },
      });
      continue;
    }
    // Heading (уровни 1-6)
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      entities.push({
        text: headingMatch[2],
        markdownEntity: "heading",
        metadata: { level: headingMatch[1].length, type: "block" },
      });
      continue;
    }
    // Blockquote
    if (/^>\s?/.test(line)) {
      entities.push({
        text: line.replace(/^>\s?/, ""),
        markdownEntity: "blockquote",
        metadata: { type: "block" },
      });
      continue;
    }
    // Table
    if (line.includes("|") && !/^\s*[-|: ]+$/.test(line)) {
      tableMode = true;
      tableRows.push(line.split("|").map((cell) => cell.trim()));
      continue;
    }
    if (tableMode && (/^\s*[-|: ]+$/.test(line) || !line.includes("|"))) {
      // End of table
      if (tableRows.length) {
        entities.push({
          text: tableRows.map((r) => r.join("|")).join("\n"),
          markdownEntity: "table",
          metadata: { type: "block" },
        });
        tableRows.forEach((row, idx) => {
          entities.push({
            text: row.join("|"),
            markdownEntity: "tableRow",
            metadata: { cells: row, isHeader: idx === 0, type: "block" },
          });
          row.forEach((cell) => {
            if (cell === "") {
              entities.push({
                text: cell,
                markdownEntity: "tableCell",
                metadata: { isEmpty: true, type: "block" },
              });
            } else {
              entities.push({
                text: cell,
                markdownEntity: "tableCell",
                metadata: { type: "block" },
              });
            }
          });
        });
      }
      tableRows = [];
      tableMode = false;
      if (!line.includes("|")) {
        // process this line as normal below
      } else {
        continue;
      }
    }
    // List
    const listMatch = line.match(/^\s*([*+-]|\d+\.)\s+(.*)$/);
    if (listMatch) {
      if (!listMode) {
        listMode = true;
        listType = /^[\d]+\./.test(listMatch[1]) ? "ordered" : "unordered";
      }
      listItems.push(listMatch[2]);
      continue;
    } else if (listMode && !/^\s*([*+-]|\d+\.)\s+/.test(line)) {
      // End of list
      entities.push({
        text: listItems.join("\n"),
        markdownEntity: "list",
        metadata: {
          listType,
          type: "block",
          children: listItems.map((item) => ({
            text: item,
            markdownEntity: "listItem",
            metadata: { listType, type: "block" },
          })),
        },
      });
      listItems.forEach((item) => {
        entities.push({
          text: item,
          markdownEntity: "listItem",
          metadata: { listType, type: "block" },
        });
      });
      listItems = [];
      listMode = false;
      // process this line as normal below
    }
    // Fallback: inline parse
    entities.push(...parseInlineEntities(line));
  }
  // If table at end
  if (tableMode && tableRows.length) {
    entities.push({
      text: tableRows.map((r) => r.join("|")).join("\n"),
      markdownEntity: "table",
      metadata: { type: "block" },
    });
    tableRows.forEach((row, idx) => {
      entities.push({
        text: row.join("|"),
        markdownEntity: "tableRow",
        metadata: { cells: row, isHeader: idx === 0, type: "block" },
      });
      row.forEach((cell) => {
        if (cell === "") {
          entities.push({
            text: cell,
            markdownEntity: "tableCell",
            metadata: { isEmpty: true, type: "block" },
          });
        } else {
          entities.push({
            text: cell,
            markdownEntity: "tableCell",
            metadata: { type: "block" },
          });
        }
      });
    });
  }
  // If list at end
  if (listMode && listItems.length) {
    entities.push({
      text: listItems.join("\n"),
      markdownEntity: "list",
      metadata: {
        listType,
        type: "block",
        children: listItems.map((item) => ({
          text: item,
          markdownEntity: "listItem",
          metadata: { listType, type: "block" },
        })),
      },
    });
    listItems.forEach((item) => {
      entities.push({
        text: item,
        markdownEntity: "listItem",
        metadata: { listType, type: "block" },
      });
    });
  }
  return { entities, html };
}
