export const capitalize = (s: string) => {
  if (!s) return '';
  const [first, ...rest] = s;
  return first.toUpperCase() + rest.join('');
};

export const toCamelCase = (s: string) => s.toLowerCase().replace(/[-_ ]+(\w)/g, (_, char) => char.toUpperCase());

const transformString = (s: string, separator: string) => {
  let result = '';
  let wasSeparatorAdded = false;

  for (let i = 0; i < s.length; i++) {
    const char = s[i];

    if (/[A-Z]/.test(char)) {
      if (i > 0 && !wasSeparatorAdded) {
        result += separator;
        wasSeparatorAdded = true;
      }
      result += char.toLowerCase();
    } else if (/[-\s]/.test(char)) {
      if (!wasSeparatorAdded) {
        result += separator;
        wasSeparatorAdded = true;
      }
    } else {
      result += char;
      wasSeparatorAdded = false;
    }
  }

  if (result.endsWith(separator)) {
    result = result.slice(0, -1);
  }

  return result;
};

export const toSnakeCase = (s: string) => transformString(s, '_');
export const toKebabCase = (s: string) => transformString(s, '-');

export const truncate = (s: string, maxLength: number) => (s.length > maxLength ? s.slice(0, maxLength) + '...' : s);

export const removeSpaces = (s: string) => s.replace(/\s+/g, '');

export const reverseString = (s: string) => s.split('').reverse().join('');

export const isPalindrome = (s: string) => {
  const cleaned = s.replace(/[\W_]/g, '').toLowerCase();
  let left = 0;
  let right = cleaned.length - 1;

  while (left < right) {
    if (cleaned[left] !== cleaned[right]) {
      return false;
    }
    left++;
    right--;
  }

  return true;
};

export const repeatString = (s: string, times: number) => s.repeat(times);

export const removeNonAlphanumeric = (s: string) => s.replace(/[^a-zA-Z0-9]/g, '');
