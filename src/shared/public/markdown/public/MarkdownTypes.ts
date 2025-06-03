/*
* Represents the types of available for parsing elements in a Markdown document.
*/
export type MarkdownElementType =
  | "paragraph"
  | "heading"
  | "heading1"
  | "heading2"
  | "heading3"
  | "heading4"
  | "heading5"
  | "heading6"
  | "bold"
  | "italic"
  | "code"
  | "blockquote"
  | "link"
  | "image"
  | "list"
  | "listItem"
  | "table"
  | "tableHeader"
  | "tableRow"
  | "tableCell"
  | "horizontalRule"
  | "mention"
  | "hashtag"
  | "emoji"
  | "plain";

/**
 * Represents a Markdown token with its type and position.
 */
export type MarkdownSymbol =
  | "*"    // bold/italic
  | "`"    // inline code / code block
  | "["    // link start
  | "]"    // link text end
  | "("    // URL start
  | ")"    // URL end
  | "!"    // image
  | "<"    // escape
  | ">"    // escape or blockquote
  | "#"    // headings
  | "-"    // list item or hr
  | "+"    // list item
  | "=";   // table header underline (alternative to "---")
