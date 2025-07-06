// Utility Functions for Finansal Takip Uygulaması

import type { 
  Expense, 
  CreditCard, 
  Transaction, 
  Notification, 
  ExpenseCategory, 
  MonthlyStats,
  CardStats 
} from './types';

// Local Storage Keys
export const STORAGE_KEYS = {
  EXPENSES: 'finansal-takip-expenses',
  CREDIT_CARDS: 'finansal-takip-credit-cards',
  TRANSACTIONS: 'finansal-takip-transactions',
  NOTIFICATION_SETTINGS: 'finansal-takip-notification-settings'
} as const;

// Local Storage Helper Functions
export const saveToStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return defaultValue;
  }
};

export const removeFromStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
};

// Date Helper Functions
export const getCurrentDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const getCurrentMonth = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
};

export const formatDateTurkish = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const getMonthName = (monthIndex: number): string => {
  const months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];
  return months[monthIndex] || '';
};

export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

export const getFirstDayOfMonth = (year: number, month: number): number => {
  return new Date(year, month, 1).getDay();
};

// Calculation Helper Functions
export const calculateTotalExpenses = (expenses: Expense[]): number => {
  return expenses.reduce((total, expense) => total + expense.amount, 0);
};

export const calculateTotalByCategory = (
  expenses: Expense[], 
  category: ExpenseCategory
): number => {
  return expenses
    .filter(expense => expense.category === category)
    .reduce((total, expense) => total + expense.amount, 0);
};

export const calculateMonthlyExpenses = (expenses: Expense[], month: string): number => {
  return expenses
    .filter(expense => expense.date.startsWith(month))
    .reduce((total, expense) => total + expense.amount, 0);
};

export const calculateCreditCardTotal = (cards: CreditCard[]): {
  totalDebt: number;
  totalLimit: number;
  totalMinPayment: number;
} => {
  return cards.reduce(
    (totals, card) => ({
      totalDebt: totals.totalDebt + card.currentDebt,
      totalLimit: totals.totalLimit + card.limit,
      totalMinPayment: totals.totalMinPayment + card.minimumPayment
    }),
    { totalDebt: 0, totalLimit: 0, totalMinPayment: 0 }
  );
};

export const getAvailableCredit = (card: CreditCard): number => {
  return Math.max(0, card.limit - card.currentDebt);
};

export const getUsagePercentage = (card: CreditCard): number => {
  return card.limit > 0 ? Math.min((card.currentDebt / card.limit) * 100, 100) : 0;
};

// Notification Helper Functions
export const generateNotifications = (
  cards: CreditCard[], 
  warningDays: number = 3
): Notification[] => {
  const notifications: Notification[] = [];
  const today = new Date();
  
  cards.forEach(card => {
    if (card.currentDebt > 0) {
      const daysUntilDue = getDaysUntilDate(card.dueDate);
      
      if (daysUntilDue <= warningDays && daysUntilDue >= 0) {
        const dueDate = new Date(today.getFullYear(), today.getMonth(), card.dueDate);
        if (dueDate < today) {
          dueDate.setMonth(dueDate.getMonth() + 1);
        }
        
        notifications.push({
          id: `notification-${card.id}-${Date.now()}`,
          cardId: card.id,
          cardName: card.name,
          type: 'payment-due',
          daysLeft: daysUntilDue,
          amount: card.minimumPayment,
          dueDate: dueDate.toISOString().split('T')[0]
        });
      }
    }
  });
  
  return notifications;
};

export const getDaysUntilDate = (targetDay: number): number => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const currentDay = today.getDate();
  
  let targetDate = new Date(currentYear, currentMonth, targetDay);
  
  // Eğer hedef gün bu ayda geçmişse, gelecek aya al
  if (targetDay < currentDay) {
    targetDate = new Date(currentYear, currentMonth + 1, targetDay);
  }
  
  const timeDiff = targetDate.getTime() - today.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

// Statistics Helper Functions
export const generateMonthlyStats = (
  transactions: Transaction[], 
  months: number = 6
): MonthlyStats[] => {
  const stats: MonthlyStats[] = [];
  const today = new Date();
  
  for (let i = months - 1; i >= 0; i--) {
    const targetDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthKey = `${targetDate.getFullYear()}-${(targetDate.getMonth() + 1).toString().padStart(2, '0')}`;
    
    const monthTransactions = transactions.filter(t => t.date.startsWith(monthKey));
    const expenses = monthTransactions.filter(t => t.type === 'expense');
    const payments = monthTransactions.filter(t => t.type === 'payment');
    
    stats.push({
      month: getMonthName(targetDate.getMonth()),
      totalExpenses: expenses.reduce((sum, t) => sum + t.amount, 0),
      totalPayments: payments.reduce((sum, t) => sum + t.amount, 0),
      transactionCount: monthTransactions.length
    });
  }
  
  return stats;
};

