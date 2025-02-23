import type { ReactElement, TimeHTMLAttributes } from "react";

export const MAX_SAFE_DATE = 8640000000000000;
export const MIN_SAFE_DATE = -8640000000000000;

export function toBoundedDate(timestamp: number): Date {
  return new Date(Math.max(MIN_SAFE_DATE, Math.min(timestamp, MAX_SAFE_DATE)));
}

export function Time({
  children,
  dateOnly = false,
  timestamp,
  ...otherProps
}: Readonly<
  {
    dateOnly?: boolean;
    timestamp: Readonly<number | Date>;
  } & Omit<TimeHTMLAttributes<HTMLElement>, "dateTime">
>): ReactElement {
  return (
    <time dateTime={getDateTime(timestamp, dateOnly)} {...otherProps}>
      {children}
    </time>
  );
}

const getDateTime = (timestamp: number | Date, dateOnly: boolean) => {
  const date =
    typeof timestamp === "number" ? toBoundedDate(timestamp) : timestamp;

  if (dateOnly) {
    return new Date(date).toLocaleDateString("en-CA"); // YYYY-MM-DD format
  } else {
    return new Date(date).toISOString();
  }
};
