import { MarkdownElementType, MarkdownSymbol } from "./MarkdownTypes";

/**
 * Represents a parsed Markdown token with type, start/end positions, and content.
 */
export interface MarkdownToken {
  /** The type of the Markdown element (e.g., bold, heading, link, etc.) */
  type: MarkdownElementType;
  /** The start index of the token in the source text */
  start: number;
  /** The end index of the token in the source text */
  end: number;
  /** The content of the token (text between start and end) */
  content: string;
}

/**
 * Internal structure for tracking currently open Markdown tokens during parsing.
 */
interface ActiveToken {
  /** The type of the Markdown element being tracked */
  type: MarkdownElementType;
  /** The index in the text where the token started */
  startIndex: number;
  /** The Markdown symbol that opened this token (e.g., '*', '[', etc.) */
  symbol: MarkdownSymbol;
}

/**
 * Set of all recognized Markdown symbols for real-time parsing.
 */
const markdownSymbolsSet = new Set<MarkdownSymbol>([
  "*",
  "`",
  "[",
  "]",
  "(",
  ")",
  "!",
  "<",
  ">",
  "#",
  "-",
  "+",
  "=",
]);

/**
 * Real-time Markdown parser for detecting and emitting Markdown tokens as the user types.
 *
 * Usage:
 *   const parser = new MarkdownRealtimeParser();
 *   parser.onInput(char, position, text);
 */
export class MarkdownRealtimeParser {
  /** Stack of currently open tokens (e.g., unclosed bold, link, etc.) */
  private activeTokens: ActiveToken[] = [];
  /** List of tokens emitted during the last input event */
  private emittedTokens: MarkdownToken[] = [];

  /**
   * Resets the parser state, clearing all active and emitted tokens.
   */
  reset() {
    this.activeTokens.length = 0;
    this.emittedTokens.length = 0;
  }

  /**
   * Checks if a character is a recognized Markdown symbol.
   * @param char The character to check.
   * @returns True if the character is a Markdown symbol, false otherwise.
   */
  isMarkdownSymbol(char: string): boolean {
    return markdownSymbolsSet.has(char as MarkdownSymbol);
  }

  /**
   * Processes a single character input and updates the parser state.
   * Emits any completed Markdown tokens.
   *
   * @param char The character input by the user.
   * @param position The position of the character in the text.
   * @param text The full text being parsed.
   * @returns An array of MarkdownToken objects emitted as a result of this input.
   */
  onInput(char: string, position: number, text: string): MarkdownToken[] {
    if (!this.isMarkdownSymbol(char)) return [];

    const symbol = char as MarkdownSymbol;

    switch (symbol) {
      case "*":
      case "`":
        this.handlePairedSymbol(symbol, position, text);
        break;
      case "[":
        this.activeTokens.push({ type: "link", startIndex: position, symbol: "[" });
        break;
      case "]":
        this.completeIfMatching("link", "[", position, text);
        break;
      case "(":
        this.activeTokens.push({ type: "link", startIndex: position, symbol: "(" });
        break;
      case ")":
        this.completeIfMatching("link", "(", position, text);
        break;
      case "#":
        if (this.isStartOfLine(text, position)) {
          this.activeTokens.push({ type: "heading", startIndex: position, symbol: "#" });
        }
        break;
      case ">":
        if (this.isStartOfLine(text, position)) {
          this.activeTokens.push({ type: "blockquote", startIndex: position, symbol: ">" });
        }
        break;
      case "-":
      case "+":
        if (this.isStartOfLine(text, position)) {
          this.activeTokens.push({ type: "listItem", startIndex: position, symbol });
        }
        break;
    }

    const result = this.emittedTokens.slice();
    this.emittedTokens.length = 0;
    return result;
  }

  /**
   * Handles paired Markdown symbols (e.g., '*', '`') for bold and code tokens.
   * @param symbol The Markdown symbol encountered.
   * @param pos The position of the symbol in the text.
   * @param text The full text being parsed.
   */
  private handlePairedSymbol(symbol: MarkdownSymbol, pos: number, text: string) {
    for (let i = this.activeTokens.length - 1; i >= 0; i--) {
      const t = this.activeTokens[i];
      if (t.symbol === symbol) {
        this.emitToken({
          type: symbol === "*" ? "bold" : "code",
          start: t.startIndex,
          end: pos,
          content: text.slice(t.startIndex + 1, pos),
        });
        this.activeTokens.splice(i, 1);
        return;
      }
    }
    this.activeTokens.push({
      type: symbol === "*" ? "bold" : "code",
      startIndex: pos,
      symbol,
    });
  }

  /**
   * Completes an active token if a matching closing symbol is found.
   * @param type The type of Markdown element to complete.
   * @param openSymbol The opening symbol for the token.
   * @param pos The position of the closing symbol in the text.
   * @param text The full text being parsed.
   */
  private completeIfMatching(type: MarkdownElementType, openSymbol: MarkdownSymbol, pos: number, text: string) {
    for (let i = this.activeTokens.length - 1; i >= 0; i--) {
      const t = this.activeTokens[i];
      if (t.type === type && t.symbol === openSymbol) {
        this.emitToken({
          type,
          start: t.startIndex,
          end: pos,
          content: text.slice(t.startIndex + 1, pos),
        });
        this.activeTokens.splice(i, 1);
        return;
      }
    }
  }

  /**
   * Emits a completed Markdown token.
   * @param token The MarkdownToken to emit.
   */
  private emitToken(token: MarkdownToken) {
    this.emittedTokens.push(token);
  }

  /**
   * Checks if a given index is at the start of a line in the text.
   * @param text The full text being parsed.
   * @param index The index to check.
   * @returns True if the index is at the start of a line, false otherwise.
   */
  isStartOfLine(text: string, index: number): boolean {
    return index === 0 || text[index - 1] === "\n";
  }

  /**
   * Returns the current stack of active (unclosed) tokens.
   * @returns An array of ActiveToken objects.
   */
  getActiveTokens() {
    return this.activeTokens;
  }
}
