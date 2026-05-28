import AsyncStorage from "@react-native-async-storage/async-storage";

export interface BirthdayCheckResult {
  isBirthday: boolean;
  isDeveloper: boolean;
  rewardAmount: number;
}

export const checkBirthday = async (): Promise<BirthdayCheckResult> => {
  try {
    const userData = await AsyncStorage.getItem("userData");
    if (!userData) {
      return { isBirthday: false, isDeveloper: false, rewardAmount: 0 };
    }

    const user = JSON.parse(userData);
    if (!user.birthday || user.birthdayRewardClaimed) {
      return { isBirthday: false, isDeveloper: false, rewardAmount: 0 };
    }

    const today = new Date();
    const [year, month, day] = user.birthday.split("-");
    const userBirthday = new Date(today.getFullYear(), parseInt(month) - 1, parseInt(day));

    const isBirthday =
      today.getMonth() === userBirthday.getMonth() &&
      today.getDate() === userBirthday.getDate();

    const isDeveloper = user.email === "gymnkk99@gmail.com";
    const rewardAmount = isDeveloper ? 6000000000 : 5000000;

    return { isBirthday, isDeveloper, rewardAmount };
  } catch (error) {
    console.error("Failed to check birthday:", error);
    return { isBirthday: false, isDeveloper: false, rewardAmount: 0 };
  }
};

export const claimBirthdayReward = async (rewardAmount: number) => {
  try {
    const userData = await AsyncStorage.getItem("userData");
    if (!userData) return false;

    const user = JSON.parse(userData);
    const updatedUser = {
      ...user,
      totalCash: user.totalCash + rewardAmount,
      totalEarned: (user.totalEarned || 0) + rewardAmount,
      birthdayRewardClaimed: true,
      transactions: [
        {
          id: `birthday_${Date.now()}`,
          type: "earn",
          amount: rewardAmount,
          description: "생일 선물",
          date: new Date().toLocaleDateString("ko-KR"),
        },
        ...(user.transactions || []),
      ],
    };

    await AsyncStorage.setItem("userData", JSON.stringify(updatedUser));
    return true;
  } catch (error) {
    console.error("Failed to claim birthday reward:", error);
    return false;
  }
};

export const setBirthday = async (birthday: string) => {
  try {
    const userData = await AsyncStorage.getItem("userData");
    if (!userData) return false;

    const user = JSON.parse(userData);
    const updatedUser = { ...user, birthday };
    await AsyncStorage.setItem("userData", JSON.stringify(updatedUser));
    return true;
  } catch (error) {
    console.error("Failed to set birthday:", error);
    return false;
  }
};
