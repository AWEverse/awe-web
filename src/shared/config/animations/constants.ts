export type DURATIONS_LEVELS = "none" | "fast" | "full"

export const DURATIONS_BY_LEVELS: Record<DURATIONS_LEVELS, number> = {
  "none": 0,
  "fast": 0.15,
  "full": 0.25,
}

export const DURATIONS_LEVELS_OPTIONS: DURATIONS_LEVELS[] = ["none", "fast", "full"]


