import { ScrollView, Text, View, TouchableOpacity, Alert } from "react-native";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";

interface UserData {
  userId: string;
  name: string;
  email: string;
  birthday?: string;
  totalCash: number;
  totalEarned: number;
  totalSpent: number;
  joinDate: string;
}

export default function ProfileScreen() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const isDeveloper = userData?.email === "gymnkk99@gmail.com";

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

  const handleLogout = async () => {
    Alert.alert("로그아웃", "정말 로그아웃하시겠습니까?", [
      {
        text: "취소",
        onPress: () => {},
        style: "cancel",
      },
      {
        text: "로그아웃",
        onPress: async () => {
          try {
            await AsyncStorage.removeItem("userData");
            router.replace("/");
          } catch (error) {
            console.error("Failed to logout:", error);
          }
        },
        style: "destructive",
      },
    ]);
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
        <Text className="text-foreground text-lg">프로필 정보를 불러올 수 없습니다</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-0">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-background">
        {/* Header */}
        <View className="bg-primary px-6 pt-6 pb-8">
          <Text className="text-2xl font-bold text-foreground">프로필</Text>
        </View>

        <View className="px-6 py-6 gap-6">
          {/* User Info Card */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <View className="items-center mb-6">
              <View className="w-16 h-16 rounded-full bg-primary items-center justify-center mb-4">
                <Text className="text-2xl">👤</Text>
              </View>
              <Text className="text-2xl font-bold text-foreground">{userData.name}</Text>
              <Text className="text-muted text-sm mt-1">{userData.email}</Text>
            </View>

            <View className="border-t border-border pt-4 gap-3">
              <View className="flex-row justify-between">
                <Text className="text-muted">생일</Text>
                <Text className="text-foreground font-medium">
                  {userData.birthday || "미설정"}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-muted">가입일</Text>
                <Text className="text-foreground font-medium">{userData.joinDate}</Text>
              </View>
            </View>
          </View>

          {/* Statistics */}
          <View className="gap-3">
            <Text className="text-foreground font-semibold text-lg">통계</Text>
            <View className="flex-row gap-3">
              <View className="flex-1 bg-surface rounded-lg p-4 border border-border items-center">
                <Text className="text-muted text-xs mb-2">현재 캐시</Text>
                <Text className="text-primary font-bold text-lg">
                  {(userData.totalCash / 1000000).toFixed(1)}M
                </Text>
              </View>
              <View className="flex-1 bg-surface rounded-lg p-4 border border-border items-center">
                <Text className="text-muted text-xs mb-2">총 획득</Text>
                <Text className="text-success font-bold text-lg">
                  {(userData.totalEarned / 1000000).toFixed(1)}M
                </Text>
              </View>
              <View className="flex-1 bg-surface rounded-lg p-4 border border-border items-center">
                <Text className="text-muted text-xs mb-2">총 사용</Text>
                <Text className="text-error font-bold text-lg">
                  {(userData.totalSpent / 1000000).toFixed(1)}M
                </Text>
              </View>
            </View>
          </View>

          {/* Admin Panel */}
          {isDeveloper && (
            <View className="gap-3">
              <Text className="text-foreground font-semibold text-lg">관리자</Text>
              <TouchableOpacity
                onPress={() => router.push("/admin-payments")}
                className="bg-primary rounded-lg p-4 border border-border active:opacity-80"
              >
                <Text className="text-foreground font-semibold">결제 승인 관리</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Settings */}
          <View className="gap-3">
            <Text className="text-foreground font-semibold text-lg">설정</Text>
            <TouchableOpacity className="bg-surface rounded-lg p-4 border border-border active:opacity-80">
              <Text className="text-foreground font-medium">계정 설정</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-surface rounded-lg p-4 border border-border active:opacity-80">
              <Text className="text-foreground font-medium">개인정보 수정</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-surface rounded-lg p-4 border border-border active:opacity-80">
              <Text className="text-foreground font-medium">공지사항</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-surface rounded-lg p-4 border border-border active:opacity-80">
              <Text className="text-foreground font-medium">약관 및 정책</Text>
            </TouchableOpacity>
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-error rounded-lg py-4 items-center active:opacity-80"
          >
            <Text className="text-background font-semibold text-lg">로그아웃</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
