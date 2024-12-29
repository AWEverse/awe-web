import pipe from '@/lib/core/public/misc/Pipe';

describe('pipe function', () => {
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
