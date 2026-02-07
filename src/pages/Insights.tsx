import { useState, useMemo } from 'react';
import { formatCurrency } from '../services/storage';
import {
    getAllBudgetStatuses,
    getTotalBudgetSummary,
    setBudget,
    removeBudget,
    getCategoryIcon
} from '../services/budget';
import { getAnalyticsMetrics, getWantsRatio } from '../services/analytics';
import { generateInsights, getDailyTip } from '../services/insightEngine';
import { generateForecast, getYearEndProjection } from '../services/forecast';
import { calculateFinancialScore, getScoreColor, getScoreEmoji } from '../services/financialScore';
import { CATEGORIES, CATEGORY_LABELS } from '../types';
import type { Category } from '../types';

interface InsightsProps {
    refreshKey: number;
}

export default function Insights({ refreshKey }: InsightsProps) {
    const [showBudgetModal, setShowBudgetModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [budgetAmount, setBudgetAmount] = useState('');

    // Recalculate when refreshKey changes
    const data = useMemo(() => {
        void refreshKey;
        return {
            score: calculateFinancialScore(),
            budgets: getAllBudgetStatuses(),
            budgetSummary: getTotalBudgetSummary(),
            metrics: getAnalyticsMetrics(),
            wantsRatio: getWantsRatio(),
            insights: generateInsights(),
            dailyTip: getDailyTip(),
            forecast: generateForecast(),
            yearEnd: getYearEndProjection()
        };
    }, [refreshKey]);

    const handleSetBudget = (category: Category) => {
        setSelectedCategory(category);
        const existing = data.budgets.find(b => b.category === category);
        setBudgetAmount(existing ? existing.budgetAmount.toString() : '');
        setShowBudgetModal(true);
    };

    const handleSaveBudget = () => {
        if (selectedCategory && budgetAmount) {
            const amount = parseFloat(budgetAmount);
            if (!isNaN(amount) && amount > 0) {
                setBudget(selectedCategory, amount);
            }
        }
        setShowBudgetModal(false);
        setSelectedCategory(null);
        setBudgetAmount('');
        // Force re-render
        window.location.reload();
    };

    const handleRemoveBudget = () => {
        if (selectedCategory) {
            removeBudget(selectedCategory);
        }
        setShowBudgetModal(false);
        setSelectedCategory(null);
        setBudgetAmount('');
        window.location.reload();
    };

    return (
        <div className="page">
            <h2 style={{ marginBottom: 'var(--space-4)' }}>Financial Insights</h2>

            {/* Financial Health Score */}
            <div className="card score-card" style={{
                marginBottom: 'var(--space-4)',
                background: `linear-gradient(135deg, ${getScoreColor(data.score.score)}15, ${getScoreColor(data.score.score)}05)`,
                border: `2px solid ${getScoreColor(data.score.score)}30`
            }}>
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-muted" style={{ fontSize: '14px' }}>Financial Health Score</div>
                        <div className="flex items-center gap-2" style={{ marginTop: 'var(--space-1)' }}>
                            <span style={{ fontSize: '36px', fontWeight: 700, color: getScoreColor(data.score.score) }}>
                                {data.score.score}
                            </span>
                            <span style={{ fontSize: '20px' }}>{getScoreEmoji(data.score.rating)}</span>
                        </div>
                        <div style={{ fontWeight: 500, color: getScoreColor(data.score.score) }}>
                            {data.score.rating}
                        </div>
                    </div>
                    <div className="score-gauge" style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: `conic-gradient(${getScoreColor(data.score.score)} ${data.score.score * 3.6}deg, var(--bg-primary) 0deg)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <div style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            background: 'var(--bg-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '18px',
                            fontWeight: 600
                        }}>
                            {data.score.score}
                        </div>
                    </div>
                </div>
                <div className="text-muted" style={{ fontSize: '13px', marginTop: 'var(--space-3)' }}>
                    {data.score.explanation}
                </div>

                {/* Score Breakdown */}
                <div style={{ marginTop: 'var(--space-4)', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-2)' }}>
                    <div className="score-item">
                        <div className="text-muted" style={{ fontSize: '10px' }}>Savings</div>
                        <div style={{ fontWeight: 600 }}>{data.score.breakdown.savingsScore}</div>
                    </div>
                    <div className="score-item">
                        <div className="text-muted" style={{ fontSize: '10px' }}>Budget</div>
                        <div style={{ fontWeight: 600 }}>{data.score.breakdown.budgetScore}</div>
                    </div>
                    <div className="score-item">
                        <div className="text-muted" style={{ fontSize: '10px' }}>Stability</div>
                        <div style={{ fontWeight: 600 }}>{data.score.breakdown.stabilityScore}</div>
                    </div>
                    <div className="score-item">
                        <div className="text-muted" style={{ fontSize: '10px' }}>Tracking</div>
                        <div style={{ fontWeight: 600 }}>{data.score.breakdown.consistencyScore}</div>
                    </div>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="metrics-grid" style={{ marginBottom: 'var(--space-4)' }}>
                <div className="metric-card">
                    <div className="metric-label">Savings Rate</div>
                    <div className={`metric-value ${data.metrics.savingsRate >= 20 ? 'positive' : data.metrics.savingsRate >= 0 ? 'neutral' : 'negative'}`}>
                        {data.metrics.savingsRate}%
                    </div>
                </div>
                <div className="metric-card">
                    <div className="metric-label">Expense Growth</div>
                    <div className={`metric-value ${data.metrics.expenseGrowth <= 0 ? 'positive' : data.metrics.expenseGrowth <= 10 ? 'neutral' : 'negative'}`}>
                        {data.metrics.expenseGrowth > 0 ? '+' : ''}{data.metrics.expenseGrowth}%
                    </div>
                </div>
                <div className="metric-card">
                    <div className="metric-label">Wants Ratio</div>
                    <div className={`metric-value ${data.wantsRatio <= 30 ? 'positive' : data.wantsRatio <= 40 ? 'neutral' : 'negative'}`}>
                        {data.wantsRatio}%
                    </div>
                </div>
                <div className="metric-card">
                    <div className="metric-label">6M Average</div>
                    <div className="metric-value">{formatCurrency(data.metrics.sixMonthAverage)}</div>
                </div>
            </div>

            {/* Smart Insights */}
            <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
                <div style={{ fontWeight: 500, marginBottom: 'var(--space-3)' }}>Smart Insights</div>
                {data.insights.length > 0 ? (
                    <div className="insights-list">
                        {data.insights.map((insight, idx) => (
                            <div key={idx} className={`insight-card insight-${insight.type}`}>
                                <span className="insight-icon">{insight.icon}</span>
                                <span className="insight-message">{insight.message}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-muted text-center" style={{ padding: 'var(--space-4)' }}>
                        Add more data to get personalized insights!
                    </div>
                )}

                {/* Daily Tip */}
                <div className="insight-card insight-neutral" style={{ marginTop: 'var(--space-3)', background: 'var(--bg-primary)' }}>
                    <span className="insight-icon">{data.dailyTip.icon}</span>
                    <span className="insight-message"><strong>Tip:</strong> {data.dailyTip.message}</span>
                </div>
            </div>

            {/* Forecast Section */}
            <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
                <div style={{ fontWeight: 500, marginBottom: 'var(--space-3)' }}>
                    Next Month Forecast
                    <span className={`confidence-badge confidence-${data.forecast.confidence}`}>
                        {data.forecast.confidence} confidence
                    </span>
                </div>

                {data.forecast.basedOnMonths > 0 ? (
                    <div className="forecast-grid">
                        <div className="forecast-item">
                            <div className="forecast-label">Predicted Expenses</div>
                            <div className="forecast-value">{formatCurrency(data.forecast.predictedExpenses)}</div>
                        </div>
                        <div className="forecast-item">
                            <div className="forecast-label">Predicted Savings</div>
                            <div className={`forecast-value ${data.forecast.predictedSavings >= 0 ? 'positive' : 'negative'}`}>
                                {formatCurrency(data.forecast.predictedSavings)}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-muted text-center" style={{ padding: 'var(--space-4)' }}>
                        Need at least 1 month of data for predictions
                    </div>
                )}

                <div className="text-muted" style={{ fontSize: '12px', marginTop: 'var(--space-2)' }}>
                    Based on {data.forecast.basedOnMonths} month{data.forecast.basedOnMonths !== 1 ? 's' : ''} of data
                </div>
            </div>

            {/* Budget Overview */}
            <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
                <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-3)' }}>
                    <div style={{ fontWeight: 500 }}>Category Budgets</div>
                    {data.budgetSummary.totalBudget > 0 && (
                        <div className={`budget-status-badge status-${data.budgetSummary.overallStatus}`}>
                            {Math.round(data.budgetSummary.overallPercentage)}% used
                        </div>
                    )}
                </div>

                {data.budgets.length > 0 ? (
                    <div className="budget-list">
                        {data.budgets.map((budget) => (
                            <div
                                key={budget.category}
                                className="budget-item"
                                onClick={() => handleSetBudget(budget.category)}
                            >
                                <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-1)' }}>
                                    <div className="flex items-center gap-2">
                                        <span>{getCategoryIcon(budget.category)}</span>
                                        <span style={{ fontWeight: 500 }}>{CATEGORY_LABELS[budget.category]}</span>
                                    </div>
                                    <div className={`budget-amount status-${budget.status}`}>
                                        {formatCurrency(budget.spentAmount)} / {formatCurrency(budget.budgetAmount)}
                                    </div>
                                </div>
                                <div className="budget-progress">
                                    <div
                                        className={`budget-progress-bar status-${budget.status}`}
                                        style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                                    />
                                </div>
                                <div className="flex justify-between" style={{ marginTop: 'var(--space-1)' }}>
                                    <span className="text-muted" style={{ fontSize: '11px' }}>
                                        {Math.round(budget.percentage)}% used
                                    </span>
                                    <span className={`text-muted ${budget.remainingAmount < 0 ? 'negative' : ''}`} style={{ fontSize: '11px' }}>
                                        {budget.remainingAmount >= 0
                                            ? `${formatCurrency(budget.remainingAmount)} left`
                                            : `${formatCurrency(Math.abs(budget.remainingAmount))} over`
                                        }
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-muted text-center" style={{ padding: 'var(--space-4)' }}>
                        No budgets set yet
                    </div>
                )}

                {/* Add Budget Buttons */}
                <div className="budget-add-section" style={{ marginTop: 'var(--space-3)' }}>
                    <div className="text-muted" style={{ fontSize: '12px', marginBottom: 'var(--space-2)' }}>
                        Tap a category to set/edit budget:
                    </div>
                    <div className="budget-category-chips">
                        {CATEGORIES.filter(cat => !data.budgets.find(b => b.category === cat)).map(category => (
                            <button
                                key={category}
                                className="budget-chip"
                                onClick={() => handleSetBudget(category)}
                            >
                                {getCategoryIcon(category)} {CATEGORY_LABELS[category]}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Budget Modal */}
            {showBudgetModal && selectedCategory && (
                <div className="modal-overlay" onClick={() => setShowBudgetModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h3 style={{ marginBottom: 'var(--space-4)' }}>
                            {getCategoryIcon(selectedCategory)} Set Budget for {CATEGORY_LABELS[selectedCategory]}
                        </h3>
                        <div className="input-group" style={{ marginBottom: 'var(--space-4)' }}>
                            <label>Monthly Budget Amount (₹)</label>
                            <input
                                type="number"
                                value={budgetAmount}
                                onChange={(e) => setBudgetAmount(e.target.value)}
                                placeholder="Enter amount"
                                className="input"
                                autoFocus
                            />
                        </div>
                        <div className="flex gap-2">
                            <button className="btn btn-primary flex-1" onClick={handleSaveBudget}>
                                Save Budget
                            </button>
                            {data.budgets.find(b => b.category === selectedCategory) && (
                                <button className="btn btn-danger" onClick={handleRemoveBudget}>
                                    Remove
                                </button>
                            )}
                        </div>
                        <button
                            className="btn btn-secondary"
                            style={{ width: '100%', marginTop: 'var(--space-2)' }}
                            onClick={() => setShowBudgetModal(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
