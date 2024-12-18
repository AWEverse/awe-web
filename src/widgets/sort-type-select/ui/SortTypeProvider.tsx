import React, { createContext, useContext, useState } from 'react';

interface SortTypeContextType {
  selectedValues: string[];
  setSelectedValues: React.Dispatch<React.SetStateAction<string[]>>;
}

const SortTypeContext = createContext<SortTypeContextType | undefined>(undefined);

export const useSortTypeContext = () => {
  const context = useContext(SortTypeContext);
  if (!context) {
    throw new Error('useSortTypeContext must be used within a SortTypeProvider');
  }
  return context;
};

interface SortTypeProviderProps {
  children: React.ReactNode;
}

export const SortTypeProvider: React.FC<SortTypeProviderProps> = ({ children }) => {
  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  return <SortTypeContext.Provider value={{ selectedValues, setSelectedValues }}>{children}</SortTypeContext.Provider>;
};
