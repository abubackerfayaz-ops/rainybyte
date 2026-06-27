'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

type Unit = 'C' | 'F';

interface UnitContextType {
  unit: Unit;
  setUnit: (u: Unit) => void;
  convertTemp: (celsius: number) => string;
}

const UnitContext = createContext<UnitContextType>({
  unit: 'C',
  setUnit: () => {},
  convertTemp: (c: number) => `${Math.round(c)}°`,
});

export function UnitProvider({ children }: { children: React.ReactNode }) {
  const [unit, setUnit] = useState<Unit>('C');

  const convertTemp = useCallback((celsius: number): string => {
    if (unit === 'F') {
      return `${Math.round(celsius * 9 / 5 + 32)}°`;
    }
    return `${Math.round(celsius)}°`;
  }, [unit]);

  return (
    <UnitContext.Provider value={{ unit, setUnit, convertTemp }}>
      {children}
    </UnitContext.Provider>
  );
}

export const useUnit = () => useContext(UnitContext);
