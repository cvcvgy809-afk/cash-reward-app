import { describe, it, expect } from "vitest";

describe("카카오페이 API 설정", () => {
  it("환경 변수가 설정되어 있는지 확인", () => {
    const kakaoAppId = process.env.KAKAO_APP_ID;
    const kakaoMerchantId = process.env.KAKAO_MERCHANT_ID;
    const kakaoAdminKey = process.env.KAKAO_ADMIN_KEY;

    expect(kakaoAppId).toBeDefined();
    expect(kakaoMerchantId).toBeDefined();
    expect(kakaoAdminKey).toBeDefined();

    expect(kakaoAppId).toBe("1470706");
    expect(kakaoMerchantId).toBe("kartracerapp-fxgtpp9z.manus.space");
    expect(kakaoAdminKey).toBe("8970e0f91ee963363cb6dd20ec1396d32");
  });

  it("카카오페이 API 엔드포인트 확인", () => {
    const baseUrl = "https://kapi.kakao.com";
    expect(baseUrl).toBeDefined();
    expect(baseUrl).toContain("kapi.kakao.com");
  });
});
