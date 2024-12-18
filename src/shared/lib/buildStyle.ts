import { CSSProperties } from 'react';

type CSSProperty = keyof CSSProperties;
type Part = string | false | undefined;
type CSSValue = string | number;

function getParsedValue(value: string): string | number {
  if (/^\d+(\.\d+)?(px|em|rem|%)?$/.test(value)) {
    const numericValue = parseFloat(value);
    const unit = value.match(/[a-z%]+$/i)?.[0] || '';
    return unit ? `${numericValue}${unit}` : numericValue;
  }

  return value;
}

// I think its needed to be cached for example instead of calculating every rended three sames styles at once
function parsePart(part: string): { property: CSSProperty; value: CSSValue } | undefined {
  const trimmedPart = part.trim().replace(/;$/, '');
  const importantFlag = trimmedPart.includes('!important');

  const cleanedPart = importantFlag ? trimmedPart.replace('!important', '').trim() : trimmedPart;

  const [property, ...valueParts] = cleanedPart.split(':');
  const value = valueParts.join(':').trim();

  if (property && value) {
    const parsedValue = getParsedValue(value);

    return {
      property: property as CSSProperty,
      value: `${parsedValue} ${importantFlag ? '!important' : ''}`,
    };
  }
  return undefined;
}

export default function buildStyle(...parts: Part[]): CSSProperties {
  const styleObject: Record<string, CSSValue> = {};

  for (const part of parts) {
    if (typeof part === 'string') {
      const result = parsePart(part);

      if (result) {
        styleObject[result.property] = result.value;
      }
    }
  }

  return styleObject;
}
