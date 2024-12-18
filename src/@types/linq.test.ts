import '../lib/core/public/templates/linq';

describe('Array.prototype.orderBy', () => {
  // Test 1: Correctly sorts numbers in ascending order
  it('1. should correctly sort numbers in ascending order', () => {
    const array = [5, 3, 8, 1, 4];
    const result = array.orderBy(item => item);
    expect(result).toEqual([1, 3, 4, 5, 8]);
  });

  // Test 2: Correctly sorts strings in alphabetical order
  it('2. should correctly sort strings alphabetically', () => {
    const array = ['banana', 'apple', 'orange', 'grape'];
    const result = array.orderBy(item => item);
    expect(result).toEqual(['apple', 'banana', 'grape', 'orange']);
  });

  // Test 3: Correctly sorts objects by numeric property in ascending order
  it('3. should correctly sort objects by numeric property in ascending order', () => {
    const array = [
      { id: 3, name: 'Alice' },
      { id: 1, name: 'Bob' },
      { id: 2, name: 'Charlie' },
    ];
    const result = array.orderBy(item => item.id);
    expect(result).toEqual([
      { id: 1, name: 'Bob' },
      { id: 2, name: 'Charlie' },
      { id: 3, name: 'Alice' },
    ]);
  });

  // Test 4: Correctly sorts objects by string property in alphabetical order
  it('4. should correctly sort objects by string property in alphabetical order', () => {
    const array = [
      { id: 3, name: 'Alice' },
      { id: 1, name: 'Bob' },
      { id: 2, name: 'Charlie' },
    ];
    const result = array.orderBy(item => item.name);
    expect(result).toEqual([
      { id: 3, name: 'Alice' },
      { id: 1, name: 'Bob' },
      { id: 2, name: 'Charlie' },
    ]);
  });

  // Test 5: Correctly handles empty array
  it('5. should handle empty array correctly', () => {
    const array: number[] = [];
    const result = array.orderBy(item => item);
    expect(result).toEqual([]); // Empty array should remain empty
  });

  // Test 6: Correctly handles array with one element
  it('6. should handle array with one element correctly', () => {
    const array = [10];
    const result = array.orderBy(item => item);
    expect(result).toEqual([10]); // Single element array should return itself
  });

  // Test 7: Correctly sorts array with duplicates
  it('7. should correctly handle arrays with duplicate values', () => {
    const array = [5, 3, 5, 1, 4, 1];
    const result = array.orderBy(item => item);
    expect(result).toEqual([1, 1, 3, 4, 5, 5]); // Duplicates should be handled correctly
  });

  // Test 8: Sorting performance (large dataset)
  it('8. should sort large arrays within a reasonable time', () => {
    const largeArray = Array.from({ length: 100000 }, () => ({
      id: Math.floor(Math.random() * 100000),
    }));

    const start = performance.now();
    largeArray.orderBy(item => item.id);
    const end = performance.now();
    const averageTime = (end - start) / 10; // Adjust based on number of iterations
    expect(averageTime).toBeLessThan(100); // Ensure sorting completes within 100ms on average
  });

  // Test 9: Sorting by a computed property (e.g., length of a string)
  it('9. should sort by a computed property correctly', () => {
    const array = ['apple', 'banana', 'cherry', 'date'];
    const result = array.orderBy(item => item.length);
    expect(result).toEqual(['date', 'apple', 'banana', 'cherry']); // Sort by string length
  });

  // Test 10: Sorts by descending order when custom comparator is provided
  it('10. should allow sorting by descending order with custom selector', () => {
    const array = [5, 3, 8, 1, 4];
    const result = array.orderBy(item => item).reverse(); // Sort and reverse to get descending order
    expect(result).toEqual([8, 5, 4, 3, 1]); // Expect descending order
  });

  // Test 11: Sorts an array of boolean values (false < true)
  it('11. should sort boolean values correctly', () => {
    const array = [true, false, true, false];
    const result = array.orderBy(item => item);
    expect(result).toEqual([false, false, true, true]); // false should come before true
  });

  // Test 12: Sorts objects by multiple properties (primary by id, secondary by name)
  it('12. should sort by multiple properties correctly', () => {
    const array = [
      { id: 2, name: 'Charlie' },
      { id: 1, name: 'Bob' },
      { id: 3, name: 'Alice' },
      { id: 2, name: 'Charlie' }, // Duplicate id
    ];

    const result = array.orderBy(item => item.id).orderBy(item => item.name);
    expect(result).toEqual([
      { id: 3, name: 'Alice' },
      { id: 1, name: 'Bob' },
      { id: 2, name: 'Charlie' },
      { id: 2, name: 'Charlie' },
    ]);
  });

  // Test 13: Sorts array with null values correctly (null should be at the start)
  it('13. should sort array with null values correctly', () => {
    const array = [null, 3, 1, null, 4, 2];
    const result = array.orderBy(item => item);
    expect(result).toEqual([null, null, 1, 2, 3, 4]); // Null should come before numbers
  });

  // Test 14: Sorts array of dates chronologically
  it('14. should correctly sort dates chronologically', () => {
    const array = [new Date('2024-12-01'), new Date('2023-01-01'), new Date('2024-01-01')];
    const result = array.orderBy(item => item);
    expect(result).toEqual([
      new Date('2023-01-01'),
      new Date('2024-01-01'),
      new Date('2024-12-01'),
    ]); // Dates should be sorted in ascending order
  });

  // Test 15: Correctly sorts strings with different cases (case-insensitive)
  it('15. should sort strings case-insensitively when specified', () => {
    const array = ['banana', 'Apple', 'orange', 'Grape'];
    const result = array.orderBy(item => item.toLowerCase()); // Case-insensitive sorting
    expect(result).toEqual(['Apple', 'banana', 'Grape', 'orange']); // Alphabetical, case-insensitive
  });
});
