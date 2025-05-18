import { parseMarkdownToOutput } from '../lib/engine/parser/parseMarkdownToOutput';

describe('parseMarkdownToOutput', () => {
  it('parses headings and paragraphs', async () => {
    const md = '# Heading\n\nText';
    const result = await parseMarkdownToOutput(md);
    expect(result.html).toContain('<h1>');
    expect(result.html).toContain('<p>');
    expect(result.entities.some(e => e.markdownEntity === 'heading')).toBe(true);
    expect(result.entities.some(e => e.markdownEntity === 'paragraph')).toBe(true);
  });

  it('parses code blocks', async () => {
    const md = '```js\nconsole.log(1);\n```';
    const result = await parseMarkdownToOutput(md);
    expect(result.html).toContain('<pre');
    expect(result.entities.some(e => e.markdownEntity === 'code')).toBe(true);
  });
});
