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

export type HashRoute = {
  id: string | null;
  /** Pushes a history entry, like following a link. */
  navigate: (id: string) => void;
  /** Rewrites the current entry without adding history; used to normalise bad or missing hashes. */
  replace: (id: string) => void;
};

/** The scene id from the URL hash and the two ways of writing it. */
export function useHashRoute(): HashRoute {
  const id = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const navigate = useCallback((next: string) => {
    window.location.hash = toHash(next);
  }, []);
  const replace = useCallback((next: string) => {
    window.history.replaceState(null, "", toHash(next));
    // replaceState fires no hashchange, so tell the subscribers ourselves.
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  }, []);
  return { id, navigate, replace };
}
