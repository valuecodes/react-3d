import { describe, expect, it } from "vitest";

import { equalStatus, idleStatus } from "./statusStore";

describe("equalStatus", () => {
  it("compares details element-wise", () => {
    const a = { ...idleStatus("x"), details: [{ label: "a", value: "1" }] };
    const same = { ...idleStatus("x"), details: [{ label: "a", value: "1" }] };
    const other = { ...idleStatus("x"), details: [{ label: "a", value: "2" }] };
    expect(equalStatus(a, same)).toBe(true);
    expect(equalStatus(a, other)).toBe(false);
    expect(equalStatus(a, { ...a, details: [] })).toBe(false);
    expect(equalStatus(a, { ...a, phase: "done" })).toBe(false);
  });
});
