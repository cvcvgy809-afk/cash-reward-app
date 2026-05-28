import { useState, useEffect } from "react";
import {
  ScrollView,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Pressable,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ScreenContainer } from "@/components/screen-container";
import {
  purchaseGiftCard,
  purchaseGiftCon,
  createGiftCardRecord,
  createGiftConRecord,
} from "@/lib/gift-purchase-service";

interface UserData {
  userId: string;
  totalCash: number;
  bankAccount?: string;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  code?: string;
  date: string;
  status: string;
  expiryDate?: string;
}

export default function WithdrawScreen() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [activeTab, setActiveTab] = useState<"withdraw" | "giftcard" | "giftcon">(
    "withdraw"
  );
  const [loading, setLoading] = useState(true);
  const [selectedGiftCard, setSelectedGiftCard] = useState<string | null>(null);
  const [selectedGiftCon, setSelectedGiftCon] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const giftCards = [
    { id: "amazon", name: "Amazon", price: 10000 },
    { id: "apple", name: "Apple", price: 10000 },
    { id: "googleplay", name: "Google Play", price: 10000 },
    { id: "steam", name: "Steam", price: 10000 },
  ];

  const giftCons = [
    { id: "gs25", name: "GS25", price: 10000 },
    { id: "cu", name: "CU", price: 10000 },
    { id: "emart24", name: "이마트24", price: 10000 },
    { id: "convenience", name: "편의점", price: 10000 },
  ];

  useEffect(() => {
    loadUserData();
    loadTransactions();
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

  const loadTransactions = async () => {
    try {
      const data = await AsyncStorage.getItem("transactions");
      if (data) {
        setTransactions(JSON.parse(data));
      }
    } catch (error) {
      console.error("Failed to load transactions:", error);
    }
  };

  const saveTransactions = async (newTransactions: Transaction[]) => {
    try {
      await AsyncStorage.setItem("transactions", JSON.stringify(newTransactions));
      setTransactions(newTransactions);
    } catch (error) {
      console.error("Failed to save transactions:", error);
    }
  };

  const updateUserCash = async (newCash: number) => {
    if (!userData) return;
    const updatedUser = { ...userData, totalCash: newCash };
    setUserData(updatedUser);
    await AsyncStorage.setItem("userData", JSON.stringify(updatedUser));
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
      const newCash = userData.totalCash - amount;
      await updateUserCash(newCash);

      const withdrawal: Transaction = {
        id: `withdraw_${Date.now()}`,
        type: "출금",
        amount,
        date: new Date().toISOString().split("T")[0],
        status: "대기중",
      };

      const newTransactions = [withdrawal, ...transactions];
      await saveTransactions(newTransactions);

      setWithdrawAmount("");
      Alert.alert(
        "출금 신청 완료",
        `${amount.toLocaleString()}원이 출금 신청되었습니다.`
      );
    } catch (error: any) {
      Alert.alert("오류", error.message || "출금 신청 중 오류가 발생했습니다");
    }
  };

  const handleGiftCardPurchase = async (cardType: string) => {
    if (!userData) return;

    try {
      setLoading(true);
      const result = await purchaseGiftCard(
        cardType as "amazon" | "apple" | "googleplay" | "steam",
        userData.totalCash
      );

      if (result.success && result.code && result.expiryDate) {
        const newCash = userData.totalCash - 10000;
        await updateUserCash(newCash);

        const record = createGiftCardRecord(
          cardType as "amazon" | "apple" | "googleplay" | "steam",
          result.code,
          result.expiryDate
        );

        const newTransactions = [record as unknown as Transaction, ...transactions];
        await saveTransactions(newTransactions);

        Alert.alert(
          "구매 완료",
          `${result.message}\n\n코드: ${result.code}\n유효기간: ${result.expiryDate}`,
          [{ text: "확인", onPress: () => setSelectedGiftCard(null) }]
        );
      } else {
        Alert.alert("구매 실패", result.message);
      }
    } catch (error: any) {
      Alert.alert("오류", error.message || "구매 중 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  const handleGiftConPurchase = async (conType: string) => {
    if (!userData) return;

    try {
      setLoading(true);
      const result = await purchaseGiftCon(
        conType as "gs25" | "cu" | "emart24" | "convenience",
        userData.totalCash
      );

      if (result.success && result.code && result.expiryDate) {
        const newCash = userData.totalCash - 10000;
        await updateUserCash(newCash);

        const record = createGiftConRecord(
          conType as "gs25" | "cu" | "emart24" | "convenience",
          result.code,
          result.expiryDate
        );

        const newTransactions = [record as unknown as Transaction, ...transactions];
        await saveTransactions(newTransactions);

        Alert.alert(
          "구매 완료",
          `${result.message}\n\n코드: ${result.code}\n유효기간: ${result.expiryDate}`,
          [{ text: "확인", onPress: () => setSelectedGiftCon(null) }]
        );
      } else {
        Alert.alert("구매 실패", result.message);
      }
    } catch (error: any) {
      Alert.alert("오류", error.message || "구매 중 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color="#FFD700" />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-0">
      <ScrollView className="flex-1">
        {/* 탭 버튼 */}
        <View className="flex-row bg-background border-b border-border">
          <Pressable
            onPress={() => setActiveTab("withdraw")}
            className={`flex-1 py-4 items-center border-b-2 ${
              activeTab === "withdraw" ? "border-primary" : "border-transparent"
            }`}
          >
            <Text
              className={`font-semibold ${
                activeTab === "withdraw" ? "text-primary" : "text-muted"
              }`}
            >
              출금
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab("giftcard")}
            className={`flex-1 py-4 items-center border-b-2 ${
              activeTab === "giftcard" ? "border-primary" : "border-transparent"
            }`}
          >
            <Text
              className={`font-semibold ${
                activeTab === "giftcard" ? "text-primary" : "text-muted"
              }`}
            >
              기프트카드
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab("giftcon")}
            className={`flex-1 py-4 items-center border-b-2 ${
              activeTab === "giftcon" ? "border-primary" : "border-transparent"
            }`}
          >
            <Text
              className={`font-semibold ${
                activeTab === "giftcon" ? "text-primary" : "text-muted"
              }`}
            >
              기프트콘
            </Text>
          </Pressable>
        </View>

        {/* 출금 탭 */}
        {activeTab === "withdraw" && (
          <View className="p-6 gap-4">
            <Text className="text-2xl font-bold text-foreground">출금</Text>
            <Text className="text-sm text-muted">
              보유 캐시: {userData?.totalCash.toLocaleString()}원
            </Text>

            <View className="gap-3">
              <Text className="text-sm font-semibold text-foreground">출금 금액</Text>
              <TextInput
                className="bg-surface border border-border rounded-lg p-3 text-foreground"
                placeholder="출금 금액 입력"
                keyboardType="number-pad"
                value={withdrawAmount}
                onChangeText={setWithdrawAmount}
              />
            </View>

            <View className="gap-3">
              <Text className="text-sm font-semibold text-foreground">계좌 정보</Text>
              <TextInput
                className="bg-surface border border-border rounded-lg p-3 text-foreground"
                placeholder="계좌 입력"
                value={bankAccount}
                onChangeText={setBankAccount}
              />
            </View>

            <TouchableOpacity
              onPress={handleWithdraw}
              className="bg-primary rounded-lg py-3 items-center mt-4"
            >
              <Text className="text-background font-semibold">출금 신청</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 기프트카드 탭 */}
        {activeTab === "giftcard" && (
          <View className="p-6 gap-4">
            <Text className="text-2xl font-bold text-foreground">기프트카드</Text>
            <Text className="text-sm text-muted">
              보유 캐시: {userData?.totalCash.toLocaleString()}원
            </Text>

            <View className="gap-3">
              {giftCards.map((card) => (
                <Pressable
                  key={card.id}
                  onPress={() => handleGiftCardPurchase(card.id)}
                  className="bg-surface border border-border rounded-lg p-4 flex-row justify-between items-center"
                >
                  <View>
                    <Text className="text-lg font-semibold text-foreground">
                      {card.name}
                    </Text>
                    <Text className="text-sm text-muted">{card.price.toLocaleString()}원</Text>
                  </View>
                  <Text className="text-primary font-semibold">구매</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* 기프트콘 탭 */}
        {activeTab === "giftcon" && (
          <View className="p-6 gap-4">
            <Text className="text-2xl font-bold text-foreground">기프트콘</Text>
            <Text className="text-sm text-muted">
              보유 캐시: {userData?.totalCash.toLocaleString()}원
            </Text>

            <View className="gap-3">
              {giftCons.map((con) => (
                <Pressable
                  key={con.id}
                  onPress={() => handleGiftConPurchase(con.id)}
                  className="bg-surface border border-border rounded-lg p-4 flex-row justify-between items-center"
                >
                  <View>
                    <Text className="text-lg font-semibold text-foreground">
                      {con.name}
                    </Text>
                    <Text className="text-sm text-muted">{con.price.toLocaleString()}원</Text>
                  </View>
                  <Text className="text-primary font-semibold">구매</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
