// Custom React Hooks for Finansal Takip Uygulaması

import { useState, useEffect, useCallback } from 'react';
import type { 
  Expense, 
  CreditCard, 
  Transaction, 
  Notification 
} from '../types';
import { 
  loadFromStorage, 
  saveToStorage, 
  STORAGE_KEYS, 
  generateNotifications 
} from '../utils';

// Local Storage Hook
export const useLocalStorage = <T>(key: string, defaultValue: T) => {
  const [value, setValue] = useState<T>(() => 
    loadFromStorage(key, defaultValue)
  );

  const setStoredValue = useCallback((newValue: T | ((prev: T) => T)) => {
    setValue(prev => {
      const valueToStore = newValue instanceof Function ? newValue(prev) : newValue;
      saveToStorage(key, valueToStore);
      return valueToStore;
    });
  }, [key]);

  return [value, setStoredValue] as const;
};

// Expenses Hook
export const useExpenses = () => {
  const [expenses, setExpenses] = useLocalStorage<Expense[]>(STORAGE_KEYS.EXPENSES, []);

  const addExpense = useCallback((expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString(36) + Math.random().toString(36).substr(2)
    };
    setExpenses(prev => [newExpense, ...prev]);
    return newExpense;
  }, [setExpenses]);

  const updateExpense = useCallback((id: string, updates: Partial<Expense>) => {
    setExpenses(prev => prev.map(expense => 
      expense.id === id ? { ...expense, ...updates } : expense
    ));
  }, [setExpenses]);

  const deleteExpense = useCallback((id: string) => {
    setExpenses(prev => prev.filter(expense => expense.id !== id));
  }, [setExpenses]);

  const getExpensesByMonth = useCallback((month: string) => {
    return expenses.filter(expense => expense.date.startsWith(month));
  }, [expenses]);

  const getTotalExpenses = useCallback(() => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  }, [expenses]);

  return {
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    getExpensesByMonth,
    getTotalExpenses
  };
};

// Credit Cards Hook
export const useCreditCards = () => {
  const [cards, setCards] = useLocalStorage<CreditCard[]>(STORAGE_KEYS.CREDIT_CARDS, []);

  const addCard = useCallback((card: Omit<CreditCard, 'id'>) => {
    const newCard: CreditCard = {
      ...card,
      id: Date.now().toString(36) + Math.random().toString(36).substr(2)
    };
    setCards(prev => [...prev, newCard]);
    return newCard;
  }, [setCards]);

  const updateCard = useCallback((id: string, updates: Partial<CreditCard>) => {
    setCards(prev => prev.map(card => 
      card.id === id ? { ...card, ...updates } : card
    ));
  }, [setCards]);

  const deleteCard = useCallback((id: string) => {
    setCards(prev => prev.filter(card => card.id !== id));
  }, [setCards]);

  const getCardById = useCallback((id: string) => {
    return cards.find(card => card.id === id);
  }, [cards]);

  const getTotalStats = useCallback(() => {
    return cards.reduce(
      (totals, card) => ({
        totalDebt: totals.totalDebt + card.currentDebt,
        totalLimit: totals.totalLimit + card.limit,
        totalMinPayment: totals.totalMinPayment + card.minimumPayment
      }),
      { totalDebt: 0, totalLimit: 0, totalMinPayment: 0 }
    );
  }, [cards]);

  return {
    cards,
    addCard,
    updateCard,
    deleteCard,
    getCardById,
    getTotalStats
  };
};

// Transactions Hook
export const useTransactions = () => {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>(
    STORAGE_KEYS.TRANSACTIONS, 
    []
  );

  const addTransaction = useCallback((transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(36) + Math.random().toString(36).substr(2)
    };
    setTransactions(prev => [newTransaction, ...prev]);
    return newTransaction;
  }, [setTransactions]);

  const getTransactionsByCard = useCallback((cardId: string) => {
    return transactions.filter(transaction => transaction.cardId === cardId);
  }, [transactions]);

  const getTransactionsByType = useCallback((type: 'payment' | 'expense') => {
    return transactions.filter(transaction => transaction.type === type);
  }, [transactions]);

  const getRecentTransactions = useCallback((limit: number = 10) => {
    return transactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }, [transactions]);

  return {
    transactions,
    addTransaction,
    getTransactionsByCard,
    getTransactionsByType,
    getRecentTransactions
  };
};

