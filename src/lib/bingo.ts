/** Icebreaker prompts — same 24 on every card, shuffled per visit. */
export const PROMPTS = [
  "Has broken a bone",
  "Has been in a car accident",
  "Has a pet",
  "Speaks 3+ languages",
  "Is an international student",
  "Lives on campus",
  "Has pulled an all-nighter",
  "Plays a musical instrument",
  "Has a sibling",
  "Is left-handed",
  "Has changed majors",
  "Is in a student club",
  "Has a part-time job",
  "Has interned somewhere",
  "Drinks coffee every day",
  "Has a 9am class",
  "Was born in a different city",
  "Has a roommate",
  "Takes public transit",
  "Went to a concert this year",
  "Is a final-year student",
  "Has been to a hackathon",
  "Has won a competition",
  "Is on a scholarship",
] as const;

export const GRID_SIZE = 5;
export const CELL_COUNT = GRID_SIZE * GRID_SIZE;
export const CENTER_INDEX = 12;

export type Cell =
  | { kind: "free" }
  | { kind: "prompt"; text: string };

export function fisherYates<T>(items: readonly T[]): T[] {
  const next = items.slice();
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const a = next[i];
    const b = next[j];
    if (a === undefined || b === undefined) continue;
    next[i] = b;
    next[j] = a;
  }
  return next;
}

function fillGrid(prompts: readonly string[]): Cell[] {
  const cells: Cell[] = [];
  let cursor = 0;
  for (let i = 0; i < CELL_COUNT; i++) {
    if (i === CENTER_INDEX) {
      cells.push({ kind: "free" });
      continue;
    }
    const text = prompts[cursor] ?? "";
    cursor += 1;
    cells.push({ kind: "prompt", text });
  }
  return cells;
}

/** Stable order for SSR so the board is never blank. */
export function orderedCard(prompts: readonly string[] = PROMPTS): Cell[] {
  return fillGrid(prompts);
}

/** Fisher–Yates shuffle — unique arrangement on every visit. */
export function dealCard(prompts: readonly string[] = PROMPTS): Cell[] {
  return fillGrid(fisherYates(prompts));
}

export const BINGO_LINES: number[][] = [
  [0, 1, 2, 3, 4],
  [5, 6, 7, 8, 9],
  [10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19],
  [20, 21, 22, 23, 24],
  [0, 5, 10, 15, 20],
  [1, 6, 11, 16, 21],
  [2, 7, 12, 17, 22],
  [3, 8, 13, 18, 23],
  [4, 9, 14, 19, 24],
  [0, 6, 12, 18, 24],
  [4, 8, 12, 16, 20],
];

export function marksFromNames(names: string[]): boolean[] {
  return names.map((name, i) => i === CENTER_INDEX || name.trim().length > 0);
}

export function findBingoLines(marked: boolean[]): number[][] {
  return BINGO_LINES.filter((line) => line.every((i) => marked[i]));
}

export function emptyMarks(): boolean[] {
  const marked = Array.from({ length: CELL_COUNT }, () => false);
  marked[CENTER_INDEX] = true;
  return marked;
}

export function emptyNames(): string[] {
  return Array.from({ length: CELL_COUNT }, () => "");
}

export const SESSION_KEY = "dsa-bingo-session-v2";

export type SavedCard = {
  cells: Cell[];
  names: string[];
  seenBingos: number;
};

export function readSession(): SavedCard | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedCard;
    if (!Array.isArray(parsed.cells) || parsed.cells.length !== CELL_COUNT) return null;
    if (!Array.isArray(parsed.names) || parsed.names.length !== CELL_COUNT) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeSession(card: SavedCard) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(card));
}

export function clearSession() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(SESSION_KEY);
}
