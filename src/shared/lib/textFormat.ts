export function formatInteger(value: number) {
  return String(value).replace(/\d(?=(\d{3})+$)/g, '$& ');
}

function formatFixedNumber(number: number) {
  const fixed = String(number.toFixed(1));
  if (fixed.substr(-2) === '.0') {
    return Math.floor(number);
  }

  return number.toFixed(1).replace('.', ',');
}

export function formatIntegerCompact(views: number) {
  if (views < 1e3) {
    return views.toString();
  }

  if (views < 1e6) {
    return `${formatFixedNumber(views / 1e3)}K`;
  }

  return `${formatFixedNumber(views / 1e6)}M`;
}

[
  '•----',
  '=====', // meant three same lines
  '=====',
  '=====',
  '=====',
];
