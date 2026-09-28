import { useCallback, useSyncExternalStore } from "react";

import { parseHash, toHash } from "./hashRoute";

function subscribe(listener: () => void): () => void {
  window.addEventListener("hashchange", listener);
  return () => window.removeEventListener("hashchange", listener);
}

function getSnapshot(): string | null {
  return parseHash(window.location.hash);
}

function getServerSnapshot(): string | null {
  return null;
}

/** The scene id from the URL hash and a navigator that writes it. */
export function useHashRoute(): [
  id: string | null,
  navigate: (id: string) => void,
] {
  const id = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const navigate = useCallback((next: string) => {
    window.location.hash = toHash(next);
  }, []);
  return [id, navigate];
}
