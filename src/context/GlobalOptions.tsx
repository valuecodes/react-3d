import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
} from "react";
import type { ReactNode } from "react";

import { appReducer } from "./AppReducer";
import { initialOptions } from "./options";
import type { CommandChange, Options, SettingChange } from "./options";

export type OptionsStore = {
  options: Options;
  setOption: (change: SettingChange) => void;
  sendCommand: (change: CommandChange) => void;
};

const GlobalOptions = createContext<OptionsStore | null>(null);

export function GlobalOptionsProvider({ children }: { children: ReactNode }) {
  const [options, dispatch] = useReducer(appReducer, initialOptions);

  const setOption = useCallback((change: SettingChange) => {
    dispatch({ type: "SET", ...change });
  }, []);

  const sendCommand = useCallback((change: CommandChange) => {
    dispatch({ type: "COMMAND", ...change });
  }, []);

  const store = useMemo<OptionsStore>(
    () => ({ options, setOption, sendCommand }),
    [options, setOption, sendCommand]
  );

  return (
    <GlobalOptions.Provider value={store}>{children}</GlobalOptions.Provider>
  );
}

export function useGlobalOptions(): OptionsStore {
  const store = useContext(GlobalOptions);
  if (!store)
    throw new Error(
      "useGlobalOptions must be used inside GlobalOptionsProvider"
    );
  return store;
}
