// Financial Score Service - Gamification layer with 0-100 scoring
import type { FinancialScore, ScoreRating } from '../types';
import { getAnalyticsMetrics } from './analytics';
import { getTotalBudgetSummary } from './budget';
import { getMonthlyData } from './storage';

// ============ SCORING WEIGHTS ============
const WEIGHTS = {
    savings: 0.40,      // 40% - Savings rate
    budget: 0.30,       // 30% - Budget adherence
    stability: 0.20,    // 20% - Expense stability
    consistency: 0.10   // 10% - Spending consistency
};

// ============ INDIVIDUAL SCORE CALCULATIONS ============

/**
 * Savings Score (0-100)
 * Based on savings rate percentage
 * - 30%+ savings = 100 points
 * - 0% savings = 0 points
 * - Negative = 0 points
 */
const calculateSavingsScore = (savingsRate: number): number => {
    if (savingsRate <= 0) return 0;
    if (savingsRate >= 30) return 100;
    // Linear scale from 0-30% maps to 0-100
    return Math.round((savingsRate / 30) * 100);
};

/**
 * Budget Score (0-100)
 * Based on how well user stays within budgets
 */
const calculateBudgetScore = (): number => {
    const summary = getTotalBudgetSummary();

    // If no budgets set, give neutral score
    if (summary.totalBudget === 0) return 50;

    // Score based on overall budget usage
    const usagePercent = summary.overallPercentage;

    if (usagePercent <= 70) return 100;        // Under 70% = perfect
    if (usagePercent <= 85) return 80;         // 70-85% = good
    if (usagePercent <= 100) return 60;        // 85-100% = okay
    if (usagePercent <= 120) return 30;        // 100-120% = poor
    return 0;                                   // Over 120% = very poor
};

/**
 * Stability Score (0-100)
 * Based on month-over-month expense variation
 */
const calculateStabilityScore = (): number => {
    const metrics = getAnalyticsMetrics();
    const growthAbs = Math.abs(metrics.expenseGrowth);

    // Less variation = higher score
    if (growthAbs <= 5) return 100;    // Within 5% = very stable
    if (growthAbs <= 10) return 85;    // Within 10%
    if (growthAbs <= 20) return 70;    // Within 20%
    if (growthAbs <= 30) return 50;    // Within 30%
    if (growthAbs <= 50) return 30;    // Within 50%
    return 10;                          // Over 50% variation
};

/**
 * Consistency Score (0-100)
 * Based on having regular income and expenses tracked
 */
const calculateConsistencyScore = (): number => {
    let monthsWithData = 0;
    const today = new Date();

    // Check last 6 months for data
    for (let i = 0; i < 6; i++) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const data = getMonthlyData(date.getFullYear(), date.getMonth());

        if (data.totalIncome > 0 || data.totalNeeds > 0 || data.totalWants > 0) {
            monthsWithData++;
        }
    }

    // Score based on tracking consistency
    return Math.round((monthsWithData / 6) * 100);
};

// ============ RATING DETERMINATION ============

const getRating = (score: number): ScoreRating => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Average';
    return 'Poor';
};

// ============ EXPLANATION GENERATOR ============

const generateExplanation = (
    score: number,
    breakdown: FinancialScore['breakdown']
): string => {
    const weakAreas: string[] = [];
    const strongAreas: string[] = [];

    if (breakdown.savingsScore >= 70) strongAreas.push('savings');
    else if (breakdown.savingsScore < 50) weakAreas.push('savings');

    if (breakdown.budgetScore >= 70) strongAreas.push('budget control');
    else if (breakdown.budgetScore < 50) weakAreas.push('budget control');

    if (breakdown.stabilityScore >= 70) strongAreas.push('expense stability');
    else if (breakdown.stabilityScore < 50) weakAreas.push('expense stability');

    if (breakdown.consistencyScore >= 70) strongAreas.push('tracking consistency');
    else if (breakdown.consistencyScore < 50) weakAreas.push('tracking consistency');

    if (score >= 80) {
        return `Outstanding financial discipline! ${strongAreas.length > 0 ? `Especially strong in ${strongAreas.join(' and ')}.` : ''}`;
    }
    if (score >= 60) {
        return `Good financial habits. ${weakAreas.length > 0 ? `Focus on improving ${weakAreas.join(' and ')} for a better score.` : ''}`;
    }
    if (score >= 40) {
        return `Room for improvement. ${weakAreas.length > 0 ? `Work on ${weakAreas.join(' and ')} to boost your score.` : 'Track your finances more consistently.'}`;
    }
    return `Time to take control! Start by tracking all expenses and setting up budgets.`;
};

// ============ MAIN SCORE FUNCTION ============

export const calculateFinancialScore = (): FinancialScore => {
    const metrics = getAnalyticsMetrics();

    // Calculate individual scores
    const savingsScore = calculateSavingsScore(metrics.savingsRate);
    const budgetScore = calculateBudgetScore();
    const stabilityScore = calculateStabilityScore();
    const consistencyScore = calculateConsistencyScore();

    // Calculate weighted total
    const totalScore = Math.round(
        savingsScore * WEIGHTS.savings +
        budgetScore * WEIGHTS.budget +
        stabilityScore * WEIGHTS.stability +
        consistencyScore * WEIGHTS.consistency
    );

    const breakdown = {
        savingsScore,
        budgetScore,
        stabilityScore,
        consistencyScore
    };

    const rating = getRating(totalScore);
    const explanation = generateExplanation(totalScore, breakdown);

    return {
        score: totalScore,
        rating,
        explanation,
        breakdown
    };
};

// ============ SCORE TREND ============

export const getScoreColor = (score: number): string => {
    if (score >= 80) return '#10B981'; // Green
    if (score >= 60) return '#3B82F6'; // Blue
    if (score >= 40) return '#F59E0B'; // Yellow
    return '#EF4444';                   // Red
};

export const getScoreEmoji = (rating: ScoreRating): string => {
    switch (rating) {
        case 'Excellent': return '🏆';
        case 'Good': return '👍';
        case 'Average': return '📊';
        case 'Poor': return '💪';
    }
};
