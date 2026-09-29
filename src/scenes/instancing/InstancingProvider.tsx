import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

export type InstancingOptions = {
  /** Instances per side; the grid holds `side * side` cylinders. */
  side: number;
  /** Distance between neighbouring cylinders. */
  spacing: number;
  animate: boolean;
  /** Peak height of the travelling wave. */
  amplitude: number;
};

export type InstancingStore = {
  options: InstancingOptions;
  update: (patch: Partial<InstancingOptions>) => void;
};

export const initialOptions: InstancingOptions = {
  side: 50,
  spacing: 4,
  animate: true,
  amplitude: 8,
};

const InstancingContext = createContext<InstancingStore | null>(null);

/** Holds the grid options for both the sidebar panel and the instanced scene. */
export function InstancingProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState(initialOptions);

  const update = useCallback((patch: Partial<InstancingOptions>) => {
    setOptions((current) => ({ ...current, ...patch }));
  }, []);

  const store = useMemo<InstancingStore>(
    () => ({ options, update }),
    [options, update]
  );

  return (
    <InstancingContext.Provider value={store}>
      {children}
    </InstancingContext.Provider>
  );
}

export function useInstancing(): InstancingStore {
  const store = useContext(InstancingContext);
  if (!store)
    throw new Error("useInstancing must be used inside InstancingProvider");
  return store;
}
