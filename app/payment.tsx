import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ScreenContainer } from "@/components/screen-container";
import { usePayment } from "@/lib/payment-context";
import { initializePayment } from "@/lib/kakao-pay-service";
import { addPendingPayment } from "@/lib/payment-service-v2";

export default function PaymentScreen() {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setPaymentState, updatePaymentStatus, setPaymentError } = usePayment();

  const handlePayment = async (type: "withdraw" | "giftcard" | "giftcon") => {
    const paymentAmount = parseInt(amount);

    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      Alert.alert("오류", "올바른 금액을 입력해주세요");
      return;
    }

    const minAmount = type === "giftcon" ? 5000 : 10000;
    if (paymentAmount < minAmount) {
      Alert.alert("오류", `최소 ${minAmount.toLocaleString()}원 이상 결제 가능합니다`);
      return;
    }

    setLoading(true);
    try {
      const userData = await AsyncStorage.getItem("userData");
      if (!userData) {
        throw new Error("사용자 정보를 찾을 수 없습니다");
      }

      const user = JSON.parse(userData);
      const orderId = `order_${Date.now()}`;

      let itemName = "";
      if (type === "withdraw") {
        itemName = "캐시 출금";
      } else if (type === "giftcard") {
        itemName = "기프트카드 구매";
      } else {
        itemName = "기프트콘 구매";
      }

      // 카카오페이 결제 준비
      const paymentResponse = await initializePayment({
        orderId,
        itemName,
        quantity: 1,
        totalAmount: paymentAmount,
        taxFreeAmount: paymentAmount,
        approvalUrl: "exp://payment/approval",
        cancelUrl: "exp://payment/cancel",
        failUrl: "exp://payment/fail",
      });

      // 대기중인 결제로 저장
      await addPendingPayment(
        user.userId || "user_" + Date.now(),
        user.name || "사용자",
        type,
        paymentAmount,
        paymentResponse.tid,
        orderId
      );

      // 결제 상태 업데이트
      setPaymentState({
        tid: paymentResponse.tid,
        orderId,
        amount: paymentAmount,
        itemName,
        status: "pending",
        error: null,
      });

      Alert.alert(
        "결제 신청 완료",
        `${itemName} 결제가 신청되었습니다.\n관리자의 승인을 기다리고 있습니다.\n주문번호: ${orderId}`
      );

      setAmount("");
    } catch (error: any) {
      const errorMessage = error.message || "결제 준비에 실패했습니다";
      setPaymentError(errorMessage);
      Alert.alert("오류", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer className="p-0">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-background">
        {/* Header */}
        <View className="bg-primary px-6 pt-6 pb-8">
          <Text className="text-2xl font-bold text-foreground">결제</Text>
        </View>

        <View className="px-6 py-6 gap-6">
          {/* Amount Input */}
          <View className="bg-surface rounded-lg p-4 border border-border">
            <Text className="text-foreground font-semibold mb-3">결제 금액</Text>
            <TextInput
              placeholder="금액을 입력하세요"
              placeholderTextColor="#999999"
              value={amount}
              onChangeText={setAmount}
              keyboardType="number-pad"
              editable={!loading}
              className="bg-background border border-border rounded-lg px-3 py-2 text-foreground"
            />
          </View>

          {/* Payment Methods */}
          <View className="gap-3">
            <Text className="text-foreground font-semibold">결제 방법</Text>

            <TouchableOpacity
              onPress={() => handlePayment("withdraw")}
              disabled={loading}
              className="bg-surface rounded-lg p-4 border border-border active:opacity-80"
            >
              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="text-foreground font-semibold">캐시 출금</Text>
                  <Text className="text-muted text-xs mt-1">최소 10,000원</Text>
                </View>
                <Text className="text-primary">→</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handlePayment("giftcard")}
              disabled={loading}
              className="bg-surface rounded-lg p-4 border border-border active:opacity-80"
            >
              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="text-foreground font-semibold">기프트카드 구매</Text>
                  <Text className="text-muted text-xs mt-1">최소 10,000원</Text>
                </View>
                <Text className="text-primary">→</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handlePayment("giftcon")}
              disabled={loading}
              className="bg-surface rounded-lg p-4 border border-border active:opacity-80"
            >
              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="text-foreground font-semibold">기프트콘 구매</Text>
                  <Text className="text-muted text-xs mt-1">최소 5,000원</Text>
                </View>
                <Text className="text-primary">→</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Info */}
          <View className="bg-surface rounded-lg p-4 border border-border">
            <Text className="text-muted text-sm leading-relaxed">
              💡 결제 신청 후 관리자의 승인을 기다립니다. 승인 완료 시 캐시가 차감됩니다.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
