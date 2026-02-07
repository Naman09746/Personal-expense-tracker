// Forecast Service - Predictive analytics using weighted average
import type { Forecast, ConfidenceLevel } from '../types';
import { getMonthlyData } from './storage';

// ============ HELPER FUNCTIONS ============

const getMonthDate = (monthsAgo: number): { year: number; month: number } => {
    const date = new Date();
    date.setMonth(date.getMonth() - monthsAgo);
    return { year: date.getFullYear(), month: date.getMonth() };
};

interface MonthlyStats {
    income: number;
    expenses: number;
    savings: number;
}

const getHistoricalData = (months: number): MonthlyStats[] => {
    const data: MonthlyStats[] = [];

    for (let i = 1; i <= months; i++) {
        const { year, month } = getMonthDate(i);
        const monthData = getMonthlyData(year, month);
        const expenses = monthData.totalNeeds + monthData.totalWants;

        data.push({
            income: monthData.totalIncome,
            expenses,
            savings: monthData.totalIncome - expenses
        });
    }

    return data;
};

// ============ WEIGHTED AVERAGE CALCULATION ============
// More recent months get higher weights

const calculateWeightedAverage = (values: number[]): number => {
    if (values.length === 0) return 0;

    // Weights: most recent = highest weight
    // e.g., for 6 months: [6, 5, 4, 3, 2, 1] where index 0 is most recent
    let weightedSum = 0;
    let totalWeight = 0;

    values.forEach((value, index) => {
        const weight = values.length - index;
        weightedSum += value * weight;
        totalWeight += weight;
    });

    return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
};

// ============ CONFIDENCE CALCULATION ============

const calculateConfidence = (values: number[]): ConfidenceLevel => {
    if (values.length < 2) return 'low';
    if (values.length < 4) return 'medium';

    // Calculate coefficient of variation (standard deviation / mean)
    const validValues = values.filter(v => v > 0);
    if (validValues.length < 2) return 'low';

    const mean = validValues.reduce((a, b) => a + b, 0) / validValues.length;
    if (mean === 0) return 'low';

    const squaredDiffs = validValues.map(v => Math.pow(v - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / validValues.length;
    const stdDev = Math.sqrt(variance);
    const cv = stdDev / mean;

    // Lower CV = more consistent data = higher confidence
    if (cv < 0.2) return 'high';   // Less than 20% variation
    if (cv < 0.4) return 'medium'; // 20-40% variation
    return 'low';                   // More than 40% variation
};

// ============ MAIN FORECAST FUNCTION ============

export const generateForecast = (monthsToAnalyze: number = 6): Forecast => {
    const historicalData = getHistoricalData(monthsToAnalyze);

    // Filter out months with no data
    const validData = historicalData.filter(d =>
        d.income > 0 || d.expenses > 0
    );

    if (validData.length === 0) {
        return {
            predictedExpenses: 0,
            predictedSavings: 0,
            predictedIncome: 0,
            confidence: 'low',
            basedOnMonths: 0
        };
    }

    // Extract arrays for weighted average
    const incomes = validData.map(d => d.income);
    const expenses = validData.map(d => d.expenses);

    // Calculate predictions
    const predictedIncome = calculateWeightedAverage(incomes);
    const predictedExpenses = calculateWeightedAverage(expenses);
    const predictedSavings = predictedIncome - predictedExpenses;

    // Calculate overall confidence based on expense consistency
    const confidence = calculateConfidence(expenses);

    return {
        predictedExpenses,
        predictedSavings,
        predictedIncome,
        confidence,
        basedOnMonths: validData.length
    };
};

// ============ YEAR-END PROJECTION ============

export const getYearEndProjection = (): {
    projectedYearlyIncome: number;
    projectedYearlyExpenses: number;
    projectedYearlySavings: number;
    monthsRemaining: number;
} => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const monthsRemaining = 12 - currentMonth - 1;

    // Get forecast for remaining months
    const forecast = generateForecast(6);

    // Get actual data for months already passed this year
    let actualIncome = 0;
    let actualExpenses = 0;

    for (let i = 0; i <= currentMonth; i++) {
        const data = getMonthlyData(today.getFullYear(), i);
        actualIncome += data.totalIncome;
        actualExpenses += data.totalNeeds + data.totalWants;
    }

    // Project remaining months
    const projectedRemainingIncome = forecast.predictedIncome * monthsRemaining;
    const projectedRemainingExpenses = forecast.predictedExpenses * monthsRemaining;

    const projectedYearlyIncome = actualIncome + projectedRemainingIncome;
    const projectedYearlyExpenses = actualExpenses + projectedRemainingExpenses;
    const projectedYearlySavings = projectedYearlyIncome - projectedYearlyExpenses;

    return {
        projectedYearlyIncome,
        projectedYearlyExpenses,
        projectedYearlySavings,
        monthsRemaining
    };
};

// ============ TREND PREDICTION ============

export const predictNextMonthChange = (): {
    expenseChange: number;
    direction: 'up' | 'down' | 'stable';
    percentChange: number;
} => {
    const historicalData = getHistoricalData(3);

    if (historicalData.length < 2) {
        return { expenseChange: 0, direction: 'stable', percentChange: 0 };
    }

    // Calculate average month-over-month change
    let totalChange = 0;
    for (let i = 0; i < historicalData.length - 1; i++) {
        totalChange += historicalData[i].expenses - historicalData[i + 1].expenses;
    }

    const avgChange = totalChange / (historicalData.length - 1);
    const currentExpenses = historicalData[0].expenses;
    const percentChange = currentExpenses > 0
        ? Math.round((avgChange / currentExpenses) * 100)
        : 0;

    let direction: 'up' | 'down' | 'stable';
    if (avgChange > currentExpenses * 0.05) direction = 'up';
    else if (avgChange < -currentExpenses * 0.05) direction = 'down';
    else direction = 'stable';

    return {
        expenseChange: Math.round(avgChange),
        direction,
        percentChange
    };
};
