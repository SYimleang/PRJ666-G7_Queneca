"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { GameRewardCard } from "./GameRewardCard";

const rewards = [
  { label: "5% OFF", value: 5 },
  { label: "6% OFF", value: 6 },
  { label: "10% OFF", value: 10 },
  { label: "7% OFF", value: 7 },
  { label: "9% OFF", value: 9 },
  { label: "4% OFF", value: 4 },
  { label: "8% OFF", value: 8 },
  { label: "12% OFF", value: 12 },
];

const generateCode = (length: number) => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(
    { length },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");
};

export const SpinWheel = () => {
  const [spinning, setSpinning] = useState(false);
  const [resultIndex, setResultIndex] = useState<number | null>(null);
  const [reward, setReward] = useState<{
    discount: number;
    code: string;
    timestamp: string;
  } | null>(null);
  const wheelRef = useRef<HTMLDivElement | null>(null);

  const spin = () => {
    if (spinning) return;

    const index = Math.floor(Math.random() * rewards.length);
    setResultIndex(index);

    const degreePerSegment = 360 / rewards.length;
    const randomTurns = 5 + Math.floor(Math.random() * 3); // 5 to 7 full spins
    const finalDegree =
      randomTurns * 360 + (index * degreePerSegment + degreePerSegment / 2);

    if (wheelRef.current) {
      wheelRef.current.style.transition =
        "transform 4s cubic-bezier(0.33, 1, 0.68, 1)";
      wheelRef.current.style.transform = `rotate(${finalDegree}deg)`;
    }

    setSpinning(true);

    setTimeout(() => {
      const rewardData = rewards[index];
      if (rewardData.value > 0) {
        const code = generateCode(6);
        const timestamp = new Date().toLocaleString();
        setReward({ discount: rewardData.value, code, timestamp });
      }
      setSpinning(false);
    }, 4200);
  };

  const reset = () => {
    setResultIndex(null);
    setReward(null);
    if (wheelRef.current) {
      wheelRef.current.style.transition = "none";
      wheelRef.current.style.transform = "rotate(0deg)";
    }
  };

  return (
    <div className="space-y-4 text-center">
      <div className="relative w-64 h-64 mx-auto">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-10 text-2xl">
          🔽
        </div>
        <div
          ref={wheelRef}
          className="rounded-full border-4 border-gray-300 w-full h-full flex items-center justify-center"
          style={{
            background: `conic-gradient(
              #f87171 0deg 45deg,
              #fde68a 45deg 90deg,
              #34d399 90deg 135deg,
              #c084fc 135deg 180deg,
              #f87171 180deg 225deg,
              #fde68a 225deg 270deg,
              #34d399 270deg 315deg,
              #c084fc 315deg 360deg
            )`,
          }}
        />
      </div>

      {reward ? (
        <>
          <GameRewardCard
            discount={reward.discount}
            code={reward.code}
            timestamp={reward.timestamp}
          />
          <Button onClick={reset}>🔁 Spin Again</Button>
        </>
      ) : (
        <Button disabled={spinning} onClick={spin}>
          🎡 {spinning ? "Spinning..." : "Spin the Wheel"}
        </Button>
      )}

      {resultIndex !== null &&
        rewards[resultIndex].value === 0 &&
        !reward &&
        !spinning && (
          <div className="text-lg font-semibold text-red-600">
            🙁 Try again!
          </div>
        )}
    </div>
  );
};
