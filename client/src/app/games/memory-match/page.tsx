// app/games/memory-match/page.tsx
import { MemoryMatchGame } from "@/components/games/MemoryMatchGame";

export default function MemoryMatchPage() {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">🧠 Food Memory Match</h1>
      <MemoryMatchGame />
    </div>
  );
}
