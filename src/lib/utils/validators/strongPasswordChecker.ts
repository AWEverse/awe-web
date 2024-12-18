import { clamp } from '../math';

const commonPatterns = [/1234/, /abcd/, /password/i, /qwerty/i];
const criteria = [
  {
    regex: /[a-z]/,
    error: 'Password must contain at least one lowercase letter.',
    score: 2,
  },
  {
    regex: /[A-Z]/,
    error: 'Password must contain at least one uppercase letter.',
    score: 2,
  },
  {
    regex: /[0-9]/,
    error: 'Password must contain at least one digit.',
    score: 2,
  },
  {
    regex: /[\W_]/,
    error: 'Password must contain at least one special character.',
    score: 2,
  },
];

export const MIN_PASSWORD_LENGTH = 10;
export const MAX_PASSWORD_LENGTH = 20;

interface PasswordStrengthResult {
  changesNeeded: number;
  errors: string[];
  strengthScore: number;
}

export function strongPasswordChecker(
  pw: string,
  minLength: number = MIN_PASSWORD_LENGTH,
  maxLength: number = MAX_PASSWORD_LENGTH,
  maxRepeat: number = 2,
): PasswordStrengthResult {
  const errors: string[] = [];
  let changesNeeded = 0;
  let strengthScore = 0;

  if (pw.length < minLength) {
    errors.push(`Password is too short. Minimum length is ${minLength}.`);
    changesNeeded += minLength - pw.length;
  } else if (pw.length > maxLength) {
    errors.push(`Password is too long. Maximum length is ${maxLength}.`);
    changesNeeded += pw.length - maxLength;
  } else {
    strengthScore += 2;
  }

  criteria.forEach(({ regex, error, score }) => {
    if (!regex.test(pw)) {
      errors.push(error);
      changesNeeded++;
    } else {
      strengthScore += score;
    }
  });

  const repeats = pw.match(/(.)\1{2,}/g) || [];

  const excessRepeats = repeats.reduce((count, match) => count + Math.floor(match.length / (maxRepeat + 1)), 0);

  if (excessRepeats > 0) {
    errors.push('Password contains too many consecutive repeated characters.');
    changesNeeded += excessRepeats;
  }

  commonPatterns.forEach(pattern => {
    if (pattern.test(pw)) {
      errors.push('Password contains common patterns that are easy to guess.');
      changesNeeded++;
      strengthScore -= 3;
    }
  });

  strengthScore = clamp(strengthScore, 0, 10);

  return {
    changesNeeded: Math.max(changesNeeded, minLength - pw.length),
    errors,
    strengthScore,
  };
}

// Example usage
// const password = "Pa$$w0rd1234!!!";
// const result = strongPasswordChecker(password);
// console.log("Changes needed:", result.changesNeeded);
// console.log("Errors:", result.errors);
// console.log("Strength score:", result.strengthScore);
