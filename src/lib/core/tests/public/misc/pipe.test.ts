import { pipe, pipeWithEffect } from '@/lib/core/public/misc/Pipe';

describe('1) pipe function', () => {
  test('should add one to number, convert to string and get length', () => {
    const addOne = (x: number): number => x + 1;
    const toString = (x: number): string => x.toString();
    const stringLength = (x: string): number => x.length;

    const processNumber = pipe(addOne, toString, stringLength);

    // Type check: the input is number and output is number
    const result = processNumber(1234);
    expect(result).toBe(4); // "1235".length = 4
    // Ensure the result is a number
    expect(typeof result).toBe('number');
  });

  test('should get user name and convert to uppercase', () => {
    const getUser = (id: number): { id: number; name: string; age: number } => ({
      id,
      name: 'Andriy',
      age: 20,
    });
    const getName = (user: { id: number; name: string; age: number }): string => user.name;
    const toUpperCase = (str: string): string => str.toUpperCase();

    const processUser = pipe(getUser, getName, toUpperCase);

    // Type check: the input is number and output is string
    const result = processUser(1);
    expect(result).toBe('ANDRIY');
    // Ensure the result is a string
    expect(typeof result).toBe('string');
  });

  test('should filter even numbers, sort descending and sum them', () => {
    const filterEven = (arr: number[]): number[] => arr.filter(x => x % 2 === 0);
    const sortDescending = (arr: number[]): number[] => arr.sort((a, b) => b - a);
    const sumArray = (arr: number[]): number => arr.reduce((acc, x) => acc + x, 0);

    const processArray = pipe(filterEven, sortDescending, sumArray);

    // Type check: the input is number[] and output is number
    const result = processArray([1, 2, 3, 4, 5, 6]);
    expect(result).toBe(12); // [2, 4, 6] -> sum = 12
    // Ensure the result is a number
    expect(typeof result).toBe('number');
  });

  test('should parse JSON, add property and stringify it back', () => {
    const parseJSON = (str: string): { [key: string]: any } => JSON.parse(str);
    const addProperty = (obj: { [key: string]: any }): { [key: string]: any } => ({
      ...obj,
      added: true,
    });
    const stringify = (obj: { [key: string]: any }): string => JSON.stringify(obj);

    const processJSON = pipe(parseJSON, addProperty, stringify);

    // Type check: the input is string and output is string
    const result = processJSON('{"name": "AWE"}');
    expect(result).toBe('{"name":"AWE","added":true}');
    // Ensure the result is a string
    expect(typeof result).toBe('string');
  });

  test('should split string, remove duplicates and join with dash', () => {
    const splitByComma = (str: string): string[] => str.split(',');
    const removeDuplicates = (arr: string[]): string[] => Array.from(new Set(arr));
    const joinWithDash = (arr: string[]): string => arr.join('-');

    const processString = pipe(splitByComma, removeDuplicates, joinWithDash);

    // Type check: the input is string and output is string
    const result = processString('apple,banana,apple,orange');
    expect(result).toBe('apple-banana-orange');
    // Ensure the result is a string
    expect(typeof result).toBe('string');
  });

  test('should square, halve and format the result', () => {
    const square = (x: number): number => x * x;
    const half = (x: number): number => x / 2;
    const formatResult = (x: number): string => `The result is ${x}`;

    const processCalculation = pipe(square, half, formatResult);

    // Type check: the input is number and output is string
    const result = processCalculation(8);
    expect(result).toBe('The result is 32');
    // Ensure the result is a string
    expect(typeof result).toBe('string');
  });
});

