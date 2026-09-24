import { describe, expect, it } from "vitest";
import { randomBytes } from "node:crypto";
import { encryptToken, decryptToken } from "../api/_lib/abhaVault";

describe("ABHA token vault",()=>{
  it("encrypts and decrypts provider tokens",()=>{
    process.env.ABHA_TOKEN_ENCRYPTION_KEY=randomBytes(32).toString("hex");
    const token="provider-secret-token";
    expect(decryptToken(encryptToken(token))).toBe(token);
  });
});
