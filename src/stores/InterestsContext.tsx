import { createContext, useContext, type ReactNode } from 'react';
import type { Interest } from '../models/types';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface InterestsContextValue {
  interests: Interest[];
  hasOnboarded: boolean;
  addInterest: (interest: Interest) => void;
  removeInterest: (id: string) => void;
  setOnboarded: (value: boolean) => void;
}

const InterestsContext = createContext<InterestsContextValue | null>(null);

export function InterestsProvider({ children }: { children: ReactNode }) {
  const [interests, setInterests] = useLocalStorage<Interest[]>('psc.interests', []);
  const [hasOnboarded, setHasOnboarded] = useLocalStorage<boolean>('psc.onboarded', false);

  const addInterest = (interest: Interest) => {
    setInterests((prev) => (prev.some((i) => i.id === interest.id) ? prev : [...prev, interest]));
  };

  const removeInterest = (id: string) => {
    setInterests((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <InterestsContext.Provider
      value={{ interests, hasOnboarded, addInterest, removeInterest, setOnboarded: setHasOnboarded }}
    >
      {children}
    </InterestsContext.Provider>
  );
}

export function useInterests() {
  const ctx = useContext(InterestsContext);
  if (!ctx) throw new Error('useInterests must be used within InterestsProvider');
  return ctx;
}
