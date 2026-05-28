import AsyncStorage from "@react-native-async-storage/async-storage";

export interface PendingPayment {
  id: string;
  userId: string;
  userName: string;
  type: "withdraw" | "giftcard" | "giftcon";
  amount: number;
  status: "pending" | "approved" | "rejected";
  date: string;
  tid?: string;
  orderId?: string;
}

/**
 * 결제 대기 상태로 저장
 */
export const addPendingPayment = async (
  userId: string,
  userName: string,
  type: "withdraw" | "giftcard" | "giftcon",
  amount: number,
  tid?: string,
  orderId?: string
): Promise<PendingPayment> => {
  try {
    const paymentId = `payment_${Date.now()}`;

    const payment: PendingPayment = {
      id: paymentId,
      userId,
      userName,
      type,
      amount,
      status: "pending",
      date: new Date().toISOString(),
      tid,
      orderId,
    };

    // 대기중인 결제 목록에 추가
    const pendingPayments = JSON.parse((await AsyncStorage.getItem("pendingPayments")) || "[]");
    pendingPayments.push(payment);
    await AsyncStorage.setItem("pendingPayments", JSON.stringify(pendingPayments));

    return payment;
  } catch (error) {
    throw error;
  }
};

/**
 * 결제 승인
 */
export const approvePendingPayment = async (paymentId: string): Promise<boolean> => {
  try {
    const pendingPayments = JSON.parse((await AsyncStorage.getItem("pendingPayments")) || "[]");
    const payment = pendingPayments.find((p: PendingPayment) => p.id === paymentId);

    if (!payment) {
      throw new Error("결제를 찾을 수 없습니다");
    }

    // 결제 상태 업데이트
    const updatedPayments = pendingPayments.map((p: PendingPayment) =>
      p.id === paymentId ? { ...p, status: "approved" } : p
    );
    await AsyncStorage.setItem("pendingPayments", JSON.stringify(updatedPayments));

    // 사용자 캐시 차감
    const userData = await AsyncStorage.getItem("userData");
    if (userData) {
      const user = JSON.parse(userData);
      user.totalCash -= payment.amount;
      await AsyncStorage.setItem("userData", JSON.stringify(user));
    }

    // 거래 내역에 추가
    const transactions = JSON.parse((await AsyncStorage.getItem("transactions")) || "[]");
    transactions.push({
      id: paymentId,
      type: payment.type,
      amount: -payment.amount,
      description: `${getTypeLabel(payment.type)} 결제 승인`,
      date: new Date().toISOString(),
      status: "completed",
    });
    await AsyncStorage.setItem("transactions", JSON.stringify(transactions));

    return true;
  } catch (error) {
    throw error;
  }
};

/**
 * 결제 거절
 */
export const rejectPendingPayment = async (paymentId: string): Promise<boolean> => {
  try {
    const pendingPayments = JSON.parse((await AsyncStorage.getItem("pendingPayments")) || "[]");

    // 결제 상태 업데이트
    const updatedPayments = pendingPayments.map((p: PendingPayment) =>
      p.id === paymentId ? { ...p, status: "rejected" } : p
    );
    await AsyncStorage.setItem("pendingPayments", JSON.stringify(updatedPayments));

    return true;
  } catch (error) {
    throw error;
  }
};

/**
 * 대기중인 결제 목록 조회
 */
export const getPendingPayments = async (): Promise<PendingPayment[]> => {
  try {
    const pendingPayments = JSON.parse((await AsyncStorage.getItem("pendingPayments")) || "[]");
    return pendingPayments;
  } catch (error) {
    throw error;
  }
};

/**
 * 결제 타입 라벨
 */
const getTypeLabel = (type: string) => {
  switch (type) {
    case "withdraw":
      return "출금";
    case "giftcard":
      return "기프트카드";
    case "giftcon":
      return "기프트콘";
    default:
      return type;
  }
};
