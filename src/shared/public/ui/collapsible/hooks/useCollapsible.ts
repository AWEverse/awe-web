import { createContext, useContext } from 'react';

interface CollapsibleContextType {
  isOpen: boolean;
  toggleCollapse: () => void;
}

const CollapsibleContext = createContext<CollapsibleContextType | undefined>({
  isOpen: false,
  toggleCollapse: () => {},
});

function useCollapsible() {
  const context = useContext(CollapsibleContext);

  if (!context) {
    throw new Error('useCollapsible must be used within a CollapsibleProvider');
  }

  return context;
}

export { useCollapsible, CollapsibleContext };
