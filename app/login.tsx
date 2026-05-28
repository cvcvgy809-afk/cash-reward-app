import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { getOAuthProviders, mockOAuthLogin } from "@/lib/auth-service";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const providers = getOAuthProviders();

  const handleOAuthLogin = async (provider: string) => {
    if (!email.trim() || !name.trim()) {
      Alert.alert("오류", "이메일과 이름을 입력해주세요");
      return;
    }

    setLoading(true);
    try {
      await mockOAuthLogin(provider, email, name);
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Login failed:", error);
      Alert.alert("오류", "로그인에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer className="p-0">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-background">
        {/* Header */}
        <View className="bg-primary px-6 pt-12 pb-8 items-center">
          <Text className="text-5xl mb-4">💰</Text>
          <Text className="text-3xl font-bold text-foreground">CashBox</Text>
          <Text className="text-muted mt-2">캐시 리워드 앱</Text>
        </View>

        <View className="px-6 py-8 gap-6 flex-1">
          {/* Info */}
          <View className="bg-surface rounded-lg p-4 border border-border">
            <Text className="text-foreground font-semibold mb-2">환영합니다!</Text>
            <Text className="text-muted text-sm leading-relaxed">
              CashBox에 로그인하고 캐시를 획득하세요. 신규 사용자는 50만원의 캐시를 받습니다.
            </Text>
          </View>

          {/* User Info Input */}
          <View className="gap-3">
            <View>
              <Text className="text-foreground font-semibold mb-2">이메일</Text>
              <TextInput
                placeholder="example@email.com"
                placeholderTextColor="#999999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                editable={!loading}
                className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
              />
              <Text className="text-muted text-xs mt-1">
                개발자 이메일: gymnkk99@gmail.com (60억 캐시)
              </Text>
            </View>

            <View>
              <Text className="text-foreground font-semibold mb-2">이름</Text>
              <TextInput
                placeholder="홍길동"
                placeholderTextColor="#999999"
                value={name}
                onChangeText={setName}
                editable={!loading}
                className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
              />
            </View>
          </View>

          {/* OAuth Buttons */}
          <View className="gap-3">
            <Text className="text-foreground font-semibold">로그인 방법 선택</Text>
            {providers.map((provider) => (
              <TouchableOpacity
                key={provider.id}
                onPress={() => handleOAuthLogin(provider.id)}
                disabled={loading}
                className="bg-surface border border-primary rounded-lg py-4 items-center flex-row justify-center gap-3 active:opacity-80"
              >
                <Text className="text-2xl">{provider.icon}</Text>
                <Text className="text-foreground font-semibold">
                  {provider.name}로 로그인
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Terms */}
          <View className="gap-2 mt-auto">
            <Text className="text-muted text-xs text-center leading-relaxed">
              로그인함으로써 이용약관 및 개인정보 처리방침에 동의합니다.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
