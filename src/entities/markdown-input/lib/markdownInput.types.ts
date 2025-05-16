/**
 * Standard Markdown element types
 */
export type MarkdownElementType =
  | 'paragraph'
  | 'heading'
  | 'bold'
  | 'italic'
  | 'code'
  | 'blockquote'
  | 'link'
  | 'image'
  | 'list'
  | 'listItem'
  | 'table'
  | 'tableHeader'
  | 'tableRow'
  | 'tableCell'
  | 'horizontalRule'
  | 'mention'
  | 'hashtag'
  | 'emoji'
  | 'plain';

/**
 * Entity representing a formatted Markdown fragment.
 */
export interface MarkdownOutputEntity<T extends string = MarkdownElementType> {
  /** Text fragment */
  text: string;
  /** Font size (px) */
  fontSize?: number;
  /** Text color */
  color?: string;
  /** Background color of the text */
  backgroundColor?: string;
  /** Type of Markdown element */
  markdownEntity?: T;
  /** Element-specific metadata */
  metadata?: {
    /** Heading level (1-6) */
    level?: number;
    /** Link URL */
    url?: string;
    /** Image source URL */
    src?: string;
    /** Image alt text */
    alt?: string;
    /** List type (ordered/unordered) */
    listType?: 'ordered' | 'unordered';
    /** Code block language */
    language?: string;
    /** Table alignment */
    align?: ('left' | 'center' | 'right')[];
    /** Additional custom data */
    [key: string]: unknown;
  };
}

/**
 * The result of Markdown parsing, containing HTML render, entities, and diagnostics.
 */
export interface MarkdownOutput {
  /** List of text entities with formatting */
  entities: MarkdownOutputEntity[];
  /** HTML version of the Markdown content */
  html: string;
  /** Render performance diagnostics */
  diagnostics?: MarkdownOutputDiagnostics;
}

/**
 * Comprehensive diagnostics for markdown processing.
 */
export interface MarkdownOutputDiagnostics {
  /** Total processing time (ms) */
  timeMs: number;
  /** Character count of input */
  characterCount: number;
  /** Word count */
  wordCount: number;
  /** Number of formatted entities */
  entityCount: number;
  /** Processing stage markers */
  stages: {
    /** Time when parsing started */
    parseStart: number;
    /** Time when parsing completed */
    parseEnd: number;
    /** Time when HTML generation started */
    htmlStart: number;
    /** Time when HTML generation completed */
    htmlEnd: number;
  };
  /** Warning messages */
  warnings?: string[];
  /** Performance metrics */
  metrics?: {
    /** Average time per entity */
    avgTimePerEntity: number;
    /** Average characters per entity */
    avgCharsPerEntity: number;
    /** Memory usage if available */
    memoryUsage?: number;
  };
}

