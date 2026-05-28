import { ScrollView, Text, View, TouchableOpacity, Alert, FlatList } from "react-native";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { sendPaymentApprovedNotification, sendPaymentRejectedNotification } from "@/lib/notification-service";

import { ScreenContainer } from "@/components/screen-container";

interface PendingPayment {
  id: string;
  userId: string;
  userName: string;
  type: "withdraw" | "giftcard" | "giftcon";
  amount: number;
  status: "pending" | "approved" | "rejected";
  date: string;
  tid?: string;
  orderId?: string;
  details?: string;
}

export default function AdminPaymentsScreen() {
  const [payments, setPayments] = useState<PendingPayment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const paymentsData = await AsyncStorage.getItem("pendingPayments");
      if (paymentsData) {
        setPayments(JSON.parse(paymentsData));
      }
      setLoading(false);
    } catch (error) {
      console.error("결제 내역 로드 실패:", error);
      setLoading(false);
    }
  };

  const approvePayment = async (paymentId: string) => {
    try {
      const updatedPayments = payments.map((p) =>
        p.id === paymentId ? { ...p, status: "approved" as const } : p
      );

      await AsyncStorage.setItem("pendingPayments", JSON.stringify(updatedPayments));

      // 사용자 캐시 차감
      const payment = payments.find((p) => p.id === paymentId);
      if (payment) {
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
          description: `${payment.type} 결제 승인`,
          date: new Date().toISOString(),
          status: "completed",
        });
        await AsyncStorage.setItem("transactions", JSON.stringify(transactions));
      }

      setPayments(updatedPayments);
      
      // 푸시 알림 전송
      if (payment) {
        await sendPaymentApprovedNotification(paymentId, payment.amount, payment.type);
      }
      
      Alert.alert("성공", "결제가 승인되었습니다");
    } catch (error: any) {
      Alert.alert("오류", error.message || "결제 승인에 실패했습니다");
    }
  };

  const rejectPayment = async (paymentId: string) => {
    Alert.alert("결제 거절", "이 결제를 거절하시겠습니까?", [
      { text: "취소", onPress: () => {} },
      {
        text: "거절",
        onPress: async () => {
          try {
            const updatedPayments = payments.map((p) =>
              p.id === paymentId ? { ...p, status: "rejected" as const } : p
            );

            await AsyncStorage.setItem("pendingPayments", JSON.stringify(updatedPayments));
            setPayments(updatedPayments);
            
            // 푸시 알림 전송
            const payment = payments.find((p) => p.id === paymentId);
            if (payment) {
              await sendPaymentRejectedNotification(paymentId, payment.amount, payment.type);
            }
            
            Alert.alert("완료", "결제가 거절되었습니다");
          } catch (error: any) {
            Alert.alert("오류", error.message || "결제 거절에 실패했습니다");
          }
        },
      },
    ]);
  };

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#FFA500";
      case "approved":
        return "#22C55E";
      case "rejected":
        return "#EF4444";
      default:
        return "#999999";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "대기중";
      case "approved":
        return "승인됨";
      case "rejected":
        return "거절됨";
      default:
        return status;
    }
  };

  const pendingPayments = payments.filter((p) => p.status === "pending");

  const renderPaymentItem = ({ item }: { item: PendingPayment }) => (
    <View className="bg-surface rounded-lg p-4 border border-border mb-3">
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="text-foreground font-semibold">{item.userName}</Text>
          <Text className="text-muted text-sm mt-1">{getTypeLabel(item.type)}</Text>
        </View>
        <View
          className="px-3 py-1 rounded-full"
          style={{ backgroundColor: getStatusColor(item.status) }}
        >
          <Text className="text-white text-xs font-semibold">{getStatusLabel(item.status)}</Text>
        </View>
      </View>

      <View className="bg-background rounded p-3 mb-3">
        <Text className="text-foreground font-bold text-lg">{item.amount.toLocaleString()}원</Text>
        <Text className="text-muted text-xs mt-1">
          {new Date(item.date).toLocaleString("ko-KR")}
        </Text>
      </View>

      {item.status === "pending" && (
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => approvePayment(item.id)}
            className="flex-1 bg-primary rounded-lg py-2 items-center active:opacity-80"
          >
            <Text className="text-foreground font-semibold">승인</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => rejectPayment(item.id)}
            className="flex-1 bg-error rounded-lg py-2 items-center active:opacity-80"
          >
            <Text className="text-white font-semibold">거절</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <ScreenContainer className="p-0">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-background">
        {/* Header */}
        <View className="bg-primary px-6 pt-6 pb-8">
          <Text className="text-2xl font-bold text-foreground">결제 승인</Text>
          <Text className="text-muted text-sm mt-2">대기중인 결제: {pendingPayments.length}건</Text>
        </View>

        <View className="px-6 py-6">
          {pendingPayments.length === 0 ? (
            <View className="items-center justify-center py-12">
              <Text className="text-muted text-center">대기중인 결제가 없습니다</Text>
            </View>
          ) : (
            <FlatList
              data={pendingPayments}
              renderItem={renderPaymentItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          )}

          {/* Completed Payments */}
          {payments.filter((p) => p.status !== "pending").length > 0 && (
            <View className="mt-8">
              <Text className="text-foreground font-semibold text-lg mb-3">처리 완료</Text>
              <FlatList
                data={payments.filter((p) => p.status !== "pending")}
                renderItem={renderPaymentItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
