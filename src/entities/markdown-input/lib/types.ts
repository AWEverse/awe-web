// Types for markdown input utilities
export interface MarkdownGeneratorConfig {
  promptForUrl?: boolean;
  defaultUrl?: string;
  wrapWithNewlines?: boolean;
}

export interface EditorSelection {
  text: string;
  range: Range;
  selection: Selection;
}

export interface InsertionResult {
  success: boolean;
  error?: string;
}

// Configuration for content sanitization
export interface SanitizeConfiguration {
  ALLOWED_TAGS: string[];
  ALLOWED_ATTR: string[];
}

// Markdown insertion strategies
export type InsertionStrategy = 'text' | 'html' | 'hybrid';

export interface MarkdownInsertionOptions {
  strategy?: InsertionStrategy;
  preserveCursor?: boolean;
  updateState?: boolean;
}
