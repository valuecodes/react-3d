import { describe, expect, it, vi } from "vitest";

import { createStore } from "./store";

describe("createStore", () => {
  it("notifies subscribers when the value changes", () => {
    const store = createStore(1);
    const listener = vi.fn();
    store.subscribe(listener);
    store.set(2);
    expect(store.get()).toBe(2);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("stays silent for equal values and after unsubscribe", () => {
    const store = createStore({ n: 1 }, (a, b) => a.n === b.n);
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    store.set({ n: 1 });
    expect(listener).not.toHaveBeenCalled();
    unsubscribe();
    store.set({ n: 2 });
    expect(listener).not.toHaveBeenCalled();
    expect(store.get().n).toBe(2);
  });
});
