/**
 * Оптимизированный и надежный класс для обработки markdown
 * Поддерживает конвертацию DOM ↔ Markdown с валидацией и нормализацией
 */

interface BlockData {
  type: BlockType;
  content: string;
  level?: number;
  language?: string;
}

interface ProcessingResult {
  newText: string;
  newCursorPos: number;
}

type BlockType =
  | 'header'
  | 'paragraph'
  | 'code'
  | 'quote'
  | 'unordered-list'
  | 'ordered-list'
  | 'hr';

class MarkdownProcessor {
  // Константы для конфигурации
  private static readonly MAX_NORMALIZATION_ITERATIONS = 5;
  private static readonly INDENT_SIZE = 2;
  private static readonly HTML_ENTITIES = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  } as const;

  // Регулярные выражения (компилируются один раз)
  private static readonly PATTERNS = {
    header: /^(#{1,6})\s+(.+)$/,
    codeBlock: /^```(.*)$/,
    quote: /^>\s/,
    listItem: /^(\s*)([-*+]|\d+\.)\s+(.+)$/,
    orderedList: /^\d+\./,
    horizontalRule: /^(-{3,}|\*{3,}|_{3,})$/,
    indentedLine: /^\s{2,}/,

    // Inline patterns
    boldItalic: /\*\*\*([^*]+)\*\*\*/g,
    bold: /\*\*([^*]+)\*\*/g,
    italic: /\*([^*\n]+)\*/g,
    underlineBoldItalic: /___([^_]+)___/g,
    underlineBold: /__([^_]+)__/g,
    underlineItalic: /_([^_\n]+)_/g,
    inlineCode: /`([^`]+)`/g,
    link: /\[([^\]]+)\]\(([^)]+)\)/g,
    image: /!\[([^\]]*)\]\(([^)]+)\)/g,
    strikethrough: /~~([^~]+)~~/g,
    escapedChars: /\\([*_`~\[\]()#+-=|{}.!\\])/g
  } as const;

  /**
   * Главный метод конвертации DOM в Markdown
   */
  static domToMarkdown(element: HTMLElement): string {
    if (!this.isValidElement(element)) {
      return "";
    }

    try {
      const result = this.processNode(element);
      return this.cleanupMarkdown(result);
    } catch (error) {
      console.error('Error converting DOM to Markdown:', error);
      return "";
    }
  }

  /**
   * Главный метод конвертации Markdown в HTML
   */
  static markdownToHtml(text: string): string {
    if (!text?.trim()) {
      return "";
    }

    try {
      const normalizedText = this.validateAndNormalizeMarkdown(text);
      const blocks = this.parseBlocks(normalizedText);
      return blocks.map(block => this.processBlock(block)).join('');
    } catch (error) {
      console.error('Error converting Markdown to HTML:', error);
      return this.escapeHtml(text);
    }
  }

  /**
   * Обработка отступов с валидацией
   */
  static handleIndentation(
    text: string,
    cursorPos: number,
    isShiftTab: boolean = false
  ): ProcessingResult {
    if (!text || cursorPos < 0) {
      return { newText: text || "", newCursorPos: Math.max(0, cursorPos) };
    }

    try {
      const lines = text.split('\n');
      const { lineIndex, lineStart } = this.findCurrentLine(lines, cursorPos);

      if (lineIndex === -1) {
        return { newText: text, newCursorPos: cursorPos };
      }

      const currentLine = lines[lineIndex];
      const { newLine, cursorOffset } = this.processIndentation(currentLine, isShiftTab);

      lines[lineIndex] = newLine;
      const newText = lines.join('\n');
      const newCursorPos = Math.max(0, cursorPos + cursorOffset);

      return { newText, newCursorPos };
    } catch (error) {
      console.error('Error handling indentation:', error);
      return { newText: text, newCursorPos: cursorPos };
    }
  }

  /**
   * Валидация и нормализация Markdown текста
   */
  static validateAndNormalizeMarkdown(text: string): string {
    if (!text) return "";

    let normalized = text.trim();
    let iterations = 0;

    // Защита от бесконечных циклов
    while (iterations < this.MAX_NORMALIZATION_ITERATIONS) {
      const before = normalized;
      normalized = this.performNormalizationStep(normalized);

      if (before === normalized) break;
      iterations++;
    }

    return normalized;
  }

  // === ПРИВАТНЫЕ МЕТОДЫ ===

  /**
   * Проверка валидности элемента
   */
  private static isValidElement(element: any): element is HTMLElement {
    return element &&
      typeof element === 'object' &&
      element.nodeType === Node.ELEMENT_NODE;
  }

  /**
   * Рекурсивная обработка узлов DOM
   */
  private static processNode(node: Node): string {
    switch (node.nodeType) {
      case Node.TEXT_NODE:
        return node.textContent || "";

      case Node.ELEMENT_NODE:
        const element = node as HTMLElement;
        const childContent = Array.from(element.childNodes)
          .map(child => this.processNode(child))
          .join("");
        return this.elementToMarkdown(element, childContent);

      default:
        return "";
    }
  }

  /**
   * Конвертация HTML элемента в Markdown
   */
  private static elementToMarkdown(element: HTMLElement, childContent: string): string {
    const tagName = element.tagName.toLowerCase();

    const converters: Record<string, () => string> = {
      'strong': () => `**${childContent}**`,
      'b': () => `**${childContent}**`,
      'em': () => `*${childContent}*`,
      'i': () => `*${childContent}*`,
      'code': () => `\`${childContent}\``,
      'h1': () => `\n# ${childContent}\n\n`,
      'h2': () => `\n## ${childContent}\n\n`,
      'h3': () => `\n### ${childContent}\n\n`,
      'h4': () => `\n#### ${childContent}\n\n`,
      'h5': () => `\n##### ${childContent}\n\n`,
      'h6': () => `\n###### ${childContent}\n\n`,
      'blockquote': () => `\n> ${childContent.replace(/\n/g, '\n> ')}\n\n`,
      'pre': () => this.handlePreElement(element, childContent),
      'a': () => `[${childContent}](${element.getAttribute("href") || ""})`,
      'br': () => "\n",
      'p': () => `\n${childContent}\n\n`,
      'div': () => `${childContent}\n`,
      'ul': () => `\n${this.processListToMarkdown(element, false)}\n`,
      'ol': () => `\n${this.processListToMarkdown(element, true)}\n`,
      'li': () => childContent,
      'hr': () => "\n---\n\n",
      'img': () => `![${element.getAttribute("alt") || ""}](${element.getAttribute("src") || ""})`
    };

    return converters[tagName]?.() || childContent;
  }

  /**
   * Обработка элемента <pre>
   */
  private static handlePreElement(element: HTMLElement, childContent: string): string {
    const codeElement = element.querySelector('code');
    const language = codeElement?.className.match(/language-(\w+)/)?.[1] || '';
    return `\n\`\`\`${language}\n${childContent}\n\`\`\`\n\n`;
  }

  /**
   * Обработка списков
   */
  private static processListToMarkdown(listElement: HTMLElement, isOrdered: boolean): string {
    const items = Array.from(listElement.children).filter(
      el => el.tagName.toLowerCase() === 'li'
    );

    return items
      .map((item, index) => this.processListItem(item as HTMLElement, index, isOrdered))
      .join('\n');
  }

  /**
   * Обработка элемента списка
   */
  private static processListItem(item: HTMLElement, index: number, isOrdered: boolean): string {
    const prefix = isOrdered ? `${index + 1}. ` : "- ";
    const content = this.processNode(item).trim();

    const lines = content.split('\n');
    if (lines.length <= 1) {
      return `${prefix}${content}`;
    }

    const firstLine = lines[0];
    const otherLines = lines.slice(1)
      .map(line => `  ${line}`)
      .join('\n');

    return `${prefix}${firstLine}\n${otherLines}`;
  }

  /**
   * Очистка Markdown текста
   */
  private static cleanupMarkdown(text: string): string {
    return text
      .replace(/\n{3,}/g, "\n\n")     // Убираем лишние переносы
      .replace(/^\s+|\s+$/g, "")      // Убираем пробелы в начале и конце
      .replace(/\\{2,}/g, "\\")       // Убираем множественные слэши
      .replace(/\*{4,}/g, "**")       // Исправляем избыточные звездочки
      .replace(/_{4,}/g, "__")        // То же для подчеркиваний
      .replace(/`{3,}(?!`)/g, "``");  // Исправляем код (но не блоки кода)
  }

  /**
   * Разбор текста на блоки
   */
  private static parseBlocks(text: string): BlockData[] {
    const lines = text.split('\n');
    const blocks: BlockData[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i].trimEnd();

      if (!line.trim()) {
        i++;
        continue;
      }

      const result = this.parseNextBlock(lines, i);
      if (result.block !== null) {
        blocks.push(result.block);
      }
      i = result.nextIndex;
    }

    return blocks;
  }

  /**
   * Парсинг следующего блока
   */
  private static parseNextBlock(lines: string[], startIndex: number): { block: BlockData | null, nextIndex: number } {
    const line = lines[startIndex];

    // Заголовки
    const headerMatch = line.match(this.PATTERNS.header);
    if (headerMatch) {
      return {
        block: {
          type: 'header',
          content: headerMatch[2],
          level: headerMatch[1].length
        },
        nextIndex: startIndex + 1
      };
    }

    // Блоки кода
    if (line.startsWith('```')) {
      return this.parseCodeBlock(lines, startIndex);
    }

    // Цитаты
    if (this.PATTERNS.quote.test(line)) {
      return this.parseQuoteBlock(lines, startIndex);
    }

    // Списки
    const listMatch = line.match(this.PATTERNS.listItem);
    if (listMatch) {
      return this.parseListBlock(lines, startIndex);
    }

    // Горизонтальная линия
    if (this.PATTERNS.horizontalRule.test(line)) {
      return {
        block: { type: 'hr', content: '' },
        nextIndex: startIndex + 1
      };
    }

    // Обычный параграф
    return this.parseParagraphBlock(lines, startIndex);
  }

  /**
   * Парсинг блока кода
   */
  private static parseCodeBlock(lines: string[], startIndex: number): { block: BlockData, nextIndex: number } {
    const firstLine = lines[startIndex];
    const language = firstLine.slice(3).trim();
    let content = '';
    let i = startIndex + 1;

    while (i < lines.length && !lines[i].startsWith('```')) {
      content += lines[i] + '\n';
      i++;
    }

    return {
      block: {
        type: 'code',
        content: content.slice(0, -1), // убираем последний \n
        language
      },
      nextIndex: i + 1 // пропускаем закрывающий ```
    };
  }

  /**
   * Парсинг блока цитаты
   */
  private static parseQuoteBlock(lines: string[], startIndex: number): { block: BlockData, nextIndex: number } {
    let content = lines[startIndex].slice(2);
    let i = startIndex + 1;

    while (i < lines.length && this.PATTERNS.quote.test(lines[i])) {
      content += '\n' + lines[i].slice(2);
      i++;
    }

    return {
      block: { type: 'quote', content },
      nextIndex: i
    };
  }

  /**
   * Парсинг блока списка
   */
  private static parseListBlock(lines: string[], startIndex: number): { block: BlockData | null, nextIndex: number } {
    const firstMatch = lines[startIndex].match(this.PATTERNS.listItem);
    if (!firstMatch) {
      return { block: null, nextIndex: startIndex + 1 };
    }

    const isOrdered = this.PATTERNS.orderedList.test(firstMatch[2]);
    let content = lines[startIndex];
    let i = startIndex + 1;

    while (i < lines.length) {
      const line = lines[i];

      if (this.PATTERNS.listItem.test(line) || this.PATTERNS.indentedLine.test(line)) {
        content += '\n' + line;
        i++;
      } else if (!line.trim()) {
        // Пустая строка - проверяем следующую
        if (i + 1 < lines.length && this.PATTERNS.listItem.test(lines[i + 1])) {
          content += '\n' + line + '\n' + lines[i + 1];
          i += 2;
        } else {
          break;
        }
      } else {
        break;
      }
    }

    return {
      block: {
        type: isOrdered ? 'ordered-list' : 'unordered-list',
        content
      },
      nextIndex: i
    };
  }

  /**
   * Парсинг блока параграфа
   */
  private static parseParagraphBlock(lines: string[], startIndex: number): { block: BlockData, nextIndex: number } {
    let content = lines[startIndex];
    let i = startIndex + 1;

    const breakPatterns = [
      this.PATTERNS.header,
      this.PATTERNS.codeBlock,
      this.PATTERNS.quote,
      this.PATTERNS.listItem,
      this.PATTERNS.horizontalRule
    ];

    while (i < lines.length && lines[i].trim()) {
      const line = lines[i];

      if (breakPatterns.some(pattern => pattern.test(line))) {
        break;
      }

      content += '\n' + line;
      i++;
    }

    return {
      block: { type: 'paragraph', content },
      nextIndex: i
    };
  }

  /**
   * Обработка отдельного блока
   */
  private static processBlock(block: BlockData): string {
    const processors: Record<BlockType, () => string> = {
      'header': () => `<h${block.level}>${this.processInlineMarkdown(block.content)}</h${block.level}>`,
      'paragraph': () => `<p>${this.processInlineMarkdown(block.content)}</p>`,
      'code': () => `<pre><code>${this.escapeHtml(block.content)}</code></pre>`,
      'quote': () => `<blockquote>${this.processInlineMarkdown(block.content)}</blockquote>`,
      'unordered-list': () => `<ul>${this.processListItems(block.content)}</ul>`,
      'ordered-list': () => `<ol>${this.processListItems(block.content)}</ol>`,
      'hr': () => '<hr>'
    };

    return processors[block.type]?.() || `<p>${this.processInlineMarkdown(block.content)}</p>`;
  }

  /**
   * Обработка элементов списка
   */
  private static processListItems(content: string): string {
    const lines = content.split('\n');
    let result = '';
    let currentItem = '';

    for (const line of lines) {
      const itemMatch = line.match(this.PATTERNS.listItem);

      if (itemMatch) {
        if (currentItem) {
          result += `<li>${this.processInlineMarkdown(currentItem.trim())}</li>`;
        }
        currentItem = itemMatch[3];
      } else if (this.PATTERNS.indentedLine.test(line)) {
        currentItem += '\n' + line.slice(2);
      }
    }

    if (currentItem) {
      result += `<li>${this.processInlineMarkdown(currentItem.trim())}</li>`;
    }

    return result;
  }

  /**
   * Обработка инлайн-разметки
   */
  private static processInlineMarkdown(text: string): string {
    const normalized = this.validateAndNormalizeMarkdown(text);

    return normalized
      // Порядок важен - от более специфичных к менее специфичным
      .replace(this.PATTERNS.boldItalic, '<strong><em>$1</em></strong>')
      .replace(this.PATTERNS.bold, '<strong>$1</strong>')
      .replace(this.PATTERNS.italic, '<em>$1</em>')
      .replace(this.PATTERNS.underlineBoldItalic, '<strong><em>$1</em></strong>')
      .replace(this.PATTERNS.underlineBold, '<strong>$1</strong>')
      .replace(this.PATTERNS.underlineItalic, '<em>$1</em>')
      .replace(this.PATTERNS.inlineCode, '<code>$1</code>')
      .replace(this.PATTERNS.link, '<a href="$2">$1</a>')
      .replace(this.PATTERNS.image, '<img src="$2" alt="$1">')
      .replace(this.PATTERNS.strikethrough, '<del>$1</del>')
      .replace(this.PATTERNS.escapedChars, '$1')
      .replace(/\n/g, '<br>');
  }

  /**
   * Экранирование HTML
   */
  private static escapeHtml(text: string): string {
    return text.replace(/[&<>"']/g, char => this.HTML_ENTITIES[char as keyof typeof this.HTML_ENTITIES]);
  }

  /**
   * Поиск текущей строки по позиции курсора
   */
  private static findCurrentLine(lines: string[], cursorPos: number): { lineIndex: number, lineStart: number } {
    let lineStart = 0;

    for (let i = 0; i < lines.length; i++) {
      const lineEnd = lineStart + lines[i].length + (i < lines.length - 1 ? 1 : 0);

      if (cursorPos <= lineEnd) {
        return { lineIndex: i, lineStart };
      }

      lineStart = lineEnd;
    }

    return { lineIndex: -1, lineStart: 0 };
  }

  /**
   * Обработка отступа для одной строки
   */
  private static processIndentation(line: string, isShiftTab: boolean): { newLine: string, cursorOffset: number } {
    if (isShiftTab) {
      // Убираем отступ
      if (line.startsWith('  ')) {
        return { newLine: line.slice(2), cursorOffset: -2 };
      }
      if (line.startsWith('\t')) {
        return { newLine: line.slice(1), cursorOffset: -1 };
      }
      return { newLine: line, cursorOffset: 0 };
    } else {
      // Добавляем отступ
      return {
        newLine: ' '.repeat(this.INDENT_SIZE) + line,
        cursorOffset: this.INDENT_SIZE
      };
    }
  }

  /**
   * Один шаг нормализации текста
   */
  private static performNormalizationStep(text: string): string {
    return text
      // Убираем избыточные слэши (но сохраняем одинарные)
      .replace(/\\{2,}/g, "\\")
      // Нормализуем звездочки (максимум 3 подряд для жирного курсива)
      .replace(/\*{4,}/g, "***")
      // Нормализуем подчеркивания
      .replace(/_{4,}/g, "___")
      // Убираем некорректные комбинации
      .replace(/\*\\\*/g, "*")
      .replace(/_\\_/g, "_")
      .replace(/`\\`/g, "`")
      // Исправляем двойное экранирование
      .replace(/\\\\\*/g, "\\*")
      .replace(/\\\\_/g, "\\_")
      .replace(/\\\\`/g, "\\`");
  }
}

export default MarkdownProcessor;
