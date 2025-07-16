import { GuessGame } from "@/components/games/GuessGame";

export default function GuessGamePage() {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">🍽️ Guess the Dish</h1>
      <GuessGame />
    </div>
  );
}
