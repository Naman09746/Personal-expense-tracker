// Insight Engine - Rule-based financial advice generator
import type { Insight } from '../types';
import {
    getAnalyticsMetrics,
    getExpenseTrend,
    getSavingsTrend,
    getWantsRatio
} from './analytics';
import { getTotalBudgetSummary, getAllBudgetStatuses } from './budget';

// ============ INSIGHT RULES ============

const checkLowSavingsRate = (savingsRate: number): Insight | null => {
    if (savingsRate < 0) {
        return {
            type: 'warning',
            icon: '🚨',
            message: `You're spending more than you earn! Currently at ${Math.abs(savingsRate)}% in the red.`
        };
    }
    if (savingsRate < 10) {
        return {
            type: 'warning',
            icon: '⚠️',
            message: `Your savings rate is very low at ${savingsRate}%. Try to save at least 20% of income.`
        };
    }
    if (savingsRate < 20) {
        return {
            type: 'neutral',
            icon: '💡',
            message: `Savings rate of ${savingsRate}% is decent. Push for 20%+ for better financial health.`
        };
    }
    return null;
};

const checkHighSavingsRate = (savingsRate: number): Insight | null => {
    if (savingsRate >= 40) {
        return {
            type: 'positive',
            icon: '🌟',
            message: `Excellent! You're saving ${savingsRate}% of your income. Keep it up!`
        };
    }
    if (savingsRate >= 30) {
        return {
            type: 'positive',
            icon: '💪',
            message: `Great savings rate of ${savingsRate}%! You're building a solid financial foundation.`
        };
    }
    if (savingsRate >= 20) {
        return {
            type: 'positive',
            icon: '✅',
            message: `Good job maintaining a healthy ${savingsRate}% savings rate.`
        };
    }
    return null;
};

const checkWantsOverspending = (wantsRatio: number): Insight | null => {
    if (wantsRatio > 50) {
        return {
            type: 'warning',
            icon: '🛍️',
            message: `${wantsRatio}% of spending is on wants. Consider reducing discretionary expenses.`
        };
    }
    if (wantsRatio > 40) {
        return {
            type: 'neutral',
            icon: '💭',
            message: `${wantsRatio}% going to wants. Review if all purchases align with your goals.`
        };
    }
    if (wantsRatio <= 30 && wantsRatio > 0) {
        return {
            type: 'positive',
            icon: '🎯',
            message: `Only ${wantsRatio}% on wants - you're prioritizing needs effectively!`
        };
    }
    return null;
};

const checkExpenseTrend = (): Insight | null => {
    const trend = getExpenseTrend(3);

    if (trend === 'rising') {
        return {
            type: 'warning',
            icon: '📈',
            message: 'Expenses have been rising for 3 months. Review your spending patterns.'
        };
    }
    if (trend === 'falling') {
        return {
            type: 'positive',
            icon: '📉',
            message: 'Great work! Your expenses have been decreasing consistently.'
        };
    }
    return null;
};

const checkSavingsTrend = (): Insight | null => {
    const trend = getSavingsTrend(3);

    if (trend === 'improving') {
        return {
            type: 'positive',
            icon: '🚀',
            message: 'Your savings rate has been improving! Keep the momentum going.'
        };
    }
    if (trend === 'declining') {
        return {
            type: 'warning',
            icon: '📊',
            message: 'Savings rate declining over recent months. Time to reassess spending.'
        };
    }
    return null;
};

const checkBudgetAdherence = (): Insight | null => {
    const summary = getTotalBudgetSummary();
    const statuses = getAllBudgetStatuses();

    if (summary.totalBudget === 0) {
        return {
            type: 'neutral',
            icon: '📋',
            message: 'Set up category budgets to get better control over your spending!'
        };
    }

    const overBudgetCount = statuses.filter(s => s.status === 'red').length;

    if (overBudgetCount > 0) {
        return {
            type: 'warning',
            icon: '🔴',
            message: `${overBudgetCount} categor${overBudgetCount > 1 ? 'ies are' : 'y is'} over budget. Review your spending!`
        };
    }

    if (summary.overallStatus === 'green') {
        return {
            type: 'positive',
            icon: '🎉',
            message: 'All categories within budget! You\'re managing your money well.'
        };
    }

    return null;
};

const checkExpenseGrowth = (growth: number): Insight | null => {
    if (growth > 30) {
        return {
            type: 'warning',
            icon: '⚡',
            message: `Expenses jumped ${growth}% from last month. Was there an unusual expense?`
        };
    }
    if (growth < -20) {
        return {
            type: 'positive',
            icon: '💰',
            message: `Spending down ${Math.abs(growth)}% from last month. Great discipline!`
        };
    }
    return null;
};

// ============ MAIN INSIGHT GENERATOR ============

export const generateInsights = (): Insight[] => {
    const insights: Insight[] = [];
    const metrics = getAnalyticsMetrics();
    const wantsRatio = getWantsRatio();

    // Check all rules and collect insights
    const savingsWarning = checkLowSavingsRate(metrics.savingsRate);
    const savingsPositive = checkHighSavingsRate(metrics.savingsRate);
    const wantsInsight = checkWantsOverspending(wantsRatio);
    const expenseTrendInsight = checkExpenseTrend();
    const savingsTrendInsight = checkSavingsTrend();
    const budgetInsight = checkBudgetAdherence();
    const growthInsight = checkExpenseGrowth(metrics.expenseGrowth);

    // Add insights in priority order (warnings first, then neutrals, then positives)
    if (savingsWarning) insights.push(savingsWarning);
    if (wantsInsight?.type === 'warning') insights.push(wantsInsight);
    if (expenseTrendInsight?.type === 'warning') insights.push(expenseTrendInsight);
    if (savingsTrendInsight?.type === 'warning') insights.push(savingsTrendInsight);
    if (budgetInsight?.type === 'warning') insights.push(budgetInsight);
    if (growthInsight?.type === 'warning') insights.push(growthInsight);

    // Neutral
    if (wantsInsight?.type === 'neutral') insights.push(wantsInsight);
    if (budgetInsight?.type === 'neutral') insights.push(budgetInsight);

    // Positives
    if (savingsPositive) insights.push(savingsPositive);
    if (wantsInsight?.type === 'positive') insights.push(wantsInsight);
    if (expenseTrendInsight?.type === 'positive') insights.push(expenseTrendInsight);
    if (savingsTrendInsight?.type === 'positive') insights.push(savingsTrendInsight);
    if (budgetInsight?.type === 'positive') insights.push(budgetInsight);
    if (growthInsight?.type === 'positive') insights.push(growthInsight);

    // Limit to most relevant insights
    return insights.slice(0, 5);
};

// ============ DAILY TIP ============

const dailyTips: string[] = [
    "Track every expense, no matter how small.",
    "Review your spending weekly to stay on track.",
    "The 50/30/20 rule: 50% needs, 30% wants, 20% savings.",
    "Set up automatic savings to pay yourself first.",
    "Wait 24 hours before making impulse purchases.",
    "Pack lunch to save money on eating out.",
    "Review subscriptions monthly - cancel unused ones.",
    "Build an emergency fund covering 3-6 months expenses.",
    "Compare prices before big purchases.",
    "Small daily savings add up to big annual savings."
];

export const getDailyTip = (): Insight => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    const tipIndex = dayOfYear % dailyTips.length;

    return {
        type: 'neutral',
        icon: '💡',
        message: dailyTips[tipIndex]
    };
};
