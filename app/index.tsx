import { useEffect } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";

export default function IndexScreen() {
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      if (userData) {
        router.replace("/(tabs)");
      } else {
        router.replace("/login");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      router.replace("/login");
    }
  };

  return (
    <ScreenContainer className="items-center justify-center">
      <View className="items-center gap-4">
        <Text className="text-5xl">💰</Text>
        <Text className="text-2xl font-bold text-foreground">CashBox</Text>
        <Text className="text-muted">로딩 중...</Text>
      </View>
    </ScreenContainer>
  );
}
