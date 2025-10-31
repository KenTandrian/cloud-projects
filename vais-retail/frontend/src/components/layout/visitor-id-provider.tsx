"use client";

import { VISITOR_PROFILES } from "@/config/visitor";
import { useVisitorId } from "@/hooks/use-visitor-id";
import {
  type Dispatch,
  type SetStateAction,
  createContext,
  useContext,
  useEffect,
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

  // biome-ignore lint/correctness/useExhaustiveDependencies: run on mount
  useEffect(() => {
    if (!visitorId) setVisitorId(VISITOR_PROFILES[0].id);
  }, []);

  return (
    <VisitorIdContext.Provider value={{ visitorId, setVisitorId }}>
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
