import findSequence from '@/lib/core/public/algo/findSequence';

describe('1) findSequence', () => {
  it('should return the correct index for the first occurrence', () => {
    const where = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const what = [4, 5, 6];
    expect(findSequence(where, what)).toBe(3); // The pattern [4, 5, 6] starts at index 3
  });

  it('should return -1 when the pattern is not found', () => {
    const where = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const what = [10, 11, 12];
    expect(findSequence(where, what)).toBe(-1); // Pattern not found
  });

  it('should return 0 for an empty pattern', () => {
    const where = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const what: number[] = [];
    expect(findSequence(where, what)).toBe(0); // An empty pattern is found at index 0
  });

  it('should return -1 when the pattern is longer than the array', () => {
    const where = [1, 2, 3];
    const what = [4, 5, 6, 7];
    expect(findSequence(where, what)).toBe(-1); // Pattern is longer than the array
  });

  it('should return the correct index for a single-element pattern', () => {
    const where = [1, 2, 3, 4, 5];
    const what = [3];
    expect(findSequence(where, what)).toBe(2); // The pattern [3] starts at index 2
  });

  it('should handle the case when the pattern is found at the end of the array', () => {
    const where = [1, 2, 3, 4, 5];
    const what = [4, 5];
    expect(findSequence(where, what)).toBe(3); // The pattern [4, 5] starts at index 3
  });

  // Performance Test
  it('should perform well with large input sizes', () => {
    const largeArray = Array.from({ length: 1000000 }, (_, i) => i);
    const largePattern = Array.from({ length: 5000 }, (_, i) => i + 5000);

    console.time('findSequence Performance');
    const result = findSequence(largeArray, largePattern);
    console.timeEnd('findSequence Performance');

    expect(result).toBe(5000); // Pattern starts at index 4500
  });
});

describe('2) findSequence', () => {
  it('should return the correct index for the first occurrence', () => {
    const where = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const what = [4, 5, 6];
    expect(findSequence(where, what)).toBe(3); // The pattern [4, 5, 6] starts at index 3
  });

  it('should return -1 when the pattern is not found', () => {
    const where = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const what = [10, 11, 12];
    expect(findSequence(where, what)).toBe(-1); // Pattern not found
  });

  it('should return 0 for an empty pattern', () => {
    const where = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const what: number[] = [];
    expect(findSequence(where, what)).toBe(0); // An empty pattern is found at index 0
  });

  it('should return -1 when the pattern is longer than the array', () => {
    const where = [1, 2, 3];
    const what = [4, 5, 6, 7];
    expect(findSequence(where, what)).toBe(-1); // Pattern is longer than the array
  });

  it('should return the correct index for a single-element pattern', () => {
    const where = [1, 2, 3, 4, 5];
    const what = [3];
    expect(findSequence(where, what)).toBe(2); // The pattern [3] starts at index 2
  });

  it('should handle the case when the pattern is found at the end of the array', () => {
    const where = [1, 2, 3, 4, 5];
    const what = [4, 5];
    expect(findSequence(where, what)).toBe(3); // The pattern [4, 5] starts at index 3
  });

  // Performance Test
  it('should perform well with large input sizes', () => {
    const largeArray = Array.from({ length: 1000000 }, (_, i) => i);
    const largePattern = Array.from({ length: 5000 }, (_, i) => i + 4500);

    console.time('findSequence Performance');
    const result = findSequence(largeArray, largePattern);
    console.timeEnd('findSequence Performance');

    expect(result).toBe(4500); // Pattern starts at index 4500
  });

  // Test with string pattern
  it('should find the correct index for string pattern', () => {
    const where = ['apple', 'banana', 'cherry', 'date', 'elderberry'];
    const what = ['cherry', 'date'];
    expect(findSequence(where, what)).toBe(2); // The pattern ['cherry', 'date'] starts at index 2
  });

  // Test with mixed types
  it('should find the correct index for mixed type pattern', () => {
    const where = [1, 'hello', 3, 4, 'world'];
    const what = [3, 4];
    expect(findSequence(where, what)).toBe(2); // The pattern [3, 4] starts at index 2
  });

  // Test with arrays as elements
  it('should find the correct index for pattern with array elements', () => {
    const where = [[1], [2, 3], [4, 5], [6, 7]];
    const what = [
      [4, 5],
      [6, 7],
    ];
    expect(findSequence(where, what)).toBe(2); // The pattern [[4, 5], [6, 7]] starts at index 2
  });

  // Test with boolean values
  it('should find the correct index for boolean values', () => {
    const where = [true, false, true, false, true];
    const what = [false, true];
    expect(findSequence(where, what)).toBe(1); // The pattern [false, true] starts at index 1
  });

  // Test with object elements (custom objects)
  it('should find the correct index for object pattern', () => {
    const where = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
      { id: 3, name: 'Charlie' },
    ];
    const what = [{ id: 2, name: 'Bob' }];
    expect(findSequence(where, what)).toBe(1); // The pattern [{ id: 2, name: 'Bob' }] starts at index 1
  });

  // Test with undefined and null values
  it('should find the correct index for undefined and null values', () => {
    const where = [undefined, null, 1, 2, 3];
    const what = [null, 1];
    expect(findSequence(where, what)).toBe(1); // The pattern [null, 1] starts at index 1
  });
});