describe('pipeWithEffect', () => {
  it('should apply functions in the pipeline sequentially with the effect (string effect)', () => {
    // Mock functions for the pipeline
    const mockFn1 = jest.fn((x: number, effect: string) => x + effect.length); // adds effect length
    const mockFn2 = jest.fn((x: number) => x * 2); // multiplies by 2
    const mockFn3 = jest.fn((x: number) => x - 1); // subtracts 1

    // Create the pipeline with mock functions
    const pipeline = pipeWithEffect(mockFn1, mockFn2, mockFn3);

    const initialValue = 5;
    const effect = 'test'; // length = 4

    const result = pipeline(initialValue, effect);

    // Test the mock function calls
    expect(mockFn1).toHaveBeenCalledWith(initialValue, effect);
    expect(mockFn2).toHaveBeenCalledWith(mockFn1.mock.results[0].value, effect);
    expect(mockFn3).toHaveBeenCalledWith(mockFn2.mock.results[0].value, effect);

    // Verify the final result
    expect(result).toBe(17); // 5 + 4 (length of 'test') = 9 * 2 = 18 - 1 = 17
  });

  it('should apply functions in the pipeline sequentially with a numeric effect', () => {
    // Mock functions for the pipeline
    const mockFn1 = jest.fn((x: number, effect: number) => x + effect); // adds effect
    const mockFn2 = jest.fn((x: number, effect: number) => x * effect); // multiplies by effect
    const mockFn3 = jest.fn((x: number, effect: number) => x - effect); // subtracts effect

    // Create the pipeline with mock functions
    const pipeline = pipeWithEffect(mockFn1, mockFn2, mockFn3);

    const initialValue = 5;
    const effect = 3;

    const result = pipeline(initialValue, effect);

    // Test the mock function calls
    expect(mockFn1).toHaveBeenCalledWith(initialValue, effect);
    expect(mockFn2).toHaveBeenCalledWith(mockFn1.mock.results[0].value, effect);
    expect(mockFn3).toHaveBeenCalledWith(mockFn2.mock.results[0].value, effect);

    // Verify the final result
    expect(result).toBe(21); // 5 + 3 = 8 * 3 = 24 - 3 = 21
  });

  it('should apply functions in the pipeline sequentially with an object effect', () => {
    // Mock functions for the pipeline
    const mockFn1 = jest.fn((x: number, effect: { value: number }) => x + effect.value); // adds effect.value
    const mockFn2 = jest.fn((x: number, effect: { value: number }) => x * effect.value); // multiplies by effect.value
    const mockFn3 = jest.fn((x: number, effect: { value: number }) => x - effect.value); // subtracts effect.value

    // Create the pipeline with mock functions
    const pipeline = pipeWithEffect(mockFn1, mockFn2, mockFn3);

    const initialValue = 5;
    const effect = { value: 4 };

    const result = pipeline(initialValue, effect);

    // Test the mock function calls
    expect(mockFn1).toHaveBeenCalledWith(initialValue, effect);
    expect(mockFn2).toHaveBeenCalledWith(mockFn1.mock.results[0].value, effect);
    expect(mockFn3).toHaveBeenCalledWith(mockFn2.mock.results[0].value, effect);

    // Verify the final result
    expect(result).toBe(32); // 5 + 4 = 9 * 4 = 36 - 4 = 32
  });

  it('should handle empty functions in the pipeline', () => {
    // Empty functions pipeline
    const pipeline = pipeWithEffect();

    const initialValue = 5;
    const effect = 'test';

    // Apply the pipeline
    const result = pipeline(initialValue, effect);

    // No functions, so the result should be the initial value
    expect(result).toBe(initialValue);
  });

  it('should handle no effect parameter', () => {
    const mockFn1 = jest.fn((x: number) => x + 1);

    // Create pipeline with mock function
    const pipeline = pipeWithEffect(mockFn1);

    const initialValue = 5;

    // Apply the pipeline with no effect
    const result = pipeline(initialValue, undefined);

    // Test that the function was called with the effect as undefined
    expect(mockFn1).toHaveBeenCalledWith(initialValue, undefined);

    // Result should be initial value + 1
    expect(result).toBe(6);
  });

  it('should handle effect with different values (mixed types)', () => {
    const mockFn1 = jest.fn(
      (x: number, effect: { value?: number } | number) =>
        x + (typeof effect === 'number' ? effect : (effect.value ?? 0)),
    );

    // Create pipeline with mock function
    const pipeline = pipeWithEffect(mockFn1);

    const initialValue = 5;

    // Apply the pipeline with different effects
    const result1 = pipeline(initialValue, 10); // numeric effect
    const result2 = pipeline(initialValue, { value: 3 }); // object effect with .value

    // Test results
    expect(result1).toBe(15); // 5 + 10
    expect(result2).toBe(8); // 5 + 3
  });
});
