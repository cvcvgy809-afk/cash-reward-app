/**
 * 캐시로 기프트카드/기프트콘 구매 서비스
 * 카카오페이 없이 캐시로 직접 구매
 */

export interface GiftCardPurchase {
  id: string;
  type: "amazon" | "apple" | "googleplay" | "steam";
  amount: number;
  code: string;
  date: string;
  status: "completed" | "pending";
  expiryDate: string;
}

export interface GiftConPurchase {
  id: string;
  type: "gs25" | "cu" | "emart24" | "convenience";
  amount: number;
  code: string;
  date: string;
  status: "completed" | "pending";
  expiryDate: string;
}

export interface GiftPurchaseResult {
  success: boolean;
  message: string;
  code?: string;
  expiryDate?: string;
}

/**
 * 기프트카드 가격 정보
 */
const GIFTCARD_PRICES: Record<string, number> = {
  amazon: 10000,
  apple: 10000,
  googleplay: 10000,
  steam: 10000,
};

/**
 * 기프트콘 가격 정보
 */
const GIFTCON_PRICES: Record<string, number> = {
  gs25: 10000,
  cu: 10000,
  emart24: 10000,
  convenience: 10000,
};

/**
 * 랜덤 코드 생성
 */
const generateCode = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 16; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

/**
 * 유효기간 계산 (30일 후)
 */
const calculateExpiryDate = (): string => {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString().split("T")[0];
};

/**
 * 기프트카드 캐시 구매
 */
export const purchaseGiftCard = async (
  type: "amazon" | "apple" | "googleplay" | "steam",
  currentCash: number
): Promise<GiftPurchaseResult> => {
  try {
    const price = GIFTCARD_PRICES[type];

    // 캐시 확인
    if (currentCash < price) {
      return {
        success: false,
        message: `캐시가 부족합니다. 필요: ${price}원, 보유: ${currentCash}원`,
      };
    }

    // 코드 생성
    const code = generateCode();
    const expiryDate = calculateExpiryDate();

    return {
      success: true,
      message: `${type.toUpperCase()} 기프트카드 ${price}원 구매 완료!`,
      code,
      expiryDate,
    };
  } catch (error) {
    console.error("기프트카드 구매 오류:", error);
    return {
      success: false,
      message: "기프트카드 구매 중 오류가 발생했습니다.",
    };
  }
};

/**
 * 기프트콘 캐시 구매
 */
export const purchaseGiftCon = async (
  type: "gs25" | "cu" | "emart24" | "convenience",
  currentCash: number
): Promise<GiftPurchaseResult> => {
  try {
    const price = GIFTCON_PRICES[type];

    // 캐시 확인
    if (currentCash < price) {
      return {
        success: false,
        message: `캐시가 부족합니다. 필요: ${price}원, 보유: ${currentCash}원`,
      };
    }

    // 코드 생성
    const code = generateCode();
    const expiryDate = calculateExpiryDate();

    return {
      success: true,
      message: `${getConvenienceStoreName(type)} 기프트콘 ${price}원 구매 완료!`,
      code,
      expiryDate,
    };
  } catch (error) {
    console.error("기프트콘 구매 오류:", error);
    return {
      success: false,
      message: "기프트콘 구매 중 오류가 발생했습니다.",
    };
  }
};

/**
 * 편의점 이름 반환
 */
const getConvenienceStoreName = (type: string): string => {
  const names: Record<string, string> = {
    gs25: "GS25",
    cu: "CU",
    emart24: "이마트24",
    convenience: "편의점",
  };
  return names[type] || type;
};

/**
 * 기프트카드 구매 기록 생성
 */
export const createGiftCardRecord = (
  type: "amazon" | "apple" | "googleplay" | "steam",
  code: string,
  expiryDate: string
): GiftCardPurchase => {
  return {
    id: `giftcard_${Date.now()}`,
    type,
    amount: GIFTCARD_PRICES[type],
    code,
    date: new Date().toISOString().split("T")[0],
    status: "completed",
    expiryDate,
  };
};

/**
 * 기프트콘 구매 기록 생성
 */
export const createGiftConRecord = (
  type: "gs25" | "cu" | "emart24" | "convenience",
  code: string,
  expiryDate: string
): GiftConPurchase => {
  return {
    id: `giftcon_${Date.now()}`,
    type,
    amount: GIFTCON_PRICES[type],
    code,
    date: new Date().toISOString().split("T")[0],
    status: "completed",
    expiryDate,
  };
};

/**
 * 기프트카드 가격 조회
 */
export const getGiftCardPrice = (type: string): number => {
  return GIFTCARD_PRICES[type] || 10000;
};

/**
 * 기프트콘 가격 조회
 */
export const getGiftConPrice = (type: string): number => {
  return GIFTCON_PRICES[type] || 10000;
};
