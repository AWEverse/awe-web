import { createContext } from 'react';

interface TransitionGroupContextType {
  isMounting: boolean;
}

export default createContext<TransitionGroupContextType | null>(null);
