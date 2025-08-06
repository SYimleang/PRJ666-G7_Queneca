"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { GameRewardCard } from "@/components/games/GameRewardCard";

const FOOD_EMOJIS = ["🍔", "🍕", "🍣", "🍟", "🍩", "🥗"];

type CardType = {
  id: number;
  emoji: string;
  matched: boolean;
  flipped: boolean;
};

export const MemoryMatchGame = () => {
  const [rewardCode, setRewardCode] = useState("");
  const [discount, setDiscount] = useState<number | null>(null);
  const [timestamp, setTimestamp] = useState("");
  const [cards, setCards] = useState<CardType[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedCount, setMatchedCount] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timer, setTimer] = useState(30);

  // Initialize cards
  useEffect(() => {
    const shuffled = shuffleArray([...FOOD_EMOJIS, ...FOOD_EMOJIS]).map(
      (emoji, i) => ({
        id: i,
        emoji,
        matched: false,
        flipped: false,
      }),
    );
    setCards(shuffled);
    setStartTime(Date.now());
  }, []);

  // Timer countdown
  useEffect(() => {
    if (gameOver) return;
    if (timer <= 0) {
      setGameOver(true);
      return;
    }
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer, gameOver]);

  useEffect(() => {
    // game won
    if (matchedCount === FOOD_EMOJIS.length) {
      const randDiscount = Math.floor(Math.random() * 11) + 5; // 5–15%
      const code = generateCode(6);
      const dateStr = new Date().toLocaleString();
      setDiscount(randDiscount);
      setRewardCode(code);
      setTimestamp(dateStr);
      setGameOver(true);
    }
  }, [matchedCount]);

  const generateCode = (length: number) => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    return Array.from(
      { length },
      () => chars[Math.floor(Math.random() * chars.length)],
    ).join("");
  };

  const shuffleArray = (arr: string[]) => {
    return arr
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
  };

  const handleFlip = (index: number) => {
    if (cards[index].flipped || flippedIndices.length === 2 || gameOver) return;

    const updated = [...cards];
    updated[index].flipped = true;
    setCards(updated);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      const [i1, i2] = newFlipped;
      if (cards[i1].emoji === cards[i2].emoji) {
        setTimeout(() => {
          const matched = [...cards];
          matched[i1].matched = matched[i2].matched = true;
          setCards(matched);
          setMatchedCount((prev) => prev + 1);
          setFlippedIndices([]);
        }, 500);
      } else {
        setTimeout(() => {
          const reset = [...cards];
          reset[i1].flipped = reset[i2].flipped = false;
          setCards(reset);
          setFlippedIndices([]);
        }, 1000);
      }
    }
  };

  const resetGame = () => {
    const shuffled = shuffleArray([...FOOD_EMOJIS, ...FOOD_EMOJIS]).map(
      (emoji, i) => ({
        id: i,
        emoji,
        matched: false,
        flipped: false,
      }),
    );
    setCards(shuffled);
    setFlippedIndices([]);
    setMatchedCount(0);
    setGameOver(false);
    setTimer(30);
    setStartTime(Date.now());
  };

  return (
    <div className="space-y-4">
      <div className="text-lg">⏱️ Time Left: {timer}s</div>

      <div className="grid grid-cols-4 gap-3">
        {cards.map((card, index) => (
          <Card
            key={card.id}
            onClick={() => handleFlip(index)}
            className={cn(
              "cursor-pointer flex items-center justify-center h-20 text-2xl font-bold transition-all",
              card.matched
                ? "bg-green-100 text-green-600"
                : card.flipped
                  ? "bg-yellow-100 text-yellow-600"
                  : "bg-gray-100 text-gray-200",
            )}
          >
            <CardContent className="flex items-center justify-center h-full w-full">
              {card.flipped || card.matched ? card.emoji : "❓"}
            </CardContent>
          </Card>
        ))}
      </div>

      {gameOver && (
        <div className="space-y-4 text-center">
          {matchedCount === FOOD_EMOJIS.length ? (
            <GameRewardCard
              discount={discount!}
              code={rewardCode}
              timestamp={timestamp}
            />
          ) : (
            <div className="text-xl font-semibold">
              ⏱️ Time&apos;s up! Try again?
            </div>
          )}
          <div className="flex justify-center">
            <Button onClick={resetGame}>🔁 Play Again</Button>
          </div>
        </div>
      )}
    </div>
  );
};
