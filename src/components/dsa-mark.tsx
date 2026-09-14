import { cn } from "@/lib/utils";

/** Crisp recreation of the DSA network mark for the free square. */
export function DsaMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={cn("overflow-visible", className)}
      aria-hidden="true"
      fill="none"
    >
      <g strokeWidth="1.6" strokeLinecap="round">
        <line x1="24" y1="46" x2="54" y2="18" stroke="var(--color-node-red)" />
        <line x1="54" y1="18" x2="100" y2="40" stroke="var(--color-node-cyan)" />
        <line x1="54" y1="18" x2="56" y2="102" stroke="var(--color-node-slate)" />
        <line x1="24" y1="46" x2="56" y2="102" stroke="var(--color-node-red)" />
        <line x1="24" y1="46" x2="32" y2="88" stroke="var(--color-node-silver)" />
        <line x1="32" y1="88" x2="56" y2="102" stroke="var(--color-node-silver)" />
        <line x1="56" y1="102" x2="94" y2="78" stroke="var(--color-gold)" />
        <line x1="100" y1="40" x2="94" y2="78" stroke="var(--color-node-green)" />
        <line x1="54" y1="18" x2="94" y2="78" stroke="var(--color-node-cyan)" />
      </g>
      <g strokeWidth="2.35">
        <circle cx="24" cy="46" r="10" stroke="var(--color-node-red)" />
        <circle cx="54" cy="18" r="10" stroke="var(--color-node-cyan)" />
        <circle cx="100" cy="40" r="10" stroke="var(--color-node-blue)" />
        <circle cx="32" cy="88" r="10" stroke="var(--color-node-silver)" />
        <circle cx="56" cy="102" r="10" stroke="var(--color-gold)" />
        <circle cx="94" cy="78" r="10" stroke="var(--color-node-green)" />
      </g>
    </svg>
  );
}
