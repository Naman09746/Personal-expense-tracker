// Budget Service - Category-wise monthly budget management
import type { Budget, CategoryBudgetStatus, Category } from '../types';
import { CATEGORIES, CATEGORY_ICONS } from '../types';
import { getEntriesByMonth } from './storage';

const BUDGET_KEY = 'expense-tracker-budgets';
const BUDGET_MONTH_KEY = 'expense-tracker-budget-month';

// ============ STORAGE FUNCTIONS ============

export const getBudgets = (): Budget[] => {
    try {
        checkAndResetMonthlyBudgets();
        const data = localStorage.getItem(BUDGET_KEY);
        if (!data) return [];
        return JSON.parse(data) as Budget[];
    } catch {
        console.error('Error reading budgets from localStorage');
        return [];
    }
};

const saveBudgets = (budgets: Budget[]): void => {
    try {
        localStorage.setItem(BUDGET_KEY, JSON.stringify(budgets));
    } catch {
        console.error('Error saving budgets to localStorage');
    }
};

export const setBudget = (category: Category, amount: number): void => {
    const today = new Date();
    const month = today.getMonth();
    const year = today.getFullYear();

    const budgets = getBudgets();
    const existing = budgets.findIndex(b =>
        b.category === category && b.month === month && b.year === year
    );

    if (existing !== -1) {
        budgets[existing].amount = amount;
    } else {
        budgets.push({ category, amount, month, year });
    }

    saveBudgets(budgets);
    updateLastBudgetMonth();
};

export const getBudgetForCategory = (category: Category): number => {
    const today = new Date();
    const budgets = getBudgets();
    const budget = budgets.find(b =>
        b.category === category &&
        b.month === today.getMonth() &&
        b.year === today.getFullYear()
    );
    return budget?.amount || 0;
};

export const removeBudget = (category: Category): void => {
    const today = new Date();
    const budgets = getBudgets().filter(b =>
        !(b.category === category &&
            b.month === today.getMonth() &&
            b.year === today.getFullYear())
    );
    saveBudgets(budgets);
};

// ============ AUTO-RESET LOGIC ============

const getLastBudgetMonth = (): { month: number; year: number } | null => {
    try {
        const data = localStorage.getItem(BUDGET_MONTH_KEY);
        if (!data) return null;
        return JSON.parse(data);
    } catch {
        return null;
    }
};

const updateLastBudgetMonth = (): void => {
    const today = new Date();
    localStorage.setItem(BUDGET_MONTH_KEY, JSON.stringify({
        month: today.getMonth(),
        year: today.getFullYear()
    }));
};

const checkAndResetMonthlyBudgets = (): void => {
    const last = getLastBudgetMonth();
    if (!last) return;

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // If month changed, carry over budget amounts to new month
    if (last.month !== currentMonth || last.year !== currentYear) {
        const oldBudgets = JSON.parse(localStorage.getItem(BUDGET_KEY) || '[]') as Budget[];
        const lastMonthBudgets = oldBudgets.filter(b =>
            b.month === last.month && b.year === last.year
        );

        // Create new budgets for current month with same amounts
        const newBudgets: Budget[] = lastMonthBudgets.map(b => ({
            category: b.category,
            amount: b.amount,
            month: currentMonth,
            year: currentYear
        }));

        // Keep old budgets for history, add new ones
        const allBudgets = [...oldBudgets, ...newBudgets];
        localStorage.setItem(BUDGET_KEY, JSON.stringify(allBudgets));
        updateLastBudgetMonth();
    }
};

// ============ BUDGET STATUS CALCULATIONS ============

export const getCategorySpending = (category: Category, year: number, month: number): number => {
    const entries = getEntriesByMonth(year, month);
    return entries
        .filter(e => e.type === 'expense' && e.category === category)
        .reduce((sum, e) => sum + e.amount, 0);
};

export const getBudgetStatus = (category: Category): CategoryBudgetStatus | null => {
    const today = new Date();
    const budgetAmount = getBudgetForCategory(category);

    if (budgetAmount === 0) return null;

    const spentAmount = getCategorySpending(category, today.getFullYear(), today.getMonth());
    const remainingAmount = budgetAmount - spentAmount;
    const percentage = (spentAmount / budgetAmount) * 100;

    let status: 'green' | 'yellow' | 'red';
    if (percentage >= 90) {
        status = 'red';
    } else if (percentage >= 70) {
        status = 'yellow';
    } else {
        status = 'green';
    }

    return {
        category,
        budgetAmount,
        spentAmount,
        remainingAmount,
        percentage,
        status
    };
};

export const getAllBudgetStatuses = (): CategoryBudgetStatus[] => {
    return CATEGORIES
        .map(cat => getBudgetStatus(cat))
        .filter((status): status is CategoryBudgetStatus => status !== null);
};

export const getTotalBudgetSummary = (): {
    totalBudget: number;
    totalSpent: number;
    totalRemaining: number;
    overallPercentage: number;
    overallStatus: 'green' | 'yellow' | 'red';
} => {
    const statuses = getAllBudgetStatuses();

    if (statuses.length === 0) {
        return {
            totalBudget: 0,
            totalSpent: 0,
            totalRemaining: 0,
            overallPercentage: 0,
            overallStatus: 'green'
        };
    }

    const totalBudget = statuses.reduce((sum, s) => sum + s.budgetAmount, 0);
    const totalSpent = statuses.reduce((sum, s) => sum + s.spentAmount, 0);
    const totalRemaining = totalBudget - totalSpent;
    const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    let overallStatus: 'green' | 'yellow' | 'red';
    if (overallPercentage >= 90) {
        overallStatus = 'red';
    } else if (overallPercentage >= 70) {
        overallStatus = 'yellow';
    } else {
        overallStatus = 'green';
    }

    return { totalBudget, totalSpent, totalRemaining, overallPercentage, overallStatus };
};

// ============ UTILITY ============

export const getCategoryIcon = (category: Category): string => {
    return CATEGORY_ICONS[category];
};
