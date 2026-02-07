// Core data types for Personal Expense Tracker
// Enhanced with new 3-tier category system

export type CategoryGroup = 'needs' | 'lifestyle' | 'savings';

// Needs (Essential Expenses)
export type NeedsCategory =
  | 'FoodGroceries'
  | 'Meals'
  | 'Transport'
  | 'Fuel'
  | 'RentUtilities'
  | 'Education'
  | 'HealthHygiene';

// Lifestyle (Discretionary Expenses)
export type LifestyleCategory =
  | 'EatingOut'
  | 'Entertainment'
  | 'Shopping'
  | 'TravelTrips'
  | 'Hobbies'
  | 'Gifts';

// Savings & Goals
export type SavingsCategory =
  | 'EmergencyFund'
  | 'Gadgets'
  | 'FutureGoals';

export type Category = NeedsCategory | LifestyleCategory | SavingsCategory;

export type EntryType = 'income' | 'expense';
export type Priority = 'needs' | 'lifestyle' | 'savings';

export interface Entry {
  id: string;
  amount: number;
  type: EntryType;
  category: Category;
  categoryGroup: CategoryGroup;
  priority: Priority; // Maps to categoryGroup for backward compatibility
  date: string; // ISO date string YYYY-MM-DD
  note?: string;
  createdAt: number; // timestamp for sorting
}

export interface MonthlyData {
  totalIncome: number;
  totalNeeds: number;
  totalLifestyle: number;
  totalSavings: number;
  totalWants: number; // For backward compatibility
  balance: number;
}

// All categories in arrays
export const NEEDS_CATEGORIES: NeedsCategory[] = [
  'FoodGroceries',
  'Meals',
  'Transport',
  'Fuel',
  'RentUtilities',
  'Education',
  'HealthHygiene'
];

export const LIFESTYLE_CATEGORIES: LifestyleCategory[] = [
  'EatingOut',
  'Entertainment',
  'Shopping',
  'TravelTrips',
  'Hobbies',
  'Gifts'
];

export const SAVINGS_CATEGORIES: SavingsCategory[] = [
  'EmergencyFund',
  'Gadgets',
  'FutureGoals'
];

export const ALL_CATEGORIES: Category[] = [
  ...NEEDS_CATEGORIES,
  ...LIFESTYLE_CATEGORIES,
  ...SAVINGS_CATEGORIES
];

// Legacy support
export const CATEGORIES = ALL_CATEGORIES;

// Category to Group mapping
export const CATEGORY_TO_GROUP: Record<Category, CategoryGroup> = {
  // Needs
  FoodGroceries: 'needs',
  Meals: 'needs',
  Transport: 'needs',
  Fuel: 'needs',
  RentUtilities: 'needs',
  Education: 'needs',
  HealthHygiene: 'needs',
  // Lifestyle
  EatingOut: 'lifestyle',
  Entertainment: 'lifestyle',
  Shopping: 'lifestyle',
  TravelTrips: 'lifestyle',
  Hobbies: 'lifestyle',
  Gifts: 'lifestyle',
  // Savings
  EmergencyFund: 'savings',
  Gadgets: 'savings',
  FutureGoals: 'savings'
};

// Lucide icon names (will be used in iconMap.tsx)
export const CATEGORY_ICONS: Record<Category, string> = {
  // Needs
  FoodGroceries: 'ShoppingCart',
  Meals: 'UtensilsCrossed',
  Transport: 'Bus',
  Fuel: 'Fuel',
  RentUtilities: 'Home',
  Education: 'BookOpen',
  HealthHygiene: 'HeartPulse',
  // Lifestyle
  EatingOut: 'Coffee',
  Entertainment: 'Film',
  Shopping: 'ShoppingBag',
  TravelTrips: 'Plane',
  Hobbies: 'Gamepad2',
  Gifts: 'Gift',
  // Savings
  EmergencyFund: 'Shield',
  Gadgets: 'Smartphone',
  FutureGoals: 'Target'
};

export const CATEGORY_LABELS: Record<Category, string> = {
  // Needs
  FoodGroceries: 'Food & Groceries',
  Meals: 'Meals',
  Transport: 'Transport',
  Fuel: 'Fuel',
  RentUtilities: 'Rent & Utilities',
  Education: 'Education',
  HealthHygiene: 'Health & Hygiene',
  // Lifestyle
  EatingOut: 'Eating Out',
  Entertainment: 'Entertainment',
  Shopping: 'Shopping',
  TravelTrips: 'Travel & Trips',
  Hobbies: 'Hobbies',
  Gifts: 'Gifts',
  // Savings
  EmergencyFund: 'Emergency Fund',
  Gadgets: 'Gadgets',
  FutureGoals: 'Future Goals'
};

