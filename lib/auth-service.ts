import AsyncStorage from "@react-native-async-storage/async-storage";

export interface OAuthProvider {
  id: string;
  name: string;
  icon: string;
}

export interface UserData {
  userId: string;
  name: string;
  email: string;
  provider: string;
  birthday?: string;
  totalCash: number;
  totalEarned: number;
  totalSpent: number;
  transactions: Array<{
    id: string;
    type: "earn" | "spend";
    amount: number;
    description: string;
    date: string;
  }>;
  joinDate: string;
  bankAccount?: string;
  birthdayRewardClaimed: boolean;
}

const OAUTH_PROVIDERS: OAuthProvider[] = [
  { id: "google", name: "Google", icon: "🔍" },
  { id: "naver", name: "Naver", icon: "N" },
  { id: "kakao", name: "Kakao", icon: "K" },
  { id: "facebook", name: "Facebook", icon: "f" },
];

export const getOAuthProviders = () => OAUTH_PROVIDERS;

export const mockOAuthLogin = async (
  provider: string,
  email: string,
  name: string
): Promise<UserData> => {
  const userId = `${provider}_${Date.now()}`;
  const isDeveloper = email === "gymnkk99@gmail.com";

  const newUser: UserData = {
    userId,
    name,
    email,
    provider,
    totalCash: isDeveloper ? 6000000000 : 500000,
    totalEarned: isDeveloper ? 6000000000 : 500000,
    totalSpent: 0,
    transactions: [
      {
        id: "1",
        type: "earn",
        amount: isDeveloper ? 6000000000 : 500000,
        description: isDeveloper ? "개발자 보너스" : "신규 사용자 보너스",
        date: new Date().toLocaleDateString("ko-KR"),
      },
    ],
    joinDate: new Date().toLocaleDateString("ko-KR"),
    birthdayRewardClaimed: false,
  };

  await AsyncStorage.setItem("userData", JSON.stringify(newUser));
  return newUser;
};

export const getUserData = async (): Promise<UserData | null> => {
  try {
    const data = await AsyncStorage.getItem("userData");
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Failed to get user data:", error);
    return null;
  }
};

export const logout = async () => {
  try {
    await AsyncStorage.removeItem("userData");
  } catch (error) {
    console.error("Failed to logout:", error);
  }
};

export const updateUserData = async (updates: Partial<UserData>) => {
  try {
    const current = await getUserData();
    if (current) {
      const updated = { ...current, ...updates };
      await AsyncStorage.setItem("userData", JSON.stringify(updated));
      return updated;
    }
  } catch (error) {
    console.error("Failed to update user data:", error);
  }
};
