// Global Type Definitions for Finansal Takip Uygulaması

export interface Expense {
  id: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  date: string;
}

export interface CreditCard {
  id: string;
  name: string;
  bank: string;
  limit: number;
  currentDebt: number;
  minimumPayment: number;
  cutoffDate: number; // günü (1-31)
  dueDate: number; // günü (1-31)
  cardType: CardType;
  color: CardColor;
  description?: string;
}

export interface Transaction {
  id: string;
  cardId: string;
  type: 'payment' | 'expense';
  amount: number;
  description: string;
  date: string;
}

export interface Notification {
  id: string;
  cardId: string;
  cardName: string;
  type: 'payment-due';
  daysLeft: number;
  amount: number;
  dueDate: string;
}

export type ExpenseCategory =
  | 'market'
  | 'transport'
  | 'bills'
  | 'food'
  | 'clothing'
  | 'health'
  | 'entertainment'
  | 'general';

export type CardType =
  | 'visa'
  | 'mastercard'
  | 'amex'
  | 'troy';

export type CardColor =
  | 'blue'
  | 'red'
  | 'green'
  | 'purple'
  | 'orange'
  | 'pink'
  | 'gray'
  | 'gold';

export type TabType = 'expenses' | 'credit-cards';
export type CreditCardTab = 'summary' | 'calendar' | 'cards' | 'history';

export interface CategoryInfo {
  name: string;
  emoji: string;
  color: string;
}

export interface CardTypeInfo {
  name: string;
  logo: string;
}

export interface CardColorInfo {
  name: string;
  primary: string;
  secondary: string;
}

export interface MonthlyStats {
  month: string;
  totalExpenses: number;
  totalPayments: number;
  transactionCount: number;
}

export interface CardStats {
  cardId: string;
  cardName: string;
  totalExpenses: number;
  totalPayments: number;
  transactionCount: number;
}

// Utility Types
export type FormData<T> = Partial<T>;
export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

// Constants
export const EXPENSE_CATEGORIES: Record<ExpenseCategory, CategoryInfo> = {
  market: { name: 'Market', emoji: '🛒', color: '#ef4444' },
  transport: { name: 'Ulaşım', emoji: '🚗', color: '#3b82f6' },
  bills: { name: 'Faturalar', emoji: '📄', color: '#f59e0b' },
  food: { name: 'Yemek', emoji: '🍽️', color: '#10b981' },
  clothing: { name: 'Giyim', emoji: '👔', color: '#8b5cf6' },
  health: { name: 'Sağlık', emoji: '⚕️', color: '#06b6d4' },
  entertainment: { name: 'Eğlence', emoji: '🎮', color: '#f97316' },
  general: { name: 'Genel', emoji: '📋', color: '#6b7280' }
};

export const CARD_TYPES: Record<CardType, CardTypeInfo> = {
  visa: { name: 'Visa', logo: '💳' },
  mastercard: { name: 'MasterCard', logo: '💳' },
  amex: { name: 'American Express', logo: '💳' },
  troy: { name: 'Troy', logo: '💳' }
};

export const CARD_COLORS: Record<CardColor, CardColorInfo> = {
  blue: { name: 'Mavi', primary: '#3b82f6', secondary: '#dbeafe' },
  red: { name: 'Kırmızı', primary: '#ef4444', secondary: '#fee2e2' },
  green: { name: 'Yeşil', primary: '#10b981', secondary: '#d1fae5' },
  purple: { name: 'Mor', primary: '#8b5cf6', secondary: '#ede9fe' },
  orange: { name: 'Turuncu', primary: '#f97316', secondary: '#fed7aa' },
  pink: { name: 'Pembe', primary: '#ec4899', secondary: '#fce7f3' },
  gray: { name: 'Gri', primary: '#6b7280', secondary: '#f3f4f6' },
  gold: { name: 'Altın', primary: '#f59e0b', secondary: '#fef3c7' }
};

export const MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

export const DAYS_OF_WEEK = [
  'Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'
];

// Utility Functions
export const formatCurrency = (amount: number): string => {
  return `₺${amount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('tr-TR');
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const calculateUsagePercentage = (currentDebt: number, limit: number): number => {
  return Math.min((currentDebt / limit) * 100, 100);
};

export const getDaysUntilDate = (targetDay: number): number => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  let targetDate = new Date(currentYear, currentMonth, targetDay);

  // Eğer hedef tarih geçmişse, gelecek aya al
  if (targetDate < today) {
    targetDate = new Date(currentYear, currentMonth + 1, targetDay);
  }

  const timeDiff = targetDate.getTime() - today.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

export const isPaymentDue = (dueDay: number, warningDays: number = 3): boolean => {
  const daysLeft = getDaysUntilDate(dueDay);
  return daysLeft <= warningDays;
};

// GitHub Integration Types
export interface GitHubUser {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
}

export interface GitHubLabel {
  id: number;
  name: string;
  color: string;
  description?: string;
}

export interface GitHubMilestone {
  id: number;
  number: number;
  title: string;
  description?: string;
  state: 'open' | 'closed';
  due_on?: string;
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body?: string;
  state: 'open' | 'closed';
  locked: boolean;
  assignees: GitHubUser[];
  labels: GitHubLabel[];
  milestone?: GitHubMilestone;
  created_at: string;
  updated_at: string;
  closed_at?: string;
  user: GitHubUser;
  html_url: string;
  comments: number;
}

export interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  body?: string;
  state: 'open' | 'closed' | 'merged';
  locked: boolean;
  assignees: GitHubUser[];
  labels: GitHubLabel[];
  milestone?: GitHubMilestone;
  created_at: string;
  updated_at: string;
  closed_at?: string;
  merged_at?: string;
  user: GitHubUser;
  html_url: string;
  comments: number;
  review_comments: number;
  commits: number;
  additions: number;
  deletions: number;
  changed_files: number;
  head: {
    ref: string;
    sha: string;
    repo: {
      name: string;
      full_name: string;
    };
  };
  base: {
    ref: string;
    sha: string;
    repo: {
      name: string;
      full_name: string;
    };
  };
  draft: boolean;
  mergeable?: boolean;
  mergeable_state: 'clean' | 'dirty' | 'unstable' | 'blocked';
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description?: string;
  private: boolean;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language?: string;
  updated_at: string;
}

export interface GitHubComment {
  id: number;
  body: string;
  user: GitHubUser;
  created_at: string;
  updated_at: string;
  html_url: string;
}

export interface GitHubReview {
  id: number;
  user: GitHubUser;
  body?: string;
  state: 'APPROVED' | 'CHANGES_REQUESTED' | 'COMMENTED' | 'DISMISSED' | 'PENDING';
  submitted_at: string;
  html_url: string;
}

export interface CreateIssueRequest {
  title: string;
  body?: string;
  assignees?: string[];
  labels?: string[];
  milestone?: number;
}

export interface CreatePullRequestRequest {
  title: string;
  body?: string;
  head: string;
  base: string;
  draft?: boolean;
}

export interface GitHubFilters {
  state?: 'open' | 'closed' | 'all';
  assignee?: string;
  creator?: string;
  mentioned?: string;
  labels?: string[];
  sort?: 'created' | 'updated' | 'comments';
  direction?: 'asc' | 'desc';
  since?: string;
  per_page?: number;
  page?: number;
}

export interface GitHubStats {
  totalIssues: number;
  openIssues: number;
  closedIssues: number;
  totalPRs: number;
  openPRs: number;
  mergedPRs: number;
  closedPRs: number;
  averageTimeToClose: number;
  topContributors: Array<{
    user: GitHubUser;
    contributions: number;
  }>;
}
