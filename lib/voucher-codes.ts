import { randomBytes } from "crypto";

const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export function generateVoucherCode(prefix: string): string {
  const bytes = randomBytes(6);
  let suffix = "";
  for (let i = 0; i < 6; i++) {
    suffix += CHARSET[bytes[i]! % CHARSET.length];
  }
  return `${prefix}-${suffix}`;
}

export function generateUniqueCodes(prefix: string, count: number): string[] {
  const codes = new Set<string>();
  while (codes.size < count) {
    codes.add(generateVoucherCode(prefix));
  }
  return Array.from(codes);
}
