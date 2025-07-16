"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GameRewardCard } from "@/components/games/GameRewardCard";
import Image from "next/image";

type Question = {
  imageUrl: string;
  options: string[];
  answer: string;
};

const QUESTIONS: Question[] = [
  {
    imageUrl: "/food/okonomiyaki.jpeg", // okonomiyaki
    options: ["Okonomiyaki", "Takoyaki", "Pajeon"],
    answer: "Okonomiyaki",
  },
  {
    imageUrl: "/food/shakshuka.png", // shakshuka
    options: ["Huevos Rancheros", "Shakshuka", "Ratatouille"],
    answer: "Shakshuka",
  },
  {
    imageUrl: "/food/bibimbap.jpeg", // bibimbap
    options: ["Bibimbap", "Chirashi Bowl", "Poke Bowl"],
    answer: "Bibimbap",
  },
  {
    imageUrl: "/food/arepas.jpeg", // arepas
    options: ["Arepas", "Gorditas", "Empanadas"],
    answer: "Arepas",
  },
  {
    imageUrl: "/food/moussaka.jpeg", // moussaka
    options: ["Lasagna", "Moussaka", "Shepherd's Pie"],
    answer: "Moussaka",
  },
];

export const GuessGame = () => {
  const [current, setCurrent] = useState(0);
  const [streak, setStreak] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [reward, setReward] = useState<{
    discount: number;
    code: string;
    timestamp: string;
  } | null>(null);

  const handleAnswer = (selected: string) => {
    const isCorrect = selected === QUESTIONS[current].answer;

    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);

      if (newStreak === 3) {
        const discount = Math.floor(Math.random() * 11) + 5;
        const code = generateCode(6);
        const timestamp = new Date().toLocaleString();
        setReward({ discount, code, timestamp });
        setGameOver(true);
        return;
      }
    } else {
      setStreak(0); // reset streak
    }

    // Next question
    const next = (current + 1) % QUESTIONS.length;
    setCurrent(next);
  };

  const generateCode = (length: number) => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    return Array.from(
      { length },
      () => chars[Math.floor(Math.random() * chars.length)],
    ).join("");
  };

  const resetGame = () => {
    setCurrent(0);
    setStreak(0);
    setGameOver(false);
    setReward(null);
  };

  if (gameOver && reward) {
    return (
      <div className="space-y-4 text-center">
        <GameRewardCard
          discount={reward.discount}
          code={reward.code}
          timestamp={reward.timestamp}
        />
        <div className="flex justify-center">
          <Button onClick={resetGame}>🔁 Play Again</Button>
        </div>{" "}
      </div>
    );
  }

  const question = QUESTIONS[current];

  return (
    <div className="space-y-4">
      <div className="text-lg">🔥 Streak: {streak}/3</div>
      <Card>
        <CardContent className="p-6 space-y-4 text-center">
          <Image
            src={question.imageUrl}
            alt="Guess the dish"
            width={300}
            height={200}
            className="w-full max-w-xs mx-auto rounded-lg shadow"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            {question.options.map((opt) => (
              <Button
                key={opt}
                variant="secondary"
                onClick={() => handleAnswer(opt)}
              >
                {opt}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
