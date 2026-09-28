import { useSyncExternalStore } from "react";

/** A minimal external store: the render loop writes, React reads with `useStore`. */
export type Store<T> = {
  get: () => T;
  /** Replaces the value and notifies subscribers, unless `equals` says nothing changed. */
  set: (next: T) => void;
  subscribe: (listener: () => void) => () => void;
};

export function createStore<T>(
  initial: T,
  equals: (a: T, b: T) => boolean = Object.is
): Store<T> {
  let value = initial;
  const listeners = new Set<() => void>();
  return {
    get: () => value,
    set(next) {
      if (equals(value, next)) return;
      value = next;
      for (const listener of listeners) listener();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

/** Subscribes a component to the whole store value. */
export function useStore<T>(store: Store<T>): T {
  return useSyncExternalStore(store.subscribe, store.get, store.get);
}

/** Subscribes a component to a derived value; the selector must return a stable (primitive or memoised) result. */
export function useStoreSelector<T, S>(
  store: Store<T>,
  select: (state: T) => S
): S {
  const getSnapshot = () => select(store.get());
  return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}
