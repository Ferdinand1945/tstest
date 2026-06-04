import { describe, expect, it } from "vitest";
import { generateUniqueCodes, generateVoucherCode } from "./voucher-codes";

describe("voucher-codes", () => {
  it("generates code with prefix and 6-char suffix", () => {
    const code = generateVoucherCode("DISCOUNT");
    expect(code).toMatch(/^DISCOUNT-[A-Z0-9]{6}$/);
  });

  it("generateUniqueCodes returns requested count without duplicates", () => {
    const codes = generateUniqueCodes("TEST", 50);
    expect(codes).toHaveLength(50);
    expect(new Set(codes).size).toBe(50);
    codes.forEach((code) => expect(code).toMatch(/^TEST-[A-Z0-9]{6}$/));
  });
});
