import { MarkdownOutputEntity } from "../../markdownInput.types";

export interface ParserContext {
  entities: MarkdownOutputEntity[];
  inCodeBlock: boolean;
  codeLang?: string;
  codeLines: string[];
  tableMode: boolean;
  tableRows: string[][];
  listMode: boolean;
  listType: 'ordered' | 'unordered';
  listItems: string[];
  currentLineIndex: number;
  lines: string[];
}

export type BlockParser = (context: ParserContext, line: string) => void;
