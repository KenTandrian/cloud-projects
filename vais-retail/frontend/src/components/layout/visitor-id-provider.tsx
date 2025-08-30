"use client";

import { useVisitorId } from "@/hooks/use-visitor-id";
import {
  type Dispatch,
  type SetStateAction,
  createContext,
  useContext,
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
