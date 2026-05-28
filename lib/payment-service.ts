import AsyncStorage from "@react-native-async-storage/async-storage";

export interface WithdrawalRequest {
  id: string;
  amount: number;
  bankAccount: string;
  status: "pending" | "completed" | "failed";
  date: string;
  expectedDate: string;
}

export interface GiftCardPurchase {
  id: string;
  type: string;
  amount: number;
  code: string;
  date: string;
  status: "completed" | "pending";
}

export interface GiftConPurchase {
  id: string;
  type: string;
  amount: number;
  number: string;
  date: string;
  status: "completed" | "pending";
}

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
      date: today.toLocaleDateString("ko-KR"),
      expectedDate: expectedDate.toLocaleDateString("ko-KR"),
    };

    const withdrawals = user.withdrawals || [];
    withdrawals.push(withdrawal);

    const updatedUser = {
      ...user,
      totalCash: user.totalCash - amount,
      totalSpent: (user.totalSpent || 0) + amount,
      withdrawals,
      bankAccount,
      transactions: [
        {
          id: withdrawalId,
          type: "spend",
          amount,
          description: `출금 (${bankAccount})`,
          date: today.toLocaleDateString("ko-KR"),
        },
        ...(user.transactions || []),
      ],
    };

    await AsyncStorage.setItem("userData", JSON.stringify(updatedUser));
    return withdrawal;
  } catch (error) {
    console.error("Failed to request withdrawal:", error);
    throw error;
  }
};

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
    const code = `GC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const today = new Date();

    const purchase: GiftCardPurchase = {
      id: purchaseId,
      type,
      amount,
      code,
      date: today.toLocaleDateString("ko-KR"),
      status: "completed",
    };

    const giftCards = user.giftCards || [];
    giftCards.push(purchase);

    const updatedUser = {
      ...user,
      totalCash: user.totalCash - amount,
      totalSpent: (user.totalSpent || 0) + amount,
      giftCards,
      transactions: [
        {
          id: purchaseId,
          type: "spend",
          amount,
          description: `${type} 기프트카드 구매`,
          date: today.toLocaleDateString("ko-KR"),
        },
        ...(user.transactions || []),
      ],
    };

    await AsyncStorage.setItem("userData", JSON.stringify(updatedUser));
    return purchase;
  } catch (error) {
    console.error("Failed to purchase gift card:", error);
    throw error;
  }
};

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
    const number = `${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    const today = new Date();

    const purchase: GiftConPurchase = {
      id: purchaseId,
      type,
      amount,
      number,
      date: today.toLocaleDateString("ko-KR"),
      status: "completed",
    };

    const giftCons = user.giftCons || [];
    giftCons.push(purchase);

    const updatedUser = {
      ...user,
      totalCash: user.totalCash - amount,
      totalSpent: (user.totalSpent || 0) + amount,
      giftCons,
      transactions: [
        {
          id: purchaseId,
          type: "spend",
          amount,
          description: `${type} 기프트콘 구매`,
          date: today.toLocaleDateString("ko-KR"),
        },
        ...(user.transactions || []),
      ],
    };

    await AsyncStorage.setItem("userData", JSON.stringify(updatedUser));
    return purchase;
  } catch (error) {
    console.error("Failed to purchase gift con:", error);
    throw error;
  }
};

export const getWithdrawals = async () => {
  try {
    const userData = await AsyncStorage.getItem("userData");
    if (!userData) return [];
    const user = JSON.parse(userData);
    return user.withdrawals || [];
  } catch (error) {
    console.error("Failed to get withdrawals:", error);
    return [];
  }
};

export const getGiftCards = async () => {
  try {
    const userData = await AsyncStorage.getItem("userData");
    if (!userData) return [];
    const user = JSON.parse(userData);
    return user.giftCards || [];
  } catch (error) {
    console.error("Failed to get gift cards:", error);
    return [];
  }
};

export const getGiftCons = async () => {
  try {
    const userData = await AsyncStorage.getItem("userData");
    if (!userData) return [];
    const user = JSON.parse(userData);
    return user.giftCons || [];
  } catch (error) {
    console.error("Failed to get gift cons:", error);
    return [];
  }
};
