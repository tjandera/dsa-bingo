import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Shuffle } from "lucide-react";
import { DsaMark } from "@/components/dsa-mark";
import { Button } from "@/components/ui/button";
import {
  CENTER_INDEX,
  clearSession,
  dealCard,
  emptyNames,
  findBingoLines,
  marksFromNames,
  orderedCard,
  readSession,
  writeSession,
  type Cell,
} from "@/lib/bingo";
import { cn } from "@/lib/utils";

const CONFETTI = [
  { left: "8%", delay: "0ms", drift: "-18px" },
  { left: "18%", delay: "40ms", drift: "22px" },
  { left: "28%", delay: "90ms", drift: "-8px" },
  { left: "40%", delay: "20ms", drift: "16px" },
  { left: "52%", delay: "70ms", drift: "-24px" },
  { left: "64%", delay: "30ms", drift: "10px" },
  { left: "74%", delay: "110ms", drift: "-14px" },
  { left: "86%", delay: "50ms", drift: "20px" },
  { left: "14%", delay: "130ms", drift: "8px" },
  { left: "46%", delay: "160ms", drift: "-12px" },
  { left: "68%", delay: "80ms", drift: "18px" },
  { left: "92%", delay: "100ms", drift: "-20px" },
];

const NAME_MAX = 28;

