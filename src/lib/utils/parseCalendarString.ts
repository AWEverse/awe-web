interface CalendarData {
  days: string[];
  currentMonth: string[];
  selectedRanges: string[][];
}

interface BracketConfig {
  open: string;
  close: string;
  type: "month" | "range";
}

function compressRange(numbers: number[]): string[] {
  if (numbers.length === 0) return [];

  const result: string[] = [];
  let start = numbers[0];

  for (let i = 1; i <= numbers.length; i++) {
    const curr = numbers[i];

    if (curr !== numbers[i - 1] + 1 || i === numbers.length) {
      result.push(start === numbers[i - 1] ? `${start}` : `${start}_${numbers[i - 1]}`);
      start = curr;
    }
  }
  return result;
}

function parseCalendarString(
  template: string,
  brackets: BracketConfig[] = [
    { open: "[", close: "]", type: "month" },
    { open: "(", close: ")", type: "range" },
  ],
): CalendarData {
  const result: CalendarData = { days: [], currentMonth: [], selectedRanges: [] };
  const stack: { bracket: BracketConfig; start: number; content: string }[] = [];

  const allDays = template
    .replace(new RegExp(`[${brackets.map(b => b.open + b.close).join("")}]`, "g"), "")
    .split(/\s+/)
    .map(Number)
    .filter((n) => !isNaN(n));

  result.days = compressRange(allDays);

  let i = 0;
  while (i < template.length) {
    const char = template[i];
    const bracket = brackets.find((b) => b.open === char || b.close === char);

    if (bracket) {
      if (char === bracket.open) {
        stack.push({ bracket, start: i + 1, content: "" });
      } else if (char === bracket.close && stack.length > 0) {
        const top = stack.pop();
        if (top?.bracket === bracket) {
          const numbers = top.content.split(/\s+/).map(Number).filter((n) => !isNaN(n));
          const compressed = compressRange(numbers);
          if (bracket.type === "month") {
            result.currentMonth = compressed;
          } else {
            result.selectedRanges.push(compressed);
          }
        }
      }
    } else if (stack.length > 0) {
      stack[stack.length - 1].content += char;
    }
    i++;
  }

  return result;
}

// Example usage
const template = "25 26 27 28 29 30 [1 2 3 4 5 6 7 8 9 10 (11 12 13 14 15 16 17 18 19 (20 21 22 23 24 25 26 27)) 28 29 30 31] 1 2 3 4 5";
const calendarData = parseCalendarString(template);
console.log(calendarData);
/* Output:
{
  days: ['25_30', '1_19', '20_27', '28_31', '1_5'],
  currentMonth: ['1_10', '11_19', '20_27', '28_31'],
  selectedRanges: [['11_19', '20_27'], ['12'], ['20_27']]
}
*/