export const generateCardStats = (
  transactions: Transaction[], 
  cards: CreditCard[]
): CardStats[] => {
  return cards.map(card => {
    const cardTransactions = transactions.filter(t => t.cardId === card.id);
    const expenses = cardTransactions.filter(t => t.type === 'expense');
    const payments = cardTransactions.filter(t => t.type === 'payment');
    
    return {
      cardId: card.id,
      cardName: card.name,
      totalExpenses: expenses.reduce((sum, t) => sum + t.amount, 0),
      totalPayments: payments.reduce((sum, t) => sum + t.amount, 0),
      transactionCount: cardTransactions.length
    };
  });
};

// Validation Helper Functions
export const validateExpense = (expense: Partial<Expense>): string[] => {
  const errors: string[] = [];
  
  if (!expense.amount || expense.amount <= 0) {
    errors.push('Tutar 0\'dan büyük olmalıdır');
  }
  
  if (!expense.category) {
    errors.push('Kategori seçilmelidir');
  }
  
  if (!expense.description?.trim()) {
    errors.push('Açıklama girilmelidir');
  }
  
  if (!expense.date) {
    errors.push('Tarih seçilmelidir');
  }
  
  return errors;
};

export const validateCreditCard = (card: Partial<CreditCard>): string[] => {
  const errors: string[] = [];
  
  if (!card.name?.trim()) {
    errors.push('Kart adı girilmelidir');
  }
  
  if (!card.bank?.trim()) {
    errors.push('Banka adı girilmelidir');
  }
  
  if (!card.limit || card.limit <= 0) {
    errors.push('Kart limiti 0\'dan büyük olmalıdır');
  }
  
  if (card.currentDebt !== undefined && card.currentDebt < 0) {
    errors.push('Mevcut borç negatif olamaz');
  }
  
  if (card.minimumPayment !== undefined && card.minimumPayment < 0) {
    errors.push('Asgari ödeme negatif olamaz');
  }
  
  if (!card.cutoffDate || card.cutoffDate < 1 || card.cutoffDate > 31) {
    errors.push('Hesap kesim tarihi 1-31 arasında olmalıdır');
  }
  
  if (!card.dueDate || card.dueDate < 1 || card.dueDate > 31) {
    errors.push('Son ödeme tarihi 1-31 arasında olmalıdır');
  }
  
  if (!card.cardType) {
    errors.push('Kart tipi seçilmelidir');
  }
  
  if (!card.color) {
    errors.push('Kart rengi seçilmelidir');
  }
  
  return errors;
};

// Search and Filter Helper Functions
export const filterExpensesByMonth = (expenses: Expense[], month: string): Expense[] => {
  return expenses.filter(expense => expense.date.startsWith(month));
};

export const filterExpensesByCategory = (
  expenses: Expense[], 
  category: ExpenseCategory
): Expense[] => {
  return expenses.filter(expense => expense.category === category);
};

export const searchExpenses = (expenses: Expense[], query: string): Expense[] => {
  const lowercaseQuery = query.toLowerCase().trim();
  if (!lowercaseQuery) return expenses;
  
  return expenses.filter(expense =>
    expense.description.toLowerCase().includes(lowercaseQuery)
  );
};

export const filterTransactionsByCard = (
  transactions: Transaction[], 
  cardId: string
): Transaction[] => {
  return transactions.filter(transaction => transaction.cardId === cardId);
};

export const filterTransactionsByType = (
  transactions: Transaction[], 
  type: 'payment' | 'expense'
): Transaction[] => {
  return transactions.filter(transaction => transaction.type === type);
};

// Sorting Helper Functions
export const sortExpensesByDate = (expenses: Expense[], ascending: boolean = false): Expense[] => {
  return [...expenses].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return ascending ? dateA - dateB : dateB - dateA;
  });
};

export const sortTransactionsByDate = (
  transactions: Transaction[], 
  ascending: boolean = false
): Transaction[] => {
  return [...transactions].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return ascending ? dateA - dateB : dateB - dateA;
  });
};

export const sortCardsByName = (cards: CreditCard[]): CreditCard[] => {
  return [...cards].sort((a, b) => a.name.localeCompare(b.name, 'tr'));
};

export const sortCardsByDebt = (cards: CreditCard[], ascending: boolean = false): CreditCard[] => {
  return [...cards].sort((a, b) => 
    ascending ? a.currentDebt - b.currentDebt : b.currentDebt - a.currentDebt
  );
};

// Export/Import Helper Functions
export const exportData = () => {
  const data = {
    expenses: loadFromStorage(STORAGE_KEYS.EXPENSES, []),
    creditCards: loadFromStorage(STORAGE_KEYS.CREDIT_CARDS, []),
    transactions: loadFromStorage(STORAGE_KEYS.TRANSACTIONS, []),
    exportDate: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { 
    type: 'application/json' 
  });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `finansal-takip-yedek-${getCurrentDate()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const importData = (file: File): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        if (data.expenses) {
          saveToStorage(STORAGE_KEYS.EXPENSES, data.expenses);
        }
        if (data.creditCards) {
          saveToStorage(STORAGE_KEYS.CREDIT_CARDS, data.creditCards);
        }
        if (data.transactions) {
          saveToStorage(STORAGE_KEYS.TRANSACTIONS, data.transactions);
        }
        
        resolve(true);
      } catch (error) {
        reject(new Error('Geçersiz dosya formatı'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Dosya okuma hatası'));
    };
    
    reader.readAsText(file);
  });
};
