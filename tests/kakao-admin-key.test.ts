import { describe, it, expect } from "vitest";

describe("Kakao Admin Key Validation", () => {
  it("should have valid KAKAO_ADMIN_KEY environment variable", () => {
    const adminKey = process.env.KAKAO_ADMIN_KEY;
    expect(adminKey).toBeDefined();
    expect(adminKey).toBeTruthy();
    expect(adminKey?.length).toBeGreaterThan(0);
  });

  it("should validate admin key format", () => {
    const adminKey = process.env.KAKAO_ADMIN_KEY;
    // Admin 키는 32자 이상의 영문/숫자 조합
    expect(adminKey).toMatch(/^[a-zA-Z0-9]{32,}$/);
  });

  it("should be able to create authorization header", () => {
    const adminKey = process.env.KAKAO_ADMIN_KEY;
    const authHeader = `KakaoAK ${adminKey}`;
    expect(authHeader).toContain("KakaoAK");
    expect(authHeader.length).toBeGreaterThan(10);
  });
});
