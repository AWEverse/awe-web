import findSubstring from '@/lib/core/public/string/findSubstring';

describe('findSubstring', () => {
  it('should return 0 when pattern is empty', () => {
    const text = 'abcdef';
    const pattern = '';
    const result = findSubstring(text, pattern);
    expect(result).toBe(0);
  });

  it('should return the correct index for a simple match', () => {
    const text = 'abcdef';
    const pattern = 'bcd';
    const result = findSubstring(text, pattern);
    expect(result).toBe(1);
  });

  it('should return -1 when the pattern is not found', () => {
    const text = 'abcdef';
    const pattern = 'xyz';
    const result = findSubstring(text, pattern);
    expect(result).toBe(-1);
  });

  it('should find pattern when it occurs multiple times, returning the first occurrence', () => {
    const text = 'abcabcabc';
    const pattern = 'abc';
    const result = findSubstring(text, pattern);
    expect(result).toBe(0);
  });

  it('should return -1 if pattern is larger than text', () => {
    const text = 'ab';
    const pattern = 'abc';
    const result = findSubstring(text, pattern);
    expect(result).toBe(-1);
  });

  it('should find the pattern at the end of the text', () => {
    const text = 'xyzabc';
    const pattern = 'abc';
    const result = findSubstring(text, pattern);
    expect(result).toBe(3);
  });

  it('should find the pattern when text and pattern are identical', () => {
    const text = 'abcdef';
    const pattern = 'abcdef';
    const result = findSubstring(text, pattern);
    expect(result).toBe(0);
  });

  it('should return the correct index for a simple match', () => {
    const text = 'abcd';
    const pattern = 'bcd';
    const result = findSubstring(text, pattern);
    expect(result).toBe(1);
  });

  it('should return -1 when the pattern is not found', () => {
    const text = 'abcd';
    const pattern = 'xyz';
    const result = findSubstring(text, pattern);
    expect(result).toBe(-1);
  });

  it('should handle large inputs efficiently', () => {
    const text = 'a'.repeat(10000) + 'abcdef';
    const pattern = 'abcdef';
    const result = findSubstring(text, pattern);
    expect(result).toBe(10000);
  });
});