export const CATEGORY_DESCRIPTIONS: Record<Category, string> = {
  // Needs
  FoodGroceries: 'Daily groceries and essentials',
  Meals: 'Regular meals and food',
  Transport: 'Local travel, bus, metro, auto',
  Fuel: 'Vehicle fuel',
  RentUtilities: 'Hostel/PG rent, electricity, water, internet',
  Education: 'Books, study materials, tuition fees',
  HealthHygiene: 'Medicines, doctor visits, toiletries',
  // Lifestyle
  EatingOut: 'Restaurants, cafés, coffee shops',
  Entertainment: 'Movies, games, OTT subscriptions',
  Shopping: 'Clothes, accessories',
  TravelTrips: 'Vacations, weekend trips',
  Hobbies: 'Sports, music, events',
  Gifts: 'Presents, celebrations',
  // Savings
  EmergencyFund: 'Emergency fund savings',
  Gadgets: 'Saving for phone, laptop, etc.',
  FutureGoals: 'Future trips, courses, goals'
};

// Category Group metadata
export const CATEGORY_GROUP_META: Record<CategoryGroup, {
  label: string;
  color: string;
  icon: string;
  description: string;
}> = {
  needs: {
    label: 'Needs',
    color: 'green',
    icon: 'CircleCheck',
    description: 'Essential expenses you must spend on'
  },
  lifestyle: {
    label: 'Lifestyle',
    color: 'blue',
    icon: 'Sparkles',
    description: 'Discretionary expenses for comfort and fun'
  },
  savings: {
    label: 'Savings & Goals',
    color: 'purple',
    icon: 'Wallet',
    description: 'Money saved for future goals'
  }
};

// ============ BUDGET TYPES ============
export interface Budget {
  category: Category;
  amount: number;
  month: number; // 0-11
  year: number;
}

export interface CategoryBudgetStatus {
  category: Category;
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
  percentage: number;
  status: 'green' | 'yellow' | 'red';
}

// ============ ANALYTICS TYPES ============
export interface AnalyticsMetrics {
  totalIncome: number;
  totalExpenses: number;
  savingsAmount: number;
  savingsRate: number; // percentage
  expenseGrowth: number; // percentage, month-over-month
  monthlyBurnRate: number;
  sixMonthAverage: number;
  categoryGrowth: CategoryGrowth[];
}

export interface CategoryGrowth {
  category: Category;
  currentAmount: number;
  previousAmount: number;
  growthPercent: number;
}

// ============ CHART DATA TYPES ============
export interface CategoryChartData {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

export interface TrendData {
  date: string;
  needs: number;
  lifestyle: number;
  savings: number;
  total: number;
}

export interface GroupedData {
  needs: number;
  lifestyle: number;
  savings: number;
}

// ============ STREAK & GAMIFICATION TYPES ============
export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastEntryDate: string;
  totalDaysWithEntries: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: number;
  isUnlocked: boolean;
}

// ============ SAVINGS GOALS ============
export interface SavingsGoal {
  category: SavingsCategory;
  targetAmount: number;
  currentAmount: number;
  deadline?: string; // ISO date
}

export interface GoalProgress {
  goal: SavingsGoal;
  percentage: number;
  status: 'on-track' | 'behind' | 'completed';
  daysRemaining?: number;
}

// ============ INSIGHT TYPES ============
export type InsightType = 'warning' | 'positive' | 'neutral';

export interface Insight {
  type: InsightType;
  icon: string;
  message: string;
}

// ============ FORECAST TYPES ============
export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface Forecast {
  predictedExpenses: number;
  predictedSavings: number;
  predictedIncome: number;
  confidence: ConfidenceLevel;
  basedOnMonths: number;
}

// ============ FINANCIAL SCORE TYPES ============
export type ScoreRating = 'Excellent' | 'Good' | 'Average' | 'Poor';

export interface FinancialScore {
  score: number; // 0-100
  rating: ScoreRating;
  explanation: string;
  breakdown: {
    savingsScore: number;
    budgetScore: number;
    stabilityScore: number;
    consistencyScore: number;
  };
}