// Notifications Hook
export const useNotifications = () => {
  const [notificationSettings, setNotificationSettings] = useLocalStorage(
    STORAGE_KEYS.NOTIFICATION_SETTINGS,
    { warningDays: 3, enabled: true }
  );

  const { cards } = useCreditCards();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (notificationSettings.enabled) {
      const newNotifications = generateNotifications(cards, notificationSettings.warningDays);
      setNotifications(newNotifications);
    } else {
      setNotifications([]);
    }
  }, [cards, notificationSettings]);

  const updateSettings = useCallback((settings: Partial<typeof notificationSettings>) => {
    setNotificationSettings(prev => ({ ...prev, ...settings }));
  }, [setNotificationSettings]);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const getUrgentNotifications = useCallback(() => {
    return notifications.filter(notification => notification.daysLeft <= 1);
  }, [notifications]);

  return {
    notifications,
    notificationSettings,
    updateSettings,
    dismissNotification,
    getUrgentNotifications
  };
};

// Combined Financial Data Hook
export const useFinancialData = () => {
  const expenseHook = useExpenses();
  const cardHook = useCreditCards();
  const transactionHook = useTransactions();
  const notificationHook = useNotifications();

  const makePayment = useCallback((cardId: string, amount: number, description: string = 'Ödeme') => {
    const card = cardHook.getCardById(cardId);
    if (!card) return false;

    const newDebt = Math.max(0, card.currentDebt - amount);
    cardHook.updateCard(cardId, { currentDebt: newDebt });
    
    transactionHook.addTransaction({
      cardId,
      type: 'payment',
      amount,
      description,
      date: new Date().toISOString().split('T')[0]
    });

    return true;
  }, [cardHook, transactionHook]);

  const makeExpense = useCallback((cardId: string, amount: number, description: string) => {
    const card = cardHook.getCardById(cardId);
    if (!card) return false;

    const newDebt = card.currentDebt + amount;
    if (newDebt > card.limit) return false;

    cardHook.updateCard(cardId, { currentDebt: newDebt });
    
    transactionHook.addTransaction({
      cardId,
      type: 'expense',
      amount,
      description,
      date: new Date().toISOString().split('T')[0]
    });

    return true;
  }, [cardHook, transactionHook]);

  const payAllMinimums = useCallback(() => {
    const { cards } = cardHook;
    let totalPaid = 0;
    let successCount = 0;

    cards.forEach(card => {
      if (card.currentDebt > 0 && card.minimumPayment > 0) {
        const paymentAmount = Math.min(card.minimumPayment, card.currentDebt);
        if (makePayment(card.id, paymentAmount, 'Toplu Asgari Ödeme')) {
          totalPaid += paymentAmount;
          successCount++;
        }
      }
    });

    return { totalPaid, successCount };
  }, [cardHook, makePayment]);

  return {
    ...expenseHook,
    ...cardHook,
    ...transactionHook,
    ...notificationHook,
    makePayment,
    makeExpense,
    payAllMinimums
  };
};

// Window Size Hook for Responsive Design
export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    ...windowSize,
    isMobile: windowSize.width < 768,
    isTablet: windowSize.width >= 768 && windowSize.width < 1024,
    isDesktop: windowSize.width >= 1024
  };
};

// Dark Mode Hook (for future use)
export const useDarkMode = () => {
  const [isDarkMode, setIsDarkMode] = useLocalStorage('dark-mode', false);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, [setIsDarkMode]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return { isDarkMode, toggleDarkMode };
};

// Debounce Hook
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