export function BingoApp() {
  const [cells, setCells] = useState<Cell[]>(() => orderedCard());
  const [names, setNames] = useState<string[]>(emptyNames);
  const [dealKey, setDealKey] = useState(0);
  const [showWin, setShowWin] = useState(false);
  const [seenBingos, setSeenBingos] = useState(0);
  const [editing, setEditing] = useState<number | null>(null);
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    if (dealKey === 0) {
      const saved = readSession();
      if (saved) {
        setCells(saved.cells);
        setNames(saved.names);
        setSeenBingos(saved.seenBingos ?? 0);
        setReady(true);
        return;
      }
    }
    setCells(dealCard());
    setNames(emptyNames());
    setSeenBingos(0);
    setReady(true);
  }, [dealKey]);

  useEffect(() => {
    if (!ready) return;
    writeSession({ cells, names, seenBingos });
  }, [cells, names, seenBingos, ready]);

  const marked = useMemo(() => marksFromNames(names), [names]);
  const lines = useMemo(() => findBingoLines(marked), [marked]);
  const lineIndex = useMemo(() => {
    const set = new Set<number>();
    for (const line of lines) {
      for (const i of line) set.add(i);
    }
    return set;
  }, [lines]);

  const markedCount = marked.filter(Boolean).length - 1;
  const isBlackout = marked.every(Boolean);

  function dealNewCard() {
    clearSession();
    setDealKey((k) => k + 1);
    setShowWin(false);
    setSeenBingos(0);
    setEditing(null);
  }

  function saveName(index: number, raw: string) {
    const name = raw.trim().slice(0, NAME_MAX);
    if (!name) return;
    const next = names.map((value, i) => (i === index ? name : value));
    const nextLines = findBingoLines(marksFromNames(next));
    setNames(next);
    setEditing(null);
    if (nextLines.length > seenBingos) {
      setSeenBingos(nextLines.length);
      setShowWin(true);
    } else if (nextLines.length < seenBingos) {
      setSeenBingos(nextLines.length);
    }
  }

  function clearName(index: number) {
    const next = names.map((value, i) => (i === index ? "" : value));
    const nextLines = findBingoLines(marksFromNames(next));
    setNames(next);
    setEditing(null);
    setSeenBingos(nextLines.length);
  }

  const editingCell = editing !== null ? cells[editing] : null;
  const editingPrompt = editingCell?.kind === "prompt" ? editingCell.text : "";

  return (
    <main className="bingo-shell flex min-h-dvh items-start justify-center sm:items-center">
      <section
        className="bingo-card stagger-in relative w-full max-w-sm overflow-hidden rounded-card px-3 pb-4 pt-4 sm:px-5 sm:pb-6 sm:pt-6"
        aria-label="DSA bingo card"
      >
        <header className="mb-3 flex flex-col items-center text-center sm:mb-4">
          <img
            src="/dsa-logo.png"
            alt="DSA Society"
            width={252}
            height={114}
            className="h-auto w-[9.25rem] sm:w-[13rem]"
          />
          <h1 className="mt-2 font-display text-xl font-semibold tracking-title text-gold sm:mt-3 sm:text-2xl">
            DSA Bingo Card
          </h1>
          <p className="mt-1 max-w-[18rem] font-sans text-[11px] leading-snug text-muted sm:mt-1.5 sm:max-w-xs sm:text-xs sm:leading-relaxed">
            Tap a square, write the student’s name, and it’s crossed. Five in a
            row wins.
          </p>
        </header>

        <div className="bingo-grid" role="grid" aria-label="Bingo board">
          {cells.map((cell, index) => {
            const isFree = cell.kind === "free";
            const person = names[index] ?? "";
            const isMarked = marked[index] ?? false;
            const onLine = lineIndex.has(index);
            const label =
              cell.kind === "free"
                ? "Free space, DSA logo"
                : person
                  ? `${cell.text}, ${person}`
                  : cell.text;

            if (isFree) {
              return (
                <div
                  key={`free-${dealKey}`}
                  role="gridcell"
                  aria-label={label}
                  data-free="true"
                  data-marked="true"
                  data-line={onLine ? "true" : "false"}
                  className="bingo-cell flex items-center justify-center p-1"
                >
                  <DsaMark className="size-9 sm:size-12" />
                  <span className="sr-only">Free</span>
                </div>
              );
            }

            return (
              <button
                key={`${dealKey}-${index}-${cell.text}`}
                type="button"
                role="gridcell"
                aria-pressed={isMarked}
                aria-label={label}
                data-marked={isMarked ? "true" : "false"}
                data-line={onLine ? "true" : "false"}
                onClick={() => setEditing(index)}
                className={cn(
                  "bingo-cell relative flex min-w-0 items-center justify-center px-0.5 py-0.5 text-center font-sans text-cell font-medium sm:px-1 sm:py-1",
                  "touch-manipulation select-none whitespace-normal",
                )}
              >
                {isMarked ? <span className="cell-cross" aria-hidden="true" /> : null}
                <span className="relative flex min-w-0 w-full flex-col items-center justify-center gap-0.5">
                  <span
                    className={cn(
                      "min-w-0 w-full text-balance leading-snug",
                      isMarked && "text-prompt text-cream/55",
                    )}
                  >
                    {cell.text}
                  </span>
                  {person ? (
                    <span className="min-w-0 w-full truncate text-name font-semibold text-gold">
                      {person}
                    </span>
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>

        <footer className="mt-3 flex items-center justify-between gap-3 sm:mt-4">
          <p className="font-sans text-[11px] tabular-nums text-muted sm:text-xs">
            <span className="text-cream">{markedCount}</span>
            <span> / 24 marked</span>
            {lines.length > 0 ? (
              <span className="text-gold">
                {" "}
                · {lines.length} bingo{lines.length === 1 ? "" : "s"}
              </span>
            ) : null}
          </p>
          <Button type="button" variant="outline" size="sm" onClick={dealNewCard}>
            <Shuffle className="size-3.5" aria-hidden="true" />
            New card
          </Button>
        </footer>

        {editing !== null && editingPrompt ? (
          <NameDialog
            prompt={editingPrompt}
            initialName={names[editing] ?? ""}
            onSave={(value) => saveName(editing, value)}
            onClear={() => clearName(editing)}
            onCancel={() => setEditing(null)}
          />
        ) : null}

        {showWin ? (
          <WinOverlay
            blackout={isBlackout}
            count={lines.length}
            onDismiss={() => setShowWin(false)}
          />
        ) : null}
      </section>
    </main>
  );
}

function NameDialog({
  prompt,
  initialName,
  onSave,
  onClear,
  onCancel,
}: {
  prompt: string;
  initialName: string;
  onSave: (name: string) => void;
  onClear: () => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(initialName);
  const inputRef = useRef<HTMLInputElement>(null);
  const filled = initialName.trim().length > 0;

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-30 flex items-end justify-center bg-navy/80 sm:items-center sm:px-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="name-dialog-title"
    >
      <form
        className="name-sheet win-overlay win-panel px-5 pb-5 pt-4 sm:rounded-lg sm:py-6"
        onSubmit={(event) => {
          event.preventDefault();
          onSave(value);
        }}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-gold/35 sm:hidden" aria-hidden="true" />
        <p className="font-sans text-kicker font-medium uppercase tracking-card text-gold">
          Who matches?
        </p>
        <h2
          id="name-dialog-title"
          className="mt-2 font-display text-xl font-semibold leading-snug text-cream"
        >
          {prompt}
        </h2>
        <label className="mt-4 block">
          <span className="sr-only">Student name</span>
          <input
            ref={inputRef}
            className="name-field"
            value={value}
            maxLength={NAME_MAX}
            autoComplete="off"
            autoCapitalize="words"
            enterKeyHint="done"
            inputMode="text"
            placeholder="Type their name"
            onChange={(event) => setValue(event.target.value)}
          />
        </label>
        <div className="mt-4 flex flex-col gap-2">
          <Button type="submit" className="h-12 w-full" disabled={!value.trim()}>
            {filled ? "Update name" : "Save and cross"}
          </Button>
          <div className="flex gap-2">
            {filled ? (
              <Button type="button" variant="outline" className="h-12 flex-1" onClick={onClear}>
                Clear square
              </Button>
            ) : null}
            <Button
              type="button"
              variant={filled ? "ghost" : "outline"}
              className="h-12 flex-1"
              onClick={onCancel}
            >
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

function WinOverlay({
  blackout,
  count,
  onDismiss,
}: {
  blackout: boolean;
  count: number;
  onDismiss: () => void;
}) {
  const title = blackout ? "Blackout" : "Bingo";
  const detail = blackout
    ? "Every square is marked. Legendary."
    : count === 1
      ? "Five in a row. Keep mingling for more."
      : `${count} lines complete. Keep going.`;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-navy/80 px-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bingo-win-title"
    >
      <div className="win-overlay win-panel relative w-full max-w-sm overflow-hidden rounded-lg px-6 py-8 text-center">
        {CONFETTI.map((bit, i) => (
          <span
            key={i}
            className="confetti-bit"
            style={{
              left: bit.left,
              animationDelay: bit.delay,
              ["--drift" as string]: bit.drift,
              background: i % 3 === 0 ? "var(--color-gold-bright)" : "var(--color-gold)",
            }}
          />
        ))}
        <p className="font-sans text-kicker font-medium uppercase tracking-card text-gold">
          DSA Society
        </p>
        <h2
          id="bingo-win-title"
          className="mt-2 font-display text-5xl font-semibold tracking-title text-gold"
        >
          {title}
        </h2>
        <p className="mt-3 font-sans text-sm leading-relaxed text-cream/80">{detail}</p>
        <Button type="button" className="mt-6 w-full" onClick={onDismiss}>
          Keep playing
        </Button>
      </div>
    </div>
  );
}
