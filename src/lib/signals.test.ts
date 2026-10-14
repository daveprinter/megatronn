import { describe, expect, it } from "vitest";
import { recoverySignals } from "./signals";

const flat = (n: number) => Array.from({ length: n }, (_, i) => 100 + (i % 2 ? 0.01 : 0));

describe("recovery entries", () => {
  it("enters over 3 only when >=80% of digits are above 3 and the last digit is below 3", () => {
    const base = Array.from({ length: 40 }, (_, i) => [5, 6, 7, 8, 9][i % 5]!);
    const hit = recoverySignals([...base, 1], flat(41));
    expect(hit.some((s) => s.type === "OVER" && s.pred === 3)).toBe(true);
    const miss = recoverySignals([...base, 4], flat(41));
    expect(miss.some((s) => s.type === "OVER" && s.pred === 3)).toBe(false);
  });
  it("enters fall after two consecutive rises", () => {
    const prices = [...flat(30), 101, 102, 103];
    const digits = Array.from({ length: 33 }, (_, i) => i % 10);
    expect(recoverySignals(digits, prices).some((s) => s.type === "FALL")).toBe(true);
    expect(recoverySignals(digits, prices).some((s) => s.type === "RISE")).toBe(false);
  });
  it("enters even after two odd digits in a row", () => {
    const digits = [...Array.from({ length: 30 }, (_, i) => i % 10), 2, 3, 5];
    expect(recoverySignals(digits, flat(33)).some((s) => s.type === "EVEN")).toBe(true);
  });
});
