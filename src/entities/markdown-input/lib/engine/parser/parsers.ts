import { ParserContext } from "./types";

// Обработа кодовых
export function parseCodeBlock(context: ParserContext, line: string): void {
  if (/^\s*```/.test(line)) {
    if (!context.inCodeBlock) {
      context.inCodeBlock = true;
      context.codeLang = line.replace(/^\s*```/, "").trim() || undefined;
      context.codeLines = [];
    } else {
      context.inCodeBlock = false;
      context.entities.push({
        text: context.codeLines.join("\n"),
        markdownEntity: "code",
        metadata: { language: context.codeLang, type: "block", isBlock: true }
      });
      context.codeLang = undefined;
    }
    return;
  }

  if (context.inCodeBlock) {
    context.codeLines.push(line);
    return;
  }
}

// Обработка горизонтальных линий
export function parseHorizontalRule(context: ParserContext, line: string): void {
  if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
    context.entities.push({
      text: line,
      markdownEntity: "horizontalRule",
      metadata: { type: "block" }
    });
  }
}

// Обработка заголовков
export function parseHeading(context: ParserContext, line: string): void {
  const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
  if (headingMatch) {
    context.entities.push({
      text: headingMatch[2],
      markdownEntity: "heading",
      metadata: { level: headingMatch[1].length, type: "block" }
    });
  }
}

// Обработка цитат
export function parseBlockquote(context: ParserContext, line: string): void {
  if (/^>\s?/.test(line)) {
    context.entities.push({
      text: line.replace(/^>\s?/, ""),
      markdownEntity: "blockquote",
      metadata: { type: "block" }
    });
  }
}

// Обработка таблиц
export function parseTable(context: ParserContext, line: string): void {
  if (line.includes("|") && !/^\s*[-|: ]+$/.test(line)) {
    context.tableMode = true;
    context.tableRows.push(line.split("|").map((cell) => cell.trim()));
    return;
  }

  if (context.tableMode && (/^\s*[-|: ]+$/.test(line) || !line.includes("|"))) {
    if (context.tableRows.length) {
      context.entities.push({
        text: context.tableRows.map(r => r.join("|")).join("\n"),
        markdownEntity: "table",
        metadata: { type: "block" }
      });

      context.tableRows.forEach((row, idx) => {
        context.entities.push({
          text: row.join("|"),
          markdownEntity: "tableRow",
          metadata: { cells: row, isHeader: idx === 0, type: "block" }
        });

        row.forEach((cell) => {
          context.entities.push({
            text: cell,
            markdownEntity: idx === 0 ? "tableHeader" : "tableCell",
            metadata: { isEmpty: cell === "", type: "block" }
          });
        });
      });
    }

    context.tableRows = [];
    context.tableMode = false;
  }
}

// Обработка списков
export function parseList(context: ParserContext, line: string): void {
  const listMatch = line.match(/^\s*([*+-]|\d+\.)\s+(.*)$/);
  if (listMatch) {
    if (!context.listMode) {
      context.listMode = true;
      context.listType = /^[\d]+\./.test(listMatch[1]) ? "ordered" : "unordered";
      context.listItems = [];
    }
    context.listItems.push(listMatch[2]);
    return;
  }

  if (context.listMode && !/^\s*([*+-]|\d+\.)\s+/.test(line)) {
    context.entities.push({
      text: context.listItems.join("\n"),
      markdownEntity: "list",
      metadata: {
        listType: context.listType,
        type: "block",
        children: context.listItems.map(item => ({
          text: item,
          markdownEntity: "listItem",
          metadata: { listType: context.listType, type: "block" }
        }))
      }
    });

    context.listItems.forEach(item => {
      context.entities.push({
        text: item,
        markdownEntity: "listItem",
        metadata: { listType: context.listType, type: "block" }
      });
    });

    context.listItems = [];
    context.listMode = false;
  }
}

// Обработка параграфов
export function parseParagraph(context: ParserContext, line: string): void {
  const isBlockElement =
    /^\s*(```|#{1,6}|\s*[-*+]\s|>\s|\d+\.\s|.*\|.*$|^\s*[-*+]{3,}\s*$)/.test(line) ||
    context.inCodeBlock;

  if (line.trim() && !isBlockElement) {
    context.entities.push({
      text: line,
      markdownEntity: "paragraph",
      metadata: { type: "block" }
    });
  }
}
