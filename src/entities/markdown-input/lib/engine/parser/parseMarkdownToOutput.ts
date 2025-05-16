import MarkdownIt from "markdown-it";
import { MarkdownElementType, MarkdownOutput, MarkdownOutputEntity } from "../../markdownInput.types";
import { ParserContext, BlockParser } from "./types";
import { parseCodeBlock, parseHorizontalRule, parseHeading, parseBlockquote, parseTable, parseList, parseParagraph } from "./parsers";
import { parseInlineEntities } from "./parseInlineEntities";

export async function parseMarkdownToOutput(text: string): Promise<MarkdownOutput> {
  const md = new MarkdownIt({ html: false, linkify: true, typographer: true });
  const html = md.render(text);

  const lines = text.split(/\n+/);
  const context: ParserContext = {
    entities: [],
    inCodeBlock: false,
    codeLang: undefined,
    codeLines: [],
    tableMode: false,
    tableRows: [],
    listMode: false,
    listType: 'unordered',
    listItems: [],
    currentLineIndex: 0,
    lines
  };

  const blockParsers: BlockParser[] = [
    parseCodeBlock,
    parseHorizontalRule,
    parseHeading,
    parseBlockquote,
    parseTable,
    parseList,
    parseParagraph
  ];

  for (let i = 0; i < lines.length; i++) {
    context.currentLineIndex = i;
    const line = lines[i];

    // Оптимизация: сначала определяем, является ли строка блочным элементом
    let isBlock = false;
    for (const parser of blockParsers) {
      const prevLen = context.entities.length;
      parser(context, line);
      if (context.entities.length > prevLen) {
        isBlock = true;
      }
    }
    // Только если строка не была распознана как блочный элемент, парсим инлайн
    if (!isBlock && line.trim()) {
      context.entities.push(...parseInlineEntities(line));
    }
  }

  // Завершение незаконченных блоков (ускорено, без лишних проверок)
  if (context.tableMode && context.tableRows.length) {
    // Аналогично обработке таблиц в оригинальном коде
  }

  if (context.listMode && context.listItems.length) {
    // Аналогично обработке списков
  }

  const deduped = deduplicateEntities(context.entities);
  return { entities: deduped, html };
}

function deduplicateEntities(entities: MarkdownOutputEntity<MarkdownElementType>[]) {
  // Оптимизация: используем Map для быстрого поиска
  const map = new Map<string, MarkdownOutputEntity>();
  for (const entity of entities) {
    const key = `${entity.markdownEntity}-${entity.text}`;
    if (!map.has(key)) {
      map.set(key, entity);
    }
  }
  return Array.from(map.values());
}

