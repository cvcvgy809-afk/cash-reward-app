import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializePayment, approvePayment } from "./kakao-pay-service";

export interface WithdrawalRequest {
  id: string;
  amount: number;
  bankAccount: string;
  status: "pending" | "completed" | "failed";
  date: string;
  expectedDate: string;
  tid?: string;
}

export interface GiftCardPurchase {
  id: string;
  type: string;
  amount: number;
  code: string;
  date: string;
  status: "completed" | "pending";
  tid?: string;
}

export interface GiftConPurchase {
  id: string;
  type: string;
  amount: number;
  number: string;
  date: string;
  status: "completed" | "pending";
  tid?: string;
}

/**
 * 카카오페이 결제 준비
 */
export const processPaymentWithKakaoPay = async (
  amount: number,
  type: "withdraw" | "giftcard" | "giftcon"
): Promise<{ tid: string; orderId: string }> => {
  try {
    const orderId = `order_${Date.now()}`;
    let itemName = "";

    if (type === "withdraw") {
      itemName = "캐시 출금";
    } else if (type === "giftcard") {
      itemName = "기프트카드 구매";
    } else {
      itemName = "기프트콘 구매";
    }

    const response = await initializePayment({
      orderId,
      itemName,
      quantity: 1,
      totalAmount: amount,
      taxFreeAmount: amount,
      approvalUrl: "exp://payment/approval",
      cancelUrl: "exp://payment/cancel",
      failUrl: "exp://payment/fail",
    });

    return {
      tid: response.tid,
      orderId,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * 카카오페이 결제 승인 처리
 */
export const approvePaymentWithKakaoPay = async (
  tid: string,
  pgToken: string,
  orderId: string,
  amount: number,
  type: "withdraw" | "giftcard" | "giftcon"
) => {
  try {
    const approval = await approvePayment(tid, pgToken, orderId);

    if (type === "withdraw") {
      // 출금 처리
      return await completeWithdrawal(amount, tid, orderId);
    } else if (type === "giftcard") {
      // 기프트카드 구매 처리
      return await completeGiftCardPurchase(amount, tid, orderId);
    } else {
      // 기프트콘 구매 처리
      return await completeGiftConPurchase(amount, tid, orderId);
    }
  } catch (error) {
    throw error;
  }
};

/**
 * 출금 요청
 */
export const requestWithdrawal = async (amount: number, bankAccount: string) => {
  try {
    const userData = await AsyncStorage.getItem("userData");
    if (!userData) return false;

    const user = JSON.parse(userData);

    if (amount < 10000) {
      throw new Error("최소 출금액은 10,000원입니다");
    }

    if (amount > user.totalCash) {
      throw new Error("캐시가 부족합니다");
    }

    const withdrawalId = `withdraw_${Date.now()}`;
    const today = new Date();
    const expectedDate = new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000);

    const withdrawal: WithdrawalRequest = {
      id: withdrawalId,
      amount,
      bankAccount,
      status: "pending",
      date: today.toISOString(),
      expectedDate: expectedDate.toISOString().split("T")[0],
    };

    // 거래 내역에 추가
    const transactions = JSON.parse((await AsyncStorage.getItem("transactions")) || "[]");
    transactions.push({
      id: withdrawalId,
      type: "withdrawal",
      amount: -amount,
      description: `출금 신청 (${bankAccount})`,
      date: today.toISOString(),
      status: "pending",
    });

    // 캐시 차감
    user.totalCash -= amount;
    user.withdrawnCash = (user.withdrawnCash || 0) + amount;

    await AsyncStorage.setItem("userData", JSON.stringify(user));
    await AsyncStorage.setItem("transactions", JSON.stringify(transactions));

    return withdrawal;
  } catch (error) {
    throw error;
  }
};

/**
 * 출금 완료 처리
 */
const completeWithdrawal = async (amount: number, tid: string, orderId: string) => {
  try {
    const userData = await AsyncStorage.getItem("userData");
    if (!userData) return false;

    const user = JSON.parse(userData);

    if (amount > user.totalCash) {
      throw new Error("캐시가 부족합니다");
    }

    const withdrawalId = `withdraw_${Date.now()}`;
    const today = new Date();
    const expectedDate = new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000);

    const withdrawal: WithdrawalRequest = {
      id: withdrawalId,
      amount,
      bankAccount: "카카오페이",
      status: "completed",
      date: today.toISOString(),
      expectedDate: expectedDate.toISOString().split("T")[0],
      tid,
    };

    // 거래 내역에 추가
    const transactions = JSON.parse((await AsyncStorage.getItem("transactions")) || "[]");
    transactions.push({
      id: withdrawalId,
      type: "withdrawal",
      amount: -amount,
      description: "출금 완료",
      date: today.toISOString(),
      status: "completed",
      tid,
    });

    // 캐시 차감
    user.totalCash -= amount;
    user.withdrawnCash = (user.withdrawnCash || 0) + amount;

    await AsyncStorage.setItem("userData", JSON.stringify(user));
    await AsyncStorage.setItem("transactions", JSON.stringify(transactions));

    return withdrawal;
  } catch (error) {
    throw error;
  }
};

/**
 * 기프트카드 구매
 */
export const purchaseGiftCard = async (type: string, amount: number) => {
  try {
    const userData = await AsyncStorage.getItem("userData");
    if (!userData) return false;

    const user = JSON.parse(userData);

    if (amount < 10000) {
      throw new Error("최소 구매액은 10,000원입니다");
    }

    if (amount > user.totalCash) {
      throw new Error("캐시가 부족합니다");
    }

    const purchaseId = `giftcard_${Date.now()}`;
    const code = `GC-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    const purchase: GiftCardPurchase = {
      id: purchaseId,
      type,
      amount,
      code,
      date: new Date().toISOString(),
      status: "completed",
    };

    // 거래 내역에 추가
    const transactions = JSON.parse((await AsyncStorage.getItem("transactions")) || "[]");
    transactions.push({
      id: purchaseId,
      type: "giftcard",
      amount: -amount,
      description: `${type} 기프트카드 구매`,
      date: new Date().toISOString(),
      status: "completed",
      code,
    });

    // 캐시 차감
    user.totalCash -= amount;
    user.giftCardPurchased = (user.giftCardPurchased || 0) + amount;

    await AsyncStorage.setItem("userData", JSON.stringify(user));
    await AsyncStorage.setItem("transactions", JSON.stringify(transactions));

    return purchase;
  } catch (error) {
    throw error;
  }
};

/**
 * 기프트카드 구매 완료 처리
 */
const completeGiftCardPurchase = async (amount: number, tid: string, orderId: string) => {
  try {
    const userData = await AsyncStorage.getItem("userData");
    if (!userData) return false;

    const user = JSON.parse(userData);

    if (amount > user.totalCash) {
      throw new Error("캐시가 부족합니다");
    }

    const purchaseId = `giftcard_${Date.now()}`;
    const code = `GC-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    const purchase: GiftCardPurchase = {
      id: purchaseId,
      type: "카카오페이",
      amount,
      code,
      date: new Date().toISOString(),
      status: "completed",
      tid,
    };

    // 거래 내역에 추가
    const transactions = JSON.parse((await AsyncStorage.getItem("transactions")) || "[]");
    transactions.push({
      id: purchaseId,
      type: "giftcard",
      amount: -amount,
      description: "기프트카드 구매 완료",
      date: new Date().toISOString(),
      status: "completed",
      code,
      tid,
    });

    // 캐시 차감
    user.totalCash -= amount;
    user.giftCardPurchased = (user.giftCardPurchased || 0) + amount;

    await AsyncStorage.setItem("userData", JSON.stringify(user));
    await AsyncStorage.setItem("transactions", JSON.stringify(transactions));

    return purchase;
  } catch (error) {
    throw error;
  }
};

/**
 * 기프트콘 구매
 */
export const purchaseGiftCon = async (type: string, amount: number) => {
  try {
    const userData = await AsyncStorage.getItem("userData");
    if (!userData) return false;

    const user = JSON.parse(userData);

    if (amount < 5000) {
      throw new Error("최소 구매액은 5,000원입니다");
    }

    if (amount > user.totalCash) {
      throw new Error("캐시가 부족합니다");
    }

    const purchaseId = `giftcon_${Date.now()}`;
    const number = `${Math.random().toString(36).substring(2, 12).toUpperCase()}`;

    const purchase: GiftConPurchase = {
      id: purchaseId,
      type,
      amount,
      number,
      date: new Date().toISOString(),
      status: "completed",
    };

    // 거래 내역에 추가
    const transactions = JSON.parse((await AsyncStorage.getItem("transactions")) || "[]");
    transactions.push({
      id: purchaseId,
      type: "giftcon",
      amount: -amount,
      description: `${type} 기프트콘 구매`,
      date: new Date().toISOString(),
      status: "completed",
      number,
    });

    // 캐시 차감
    user.totalCash -= amount;
    user.giftConPurchased = (user.giftConPurchased || 0) + amount;

    await AsyncStorage.setItem("userData", JSON.stringify(user));
    await AsyncStorage.setItem("transactions", JSON.stringify(transactions));

    return purchase;
  } catch (error) {
    throw error;
  }
};

/**
 * 기프트콘 구매 완료 처리
 */
const completeGiftConPurchase = async (amount: number, tid: string, orderId: string) => {
  try {
    const userData = await AsyncStorage.getItem("userData");
    if (!userData) return false;

    const user = JSON.parse(userData);

    if (amount > user.totalCash) {
      throw new Error("캐시가 부족합니다");
    }

    const purchaseId = `giftcon_${Date.now()}`;
    const number = `${Math.random().toString(36).substring(2, 12).toUpperCase()}`;

    const purchase: GiftConPurchase = {
      id: purchaseId,
      type: "카카오페이",
      amount,
      number,
      date: new Date().toISOString(),
      status: "completed",
      tid,
    };

    // 거래 내역에 추가
    const transactions = JSON.parse((await AsyncStorage.getItem("transactions")) || "[]");
    transactions.push({
      id: purchaseId,
      type: "giftcon",
      amount: -amount,
      description: "기프트콘 구매 완료",
      date: new Date().toISOString(),
      status: "completed",
      number,
      tid,
    });

    // 캐시 차감
    user.totalCash -= amount;
    user.giftConPurchased = (user.giftConPurchased || 0) + amount;

    await AsyncStorage.setItem("userData", JSON.stringify(user));
    await AsyncStorage.setItem("transactions", JSON.stringify(transactions));

    return purchase;
  } catch (error) {
    throw error;
  }
};
