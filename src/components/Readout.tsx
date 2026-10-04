"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type ReadoutState = { readout: string | null; setReadout: (value: string | null) => void };

const ReadoutContext = createContext<ReadoutState>({ readout: null, setReadout: () => {} });

/** Shares the viewfinder's bottom-left readout (e.g. "Fr. 014 / 052 · Saint Catherine"). */
export function ReadoutProvider({ children }: { children: ReactNode }) {
  const [readout, setReadout] = useState<string | null>(null);
  const value = useMemo(() => ({ readout, setReadout }), [readout]);
  return <ReadoutContext.Provider value={value}>{children}</ReadoutContext.Provider>;
}

export const useReadout = () => useContext(ReadoutContext);
