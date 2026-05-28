import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * 사용자 데이터를 서버에 동기화
 */
export const syncUserDataToServer = async (userData: any) => {
  try {
    const response = await fetch("/api/user/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: userData.userId,
        name: userData.name,
        email: userData.email,
        birthday: userData.birthday,
        totalCash: userData.totalCash,
        totalEarned: userData.totalEarned,
        totalSpent: userData.totalSpent,
        joinDate: userData.joinDate,
      }),
    });

    if (!response.ok) {
      throw new Error("사용자 데이터 동기화 실패");
    }

    return await response.json();
  } catch (error) {
    console.error("사용자 데이터 동기화 오류:", error);
    throw error;
  }
};

/**
 * 거래 내역을 서버에 동기화
 */
export const syncTransactionsToServer = async (userId: string, transactions: any[]) => {
  try {
    const response = await fetch("/api/transactions/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        transactions,
      }),
    });

    if (!response.ok) {
      throw new Error("거래 내역 동기화 실패");
    }

    return await response.json();
  } catch (error) {
    console.error("거래 내역 동기화 오류:", error);
    throw error;
  }
};

/**
 * 결제 내역을 서버에 동기화
 */
export const syncPaymentsToServer = async (userId: string, payments: any[]) => {
  try {
    const response = await fetch("/api/payments/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        payments,
      }),
    });

    if (!response.ok) {
      throw new Error("결제 내역 동기화 실패");
    }

    return await response.json();
  } catch (error) {
    console.error("결제 내역 동기화 오류:", error);
    throw error;
  }
};

/**
 * 모든 데이터를 서버에 동기화
 */
export const syncAllDataToServer = async () => {
  try {
    const userData = await AsyncStorage.getItem("userData");
    const transactions = await AsyncStorage.getItem("transactions");
    const pendingPayments = await AsyncStorage.getItem("pendingPayments");

    if (!userData) {
      throw new Error("사용자 데이터를 찾을 수 없습니다");
    }

    const user = JSON.parse(userData);

    // 사용자 데이터 동기화
    await syncUserDataToServer(user);

    // 거래 내역 동기화
    if (transactions) {
      await syncTransactionsToServer(user.userId, JSON.parse(transactions));
    }

    // 결제 내역 동기화
    if (pendingPayments) {
      await syncPaymentsToServer(user.userId, JSON.parse(pendingPayments));
    }

    return {
      success: true,
      message: "모든 데이터가 동기화되었습니다",
    };
  } catch (error: any) {
    console.error("전체 데이터 동기화 오류:", error);
    throw error;
  }
};

/**
 * 서버에서 사용자 데이터 가져오기
 */
export const fetchUserDataFromServer = async (userId: string) => {
  try {
    const response = await fetch(`/api/user/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("사용자 데이터 조회 실패");
    }

    return await response.json();
  } catch (error) {
    console.error("사용자 데이터 조회 오류:", error);
    throw error;
  }
};

/**
 * 서버에서 거래 내역 가져오기
 */
export const fetchTransactionsFromServer = async (userId: string) => {
  try {
    const response = await fetch(`/api/transactions/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("거래 내역 조회 실패");
    }

    return await response.json();
  } catch (error) {
    console.error("거래 내역 조회 오류:", error);
    throw error;
  }
};

/**
 * 자동 동기화 설정
 */
export const setupAutoSync = (intervalMinutes: number = 5) => {
  const intervalMs = intervalMinutes * 60 * 1000;

  const syncInterval = setInterval(async () => {
    try {
      await syncAllDataToServer();
      console.log("자동 동기화 완료");
    } catch (error) {
      console.error("자동 동기화 실패:", error);
    }
  }, intervalMs);

  return () => clearInterval(syncInterval);
};
