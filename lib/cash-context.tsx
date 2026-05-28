import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Transaction {
  id: string;
  type: "earn" | "spend";
  amount: number;
  description: string;
  date: string;
}

export interface CashContextType {
  totalCash: number;
  transactions: Transaction[];
  addTransaction: (type: "earn" | "spend", amount: number, description: string) => Promise<void>;
  updateCash: (amount: number) => Promise<void>;
  loadCashData: () => Promise<void>;
}

const CashContext = createContext<CashContextType | undefined>(undefined);

export const CashProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [totalCash, setTotalCash] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    loadCashData();
  }, []);

  const loadCashData = async () => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      if (userData) {
        const user = JSON.parse(userData);
        setTotalCash(user.totalCash || 0);
        setTransactions(user.transactions || []);
      }
    } catch (error) {
      console.error("Failed to load cash data:", error);
    }
  };

  const addTransaction = async (
    type: "earn" | "spend",
    amount: number,
    description: string
  ) => {
    try {
      const newTransaction: Transaction = {
        id: `${Date.now()}`,
        type,
        amount,
        description,
        date: new Date().toLocaleDateString("ko-KR"),
      };

      const newTransactions = [newTransaction, ...transactions];
      const newTotalCash = type === "earn" ? totalCash + amount : totalCash - amount;

      setTransactions(newTransactions);
      setTotalCash(newTotalCash);

      const userData = await AsyncStorage.getItem("userData");
      if (userData) {
        const user = JSON.parse(userData);
        const updatedUser = {
          ...user,
          totalCash: newTotalCash,
          transactions: newTransactions,
          totalEarned: type === "earn" ? (user.totalEarned || 0) + amount : user.totalEarned || 0,
          totalSpent: type === "spend" ? (user.totalSpent || 0) + amount : user.totalSpent || 0,
        };
        await AsyncStorage.setItem("userData", JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error("Failed to add transaction:", error);
    }
  };

  const updateCash = async (amount: number) => {
    try {
      setTotalCash(amount);
      const userData = await AsyncStorage.getItem("userData");
      if (userData) {
        const user = JSON.parse(userData);
        const updatedUser = { ...user, totalCash: amount };
        await AsyncStorage.setItem("userData", JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error("Failed to update cash:", error);
    }
  };

  return (
    <CashContext.Provider value={{ totalCash, transactions, addTransaction, updateCash, loadCashData }}>
      {children}
    </CashContext.Provider>
  );
};

export const useCash = () => {
  const context = useContext(CashContext);
  if (!context) {
    throw new Error("useCash must be used within CashProvider");
  }
  return context;
};
