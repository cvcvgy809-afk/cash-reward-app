import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ScreenContainer } from "@/components/screen-container";

interface Transaction {
  id: string;
  type: "earn" | "spend";
  amount: number;
  description: string;
  date: string;
}

interface UserData {
  userId: string;
  totalCash: number;
  transactions: Transaction[];
}

export default function CashScreen() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [filter, setFilter] = useState<"all" | "earn" | "spend">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const data = await AsyncStorage.getItem("userData");
      if (data) {
        setUserData(JSON.parse(data));
      }
      setLoading(false);
    } catch (error) {
      console.error("Failed to load user data:", error);
      setLoading(false);
    }
  };

  const getFilteredTransactions = () => {
    if (!userData?.transactions) return [];
    if (filter === "all") return userData.transactions;
    return userData.transactions.filter((t) => t.type === filter);
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

  const transactions = getFilteredTransactions();

  return (
    <ScreenContainer className="p-0">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-background">
        {/* Header */}
        <View className="bg-primary px-6 pt-6 pb-8">
          <Text className="text-2xl font-bold text-foreground mb-2">캐시</Text>
          <Text className="text-5xl font-bold text-foreground mt-4">
            {formatCash(userData?.totalCash || 0)}
          </Text>
          <Text className="text-foreground text-lg mt-2">
            {(userData?.totalCash || 0).toLocaleString()}원
          </Text>
        </View>

        <View className="px-6 py-6 gap-6">
          {/* Filter Buttons */}
          <View className="flex-row gap-2">
            {(["all", "earn", "spend"] as const).map((f) => (
              <TouchableOpacity
                key={f}
                onPress={() => setFilter(f)}
                className={`flex-1 py-2 px-3 rounded-lg ${
                  filter === f ? "bg-primary" : "bg-surface border border-border"
                }`}
              >
                <Text
                  className={`text-center font-semibold ${
                    filter === f ? "text-foreground" : "text-foreground"
                  }`}
                >
                  {f === "all" ? "전체" : f === "earn" ? "획득" : "사용"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Transactions List */}
          <View className="gap-3">
            {transactions.length > 0 ? (
              transactions.map((transaction) => (
                <View key={transaction.id} className="bg-surface rounded-lg p-4 border border-border">
                  <View className="flex-row justify-between items-start mb-2">
                    <Text className="text-foreground font-medium flex-1">
                      {transaction.description}
                    </Text>
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
              <View className="items-center justify-center py-8">
                <Text className="text-muted text-lg">거래 내역이 없습니다</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
