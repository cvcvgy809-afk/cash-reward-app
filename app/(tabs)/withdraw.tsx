import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert } from "react-native";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ScreenContainer } from "@/components/screen-container";
import {
  requestWithdrawal,
  purchaseGiftCard,
  purchaseGiftCon,
  getWithdrawals,
} from "@/lib/payment-service";

interface UserData {
  userId: string;
  totalCash: number;
  bankAccount?: string;
}

export default function WithdrawScreen() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [activeTab, setActiveTab] = useState<"withdraw" | "giftcard" | "giftcon">(
    "withdraw"
  );
  const [loading, setLoading] = useState(true);
  const [giftCardAmount, setGiftCardAmount] = useState("");
  const [giftConAmount, setGiftConAmount] = useState("");

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const data = await AsyncStorage.getItem("userData");
      if (data) {
        const user = JSON.parse(data);
        setUserData(user);
        if (user.bankAccount) {
          setBankAccount(user.bankAccount);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error("Failed to load user data:", error);
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!userData) return;

    const amount = parseInt(withdrawAmount);
    if (isNaN(amount) || amount < 10000) {
      Alert.alert("오류", "최소 10,000원 이상 출금 가능합니다");
      return;
    }

    if (amount > userData.totalCash) {
      Alert.alert("오류", "캐시가 부족합니다");
      return;
    }

    if (!bankAccount) {
      Alert.alert("오류", "계좌를 등록해주세요");
      return;
    }

    try {
      const withdrawal = await requestWithdrawal(amount, bankAccount);
      setWithdrawAmount("");
      await loadUserData();

      if (withdrawal && typeof withdrawal !== "boolean") {
        Alert.alert(
          "출금 신청 완료",
          `${amount.toLocaleString()}원이 출금 신청되었습니다.\n예상 입금일: ${withdrawal.expectedDate}`
        );
      }
    } catch (error: any) {
      Alert.alert("오류", error.message || "출금 신청에 실패했습니다");
    }
  };

  const handleGiftCardPurchase = async (type: string) => {
    if (!userData) return;

    const amount = parseInt(giftCardAmount);
    if (isNaN(amount) || amount < 10000) {
      Alert.alert("오류", "최소 10,000원 이상 구매 가능합니다");
      return;
    }

    if (amount > userData.totalCash) {
      Alert.alert("오류", "캐시가 부족합니다");
      return;
    }

    try {
      const purchase = await purchaseGiftCard(type, amount);
      setGiftCardAmount("");
      await loadUserData();

      if (purchase && typeof purchase !== "boolean") {
        Alert.alert(
          "기프트카드 구매 완료",
          `코드: ${purchase.code}\n\n코드를 복사하여 ${type}에서 사용하세요.`
        );
      }
    } catch (error: any) {
      Alert.alert("오류", error.message || "구매에 실패했습니다");
    }
  };

  const handleGiftConPurchase = async (type: string) => {
    if (!userData) return;

    const amount = parseInt(giftConAmount);
    if (isNaN(amount) || amount < 5000) {
      Alert.alert("오류", "최소 5,000원 이상 구매 가능합니다");
      return;
    }

    if (amount > userData.totalCash) {
      Alert.alert("오류", "캐시가 부족합니다");
      return;
    }

    try {
      const purchase = await purchaseGiftCon(type, amount);
      setGiftConAmount("");
      await loadUserData();

      if (purchase && typeof purchase !== "boolean") {
        Alert.alert(
          "기프트콘 구매 완료",
          `번호: ${purchase.number}\n\n번호를 ${type}에 입력하여 사용하세요.`
        );
      }
    } catch (error: any) {
      Alert.alert("오류", error.message || "구매에 실패했습니다");
    }
  };

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-foreground text-lg">로딩 중...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-0">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-background">
        {/* Header */}
        <View className="bg-primary px-6 pt-6 pb-8">
          <Text className="text-2xl font-bold text-foreground">출금 & 기프트</Text>
        </View>

        <View className="px-6 py-6 gap-6">
          {/* Tab Buttons */}
          <View className="flex-row gap-2">
            {(["withdraw", "giftcard", "giftcon"] as const).map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                className={`flex-1 py-2 px-3 rounded-lg ${
                  activeTab === tab ? "bg-primary" : "bg-surface border border-border"
                }`}
              >
                <Text className="text-center font-semibold text-foreground text-xs">
                  {tab === "withdraw" ? "출금" : tab === "giftcard" ? "기프트카드" : "기프트콘"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Withdraw Tab */}
          {activeTab === "withdraw" && (
            <View className="gap-4">
              <View className="bg-surface rounded-lg p-4 border border-border">
                <Text className="text-foreground font-semibold mb-3">계좌 정보</Text>
                <TextInput
                  placeholder="계좌번호 (예: 123-456-789012)"
                  placeholderTextColor="#999999"
                  value={bankAccount}
                  onChangeText={setBankAccount}
                  className="bg-background border border-border rounded-lg px-3 py-2 text-foreground mb-3"
                />
                <Text className="text-muted text-xs">
                  계좌는 안전하게 저장되며 출금 시에만 사용됩니다.
                </Text>
              </View>

              <View className="bg-surface rounded-lg p-4 border border-border">
                <Text className="text-foreground font-semibold mb-3">출금 금액</Text>
                <TextInput
                  placeholder="출금할 금액을 입력하세요"
                  placeholderTextColor="#999999"
                  value={withdrawAmount}
                  onChangeText={setWithdrawAmount}
                  keyboardType="number-pad"
                  className="bg-background border border-border rounded-lg px-3 py-2 text-foreground mb-2"
                />
                <Text className="text-muted text-xs mb-3">최소 출금액: 10,000원</Text>
                <Text className="text-muted text-xs">
                  현재 캐시: {(userData?.totalCash || 0).toLocaleString()}원
                </Text>
              </View>

              <TouchableOpacity
                onPress={handleWithdraw}
                className="bg-primary rounded-lg py-4 items-center active:opacity-80"
              >
                <Text className="text-foreground font-semibold text-lg">출금 신청</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Gift Card Tab */}
          {activeTab === "giftcard" && (
            <View className="gap-4">
              <View className="bg-surface rounded-lg p-4 border border-border">
                <Text className="text-foreground font-semibold mb-3">금액 선택</Text>
                <TextInput
                  placeholder="금액을 입력하세요"
                  placeholderTextColor="#999999"
                  value={giftCardAmount}
                  onChangeText={setGiftCardAmount}
                  keyboardType="number-pad"
                  className="bg-background border border-border rounded-lg px-3 py-2 text-foreground mb-2"
                />
                <Text className="text-muted text-xs">최소 구매액: 10,000원</Text>
              </View>

              <View className="gap-2">
                {["Amazon", "Apple", "Google Play", "Steam"].map((card) => (
                  <TouchableOpacity
                    key={card}
                    onPress={() => handleGiftCardPurchase(card)}
                    className="bg-surface rounded-lg p-4 border border-border active:opacity-80"
                  >
                    <View className="flex-row justify-between items-center">
                      <Text className="text-foreground font-semibold">{card}</Text>
                      <Text className="text-primary">→</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Gift Con Tab */}
          {activeTab === "giftcon" && (
            <View className="gap-4">
              <View className="bg-surface rounded-lg p-4 border border-border">
                <Text className="text-foreground font-semibold mb-3">금액 선택</Text>
                <TextInput
                  placeholder="금액을 입력하세요"
                  placeholderTextColor="#999999"
                  value={giftConAmount}
                  onChangeText={setGiftConAmount}
                  keyboardType="number-pad"
                  className="bg-background border border-border rounded-lg px-3 py-2 text-foreground mb-2"
                />
                <Text className="text-muted text-xs">최소 구매액: 5,000원</Text>
              </View>

              <View className="gap-2">
                {["GS25", "CU", "이마트24", "편의점"].map((con) => (
                  <TouchableOpacity
                    key={con}
                    onPress={() => handleGiftConPurchase(con)}
                    className="bg-surface rounded-lg p-4 border border-border active:opacity-80"
                  >
                    <View className="flex-row justify-between items-center">
                      <Text className="text-foreground font-semibold">{con}</Text>
                      <Text className="text-primary">→</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
