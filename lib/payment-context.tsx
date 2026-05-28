import React, { createContext, useContext, useState, ReactNode } from "react";

export interface PaymentState {
  tid: string | null;
  orderId: string | null;
  amount: number;
  itemName: string;
  status: "idle" | "ready" | "pending" | "completed" | "failed" | "cancelled";
  error: string | null;
}

export interface PaymentContextType {
  paymentState: PaymentState;
  setPaymentState: (state: PaymentState) => void;
  resetPaymentState: () => void;
  updatePaymentStatus: (status: PaymentState["status"]) => void;
  setPaymentError: (error: string | null) => void;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

const initialState: PaymentState = {
  tid: null,
  orderId: null,
  amount: 0,
  itemName: "",
  status: "idle",
  error: null,
};

export const PaymentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [paymentState, setPaymentState] = useState<PaymentState>(initialState);

  const resetPaymentState = () => {
    setPaymentState(initialState);
  };

  const updatePaymentStatus = (status: PaymentState["status"]) => {
    setPaymentState((prev) => ({ ...prev, status }));
  };

  const setPaymentError = (error: string | null) => {
    setPaymentState((prev) => ({ ...prev, error, status: error ? "failed" : "idle" }));
  };

  return (
    <PaymentContext.Provider
      value={{ paymentState, setPaymentState, resetPaymentState, updatePaymentStatus, setPaymentError }}
    >
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error("usePayment must be used within PaymentProvider");
  }
  return context;
};
