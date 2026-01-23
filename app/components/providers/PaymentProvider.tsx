'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { PaymentModal } from './../common/PaymentModal';
import { PaymentSessionData, PaymentMethod } from '@/types/payment';

// Define context type
interface PaymentContextType {
  showPaymentModal: (sessionData: PaymentSessionData) => void;
  hidePaymentModal: () => void;
  isPaymentModalOpen: boolean;
  selectedPaymentMethod: PaymentMethod;
  setPaymentMethod: (method: PaymentMethod) => void;
  currentSession: PaymentSessionData | null;
}

// Create context
const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

// Provider component
export const PaymentProvider = ({ children }: { children: ReactNode }) => {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [currentSession, setCurrentSession] = useState<PaymentSessionData | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('crypto');

  // Show payment modal with session data
  const showPaymentModal = (sessionData: PaymentSessionData) => {
    setCurrentSession(sessionData);
    setIsPaymentModalOpen(true);
  };

  // Hide payment modal
  const hidePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setCurrentSession(null);
  };

  // Set payment method
  const handleSetPaymentMethod = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
  };

  return (
    <PaymentContext.Provider
      value={{
        showPaymentModal,
        hidePaymentModal,
        isPaymentModalOpen,
        selectedPaymentMethod,
        setPaymentMethod: handleSetPaymentMethod,
        currentSession,
      }}
    >
      {children}
      {currentSession && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={hidePaymentModal}
          sessionData={currentSession}
        />
      )}
    </PaymentContext.Provider>
  );
};

// Custom hook for using payment context
export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within PaymentProvider');
  }
  return context;
};
