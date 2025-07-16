"use client";
// context/GameContext.tsx
import React, { createContext, useState, useContext } from "react";

type GameContextType = {
  triggerGame: () => void;
  gameTriggered: boolean;
  resetGame: () => void;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
  const [gameTriggered, setGameTriggered] = useState(false);

  const triggerGame = () => setGameTriggered(true);
  const resetGame = () => setGameTriggered(false);

  return (
    <GameContext.Provider value={{ triggerGame, gameTriggered, resetGame }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context)
    throw new Error("useGameContext must be used within a GameProvider");
  return context;
};
