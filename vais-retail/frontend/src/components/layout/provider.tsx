"use client";

import { ProgressProvider } from "@bprogress/next/app";

type Props = {
  children: React.ReactNode;
};

export function Provider({ children }: Props) {
  return (
    <ProgressProvider
      height="2px"
      color="oklch(.488 .243 264.376)"
      options={{ showSpinner: false }}
      shallowRouting
    >
      {children}
    </ProgressProvider>
  );
}
