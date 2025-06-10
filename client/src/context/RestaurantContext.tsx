// context/RestaurantContext.tsx
'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { IRestaurant } from '../types/restaurant';

interface RestaurantContextType {
  restaurant: IRestaurant | null;
  setRestaurant: (restaurant: IRestaurant) => void;
  clearRestaurant: () => void;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(
  undefined
);

export const RestaurantProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [restaurant, setRestaurantState] = useState<IRestaurant | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('restaurant');
    if (stored) {
      setRestaurantState(JSON.parse(stored));
    }
  }, []);

  const setRestaurant = (restaurant: IRestaurant) => {
    setRestaurantState(restaurant);
    localStorage.setItem('restaurant', JSON.stringify(restaurant));
  };

  const clearRestaurant = () => {
    setRestaurantState(null);
    localStorage.removeItem('restaurant');
  };

  return (
    <RestaurantContext.Provider
      value={{ restaurant, setRestaurant, clearRestaurant }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
};
