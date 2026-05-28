import { ScrollView, Text, View, TouchableOpacity, Alert } from "react-native";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { checkBirthday, claimBirthdayReward } from "@/lib/birthday-service";

interface UserData {
  userId: string;
  name: string;
  birthday?: string;
  totalCash: number;
  transactions: Array<{
    id: string;
    type: "earn" | "spend";
    amount: number;
    description: string;
    date: string;
  }>;
  birthdayRewardClaimed: boolean;
}

export default function HomeScreen() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isBirthday, setIsBirthday] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const data = await AsyncStorage.getItem("userData");
      if (data) {
        const user = JSON.parse(data);
        setUserData(user);
        await checkBirthdayEvent();
      }
      setLoading(false);
    } catch (error) {
      console.error("Failed to load user data:", error);
      setLoading(false);
    }
  };

  const checkBirthdayEvent = async () => {
    const result = await checkBirthday();
    if (result.isBirthday && !result.isDeveloper) {
      setIsBirthday(true);
    }
  };

  const handleBirthdayReward = async () => {
    const result = await checkBirthday();
    if (!result.isBirthday) {
      Alert.alert("오류", "생일이 아닙니다");
      return;
    }

    const success = await claimBirthdayReward(result.rewardAmount);
    if (success) {
      const updatedData = await AsyncStorage.getItem("userData");
      if (updatedData) {
        setUserData(JSON.parse(updatedData));
      }
      setIsBirthday(false);

      Alert.alert(
        "축하합니다!",
        `생일 선물로 ${result.rewardAmount.toLocaleString()}원의 캐시를 받으셨습니다!`
      );
    }
  };

  const formatCash = (amount: number) => {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)}B`;
    } else if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`;
    }
    return amount.toString();
  };

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-foreground text-lg">로딩 중...</Text>
      </ScreenContainer>
    );
  }

  if (!userData) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-foreground text-lg">로그인이 필요합니다</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-0">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-background">
        {/* Header */}
        <View className="bg-primary px-6 pt-6 pb-8">
          <Text className="text-2xl font-bold text-foreground mb-2">CashBox</Text>
          <Text className="text-muted">캐시 리워드 앱</Text>
        </View>

        <View className="px-6 py-6 gap-6">
          {/* Birthday Banner */}
          {isBirthday && (
            <View className="bg-gradient-to-r from-primary to-yellow-400 rounded-2xl p-6 gap-3">
              <Text className="text-2xl">🎂</Text>
              <Text className="text-lg font-bold text-foreground">생일 축하합니다!</Text>
              <Text className="text-sm text-foreground opacity-90 mb-3">
                생일 선물로 캐시를 받으세요
              </Text>
              <TouchableOpacity
                onPress={handleBirthdayReward}
                className="bg-foreground rounded-lg py-3 items-center"
              >
                <Text className="text-primary font-semibold">선물 받기</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Cash Balance Card */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <Text className="text-muted text-sm mb-2">현재 캐시 잔액</Text>
            <Text className="text-5xl font-bold text-primary mb-4">
              {formatCash(userData.totalCash)}
            </Text>
            <Text className="text-foreground text-lg font-semibold">
              {userData.totalCash.toLocaleString()}원
            </Text>
          </View>

          {/* Action Buttons */}
          <View className="gap-3">
            <TouchableOpacity onPress={() => router.push('/payment')} className="bg-primary rounded-lg py-4 items-center active:opacity-80">
              <Text className="text-foreground font-semibold text-lg">출금하기</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/payment')} className="bg-surface border border-primary rounded-lg py-4 items-center active:opacity-80">
              <Text className="text-primary font-semibold text-lg">기프트 구매</Text>
            </TouchableOpacity>
          </View>

          {/* Recent Transactions */}
          <View className="gap-3">
            <Text className="text-foreground font-semibold text-lg">최근 거래</Text>
            {userData.transactions && userData.transactions.length > 0 ? (
              userData.transactions.slice(0, 3).map((transaction) => (
                <View key={transaction.id} className="bg-surface rounded-lg p-4 border border-border">
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-foreground font-medium">{transaction.description}</Text>
                    <Text
                      className={`font-semibold ${
                        transaction.type === "earn" ? "text-success" : "text-error"
                      }`}
                    >
                      {transaction.type === "earn" ? "+" : "-"}
                      {transaction.amount.toLocaleString()}원
                    </Text>
                  </View>
                  <Text className="text-muted text-xs">{transaction.date}</Text>
                </View>
              ))
            ) : (
              <View className="bg-surface rounded-lg p-4 border border-border items-center">
                <Text className="text-muted">거래 내역이 없습니다</Text>
              </View>
            )}
          </View>

          {/* Info */}
          <View className="bg-surface rounded-lg p-4 border border-border">
            <Text className="text-muted text-sm leading-relaxed">
              💡 캐시는 출금, 기프트카드, 기프트콘으로 사용할 수 있습니다.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
