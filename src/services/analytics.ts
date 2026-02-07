// Analytics Service - Advanced financial metrics engine
import type { AnalyticsMetrics, CategoryGrowth, Category } from '../types';
import { CATEGORIES } from '../types';
import { getMonthlyData, getEntriesByMonth } from './storage';

// ============ HELPER FUNCTIONS ============

const getMonthDate = (monthsAgo: number): { year: number; month: number } => {
    const date = new Date();
    date.setMonth(date.getMonth() - monthsAgo);
    return { year: date.getFullYear(), month: date.getMonth() };
};

const getCategorySpending = (category: Category, year: number, month: number): number => {
    const entries = getEntriesByMonth(year, month);
    return entries
        .filter(e => e.type === 'expense' && e.category === category)
        .reduce((sum, e) => sum + e.amount, 0);
};

// ============ CORE METRICS ============

export const calculateSavingsRate = (income: number, expenses: number): number => {
    if (income <= 0) return 0;
    const savings = income - expenses;
    return Math.round((savings / income) * 100);
};

export const calculateExpenseGrowth = (currentExpenses: number, previousExpenses: number): number => {
    if (previousExpenses === 0) {
        return currentExpenses > 0 ? 100 : 0;
    }
    return Math.round(((currentExpenses - previousExpenses) / previousExpenses) * 100);
};

export const calculateMonthlyBurnRate = (expenses: number, daysInMonth: number, daysPassed: number): number => {
    if (daysPassed === 0) return 0;
    const dailyRate = expenses / daysPassed;
    return Math.round(dailyRate * daysInMonth);
};

// ============ CATEGORY GROWTH ============

export const calculateCategoryGrowth = (): CategoryGrowth[] => {
    const current = getMonthDate(0);
    const previous = getMonthDate(1);

    return CATEGORIES.map(category => {
        const currentAmount = getCategorySpending(category, current.year, current.month);
        const previousAmount = getCategorySpending(category, previous.year, previous.month);

        let growthPercent = 0;
        if (previousAmount > 0) {
            growthPercent = Math.round(((currentAmount - previousAmount) / previousAmount) * 100);
        } else if (currentAmount > 0) {
            growthPercent = 100;
        }

        return {
            category,
            currentAmount,
            previousAmount,
            growthPercent
        };
    }).filter(cg => cg.currentAmount > 0 || cg.previousAmount > 0);
};

// ============ MOVING AVERAGE ============

export const calculateSixMonthAverage = (): number => {
    let total = 0;
    let validMonths = 0;

    for (let i = 0; i < 6; i++) {
        const { year, month } = getMonthDate(i);
        const data = getMonthlyData(year, month);
        const expenses = data.totalNeeds + data.totalWants;

        if (expenses > 0) {
            total += expenses;
            validMonths++;
        }
    }

    return validMonths > 0 ? Math.round(total / validMonths) : 0;
};

// ============ MAIN ANALYTICS FUNCTION ============

export const getAnalyticsMetrics = (): AnalyticsMetrics => {
    const today = new Date();
    const current = getMonthDate(0);
    const previous = getMonthDate(1);

    // Current month data
    const currentData = getMonthlyData(current.year, current.month);
    const totalIncome = currentData.totalIncome;
    const totalExpenses = currentData.totalNeeds + currentData.totalWants;
    const savingsAmount = totalIncome - totalExpenses;

    // Savings rate
    const savingsRate = calculateSavingsRate(totalIncome, totalExpenses);

    // Previous month data for growth calculation
    const previousData = getMonthlyData(previous.year, previous.month);
    const previousExpenses = previousData.totalNeeds + previousData.totalWants;

    // Expense growth
    const expenseGrowth = calculateExpenseGrowth(totalExpenses, previousExpenses);

    // Monthly burn rate
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const daysPassed = today.getDate();
    const monthlyBurnRate = calculateMonthlyBurnRate(totalExpenses, daysInMonth, daysPassed);

    // 6-month average
    const sixMonthAverage = calculateSixMonthAverage();

    // Category growth
    const categoryGrowth = calculateCategoryGrowth();

    return {
        totalIncome,
        totalExpenses,
        savingsAmount,
        savingsRate,
        expenseGrowth,
        monthlyBurnRate,
        sixMonthAverage,
        categoryGrowth
    };
};

// ============ TREND ANALYSIS ============

export const getExpenseTrend = (months: number = 3): 'rising' | 'falling' | 'stable' => {
    const expenses: number[] = [];

    for (let i = 0; i < months; i++) {
        const { year, month } = getMonthDate(i);
        const data = getMonthlyData(year, month);
        expenses.push(data.totalNeeds + data.totalWants);
    }

    if (expenses.length < 2) return 'stable';

    // Check if consistently rising or falling
    let risingCount = 0;
    let fallingCount = 0;

    for (let i = 0; i < expenses.length - 1; i++) {
        if (expenses[i] > expenses[i + 1]) risingCount++;
        else if (expenses[i] < expenses[i + 1]) fallingCount++;
    }

    if (risingCount >= Math.floor(expenses.length / 2)) return 'rising';
    if (fallingCount >= Math.floor(expenses.length / 2)) return 'falling';
    return 'stable';
};

export const getSavingsTrend = (months: number = 3): 'improving' | 'declining' | 'stable' => {
    const savingsRates: number[] = [];

    for (let i = 0; i < months; i++) {
        const { year, month } = getMonthDate(i);
        const data = getMonthlyData(year, month);
        const expenses = data.totalNeeds + data.totalWants;
        const rate = calculateSavingsRate(data.totalIncome, expenses);
        savingsRates.push(rate);
    }

    if (savingsRates.length < 2) return 'stable';

    let improvingCount = 0;
    let decliningCount = 0;

    for (let i = 0; i < savingsRates.length - 1; i++) {
        if (savingsRates[i] > savingsRates[i + 1]) improvingCount++;
        else if (savingsRates[i] < savingsRates[i + 1]) decliningCount++;
    }

    if (improvingCount >= Math.floor(savingsRates.length / 2)) return 'improving';
    if (decliningCount >= Math.floor(savingsRates.length / 2)) return 'declining';
    return 'stable';
};

// ============ WANTS VS NEEDS RATIO ============

export const getWantsRatio = (): number => {
    const current = getMonthDate(0);
    const data = getMonthlyData(current.year, current.month);
    const totalExpenses = data.totalNeeds + data.totalWants;

    if (totalExpenses === 0) return 0;
    return Math.round((data.totalWants / totalExpenses) * 100);
};
