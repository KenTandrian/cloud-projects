"use client";

import { useVisitorId } from "@/hooks/use-visitor-id";
import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useState,
} from "react";

type VisitorIdContextType = {
  visitorId: string;
  setVisitorId: Dispatch<SetStateAction<string>>;
};

export const VisitorIdContext = createContext<VisitorIdContextType | null>(
  null
);

export function VisitorIdProvider({ children }: { children: React.ReactNode }) {
  const [visitorId, setVisitorId] = useVisitorId();
  const [optimisticVisitorId, setOptimisticVisitorId] = useState(visitorId);

  const value = {
    visitorId: optimisticVisitorId,
    setVisitorId: (value: string | ((val: string) => string)) => {
      const resolvedValue =
        typeof value === "function" ? value(optimisticVisitorId) : value;
      setOptimisticVisitorId(resolvedValue);
      setVisitorId(resolvedValue);
    },
  };

  return (
    <VisitorIdContext.Provider value={value}>
      {children}
    </VisitorIdContext.Provider>
  );
}

export function useVisitorIdContext() {
  const context = useContext(VisitorIdContext);
  if (!context) {
    throw new Error(
      "useVisitorIdContext must be used within a VisitorIdProvider"
    );
  }
  return context;
}
