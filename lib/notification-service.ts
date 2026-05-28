import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 알림 핸들러 설정
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * 알림 권한 요청
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  } catch (error) {
    console.error("알림 권한 요청 실패:", error);
    return false;
  }
};

/**
 * 결제 승인 알림 전송
 */
export const sendPaymentApprovedNotification = async (
  paymentId: string,
  amount: number,
  type: string
) => {
  try {
    const typeLabel = getTypeLabel(type);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "결제 승인 완료! 🎉",
        body: `${typeLabel} 결제 ${amount.toLocaleString()}원이 승인되었습니다.`,
        data: {
          paymentId,
          type: "payment_approved",
        },
      },
      trigger: null,
    });
  } catch (error) {
    console.error("결제 승인 알림 전송 실패:", error);
  }
};

/**
 * 결제 거절 알림 전송
 */
export const sendPaymentRejectedNotification = async (
  paymentId: string,
  amount: number,
  type: string
) => {
  try {
    const typeLabel = getTypeLabel(type);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "결제 거절됨",
        body: `${typeLabel} 결제 ${amount.toLocaleString()}원이 거절되었습니다.`,
        data: {
          paymentId,
          type: "payment_rejected",
        },
      },
      trigger: null,
    });
  } catch (error) {
    console.error("결제 거절 알림 전송 실패:", error);
  }
};

/**
 * 생일 축하 알림 전송
 */
export const sendBirthdayNotification = async (userName: string) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "생일 축하합니다! 🎂",
        body: `${userName}님의 생일을 축하드립니다!\n60억 캐시 선물이 준비되어 있습니다.`,
        data: {
          type: "birthday",
        },
      },
      trigger: null,
    });
  } catch (error) {
    console.error("생일 축하 알림 전송 실패:", error);
  }
};

/**
 * 캐시 적립 알림 전송
 */
export const sendCashEarnedNotification = async (amount: number, reason: string) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "캐시 적립! 💰",
        body: `${reason}으로 ${amount.toLocaleString()}원의 캐시가 적립되었습니다.`,
        data: {
          type: "cash_earned",
        },
      },
      trigger: null,
    });
  } catch (error) {
    console.error("캐시 적립 알림 전송 실패:", error);
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

/**
 * 알림 응답 처리
 */
export const setupNotificationResponseListener = (
  onResponse: (notification: Notifications.Notification) => void
) => {
  const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
    onResponse(response.notification);
  });

  return subscription;
};
