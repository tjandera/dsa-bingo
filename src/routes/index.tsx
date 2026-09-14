import { createFileRoute } from "@tanstack/react-router";
import { BingoApp } from "@/components/bingo-card";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <BingoApp />;
}
