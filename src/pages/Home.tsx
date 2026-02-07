import { useState, useMemo, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Flame, Trophy, ChevronLeft, ChevronRight } from 'lucide-react';
import { getMonthlyData, formatCurrency, getCategoryGroupData } from '../services/storage';
import { getStreakData, validateStreak, getUnlockedCount, getTotalAchievements } from '../services/gamification';
import { ActionIcons } from '../utils/iconMap';

interface HomeProps {
    onAddEntry: () => void;
    refreshKey: number;
}

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export default function Home({ onAddEntry, refreshKey }: HomeProps) {
    const today = new Date();
    const [month, setMonth] = useState(today.getMonth());
    const [year, setYear] = useState(today.getFullYear());

    const data = useMemo(() => {
        void refreshKey;
        return getMonthlyData(year, month);
    }, [year, month, refreshKey]);

    const groupData = useMemo(() => {
        void refreshKey;
        return getCategoryGroupData(year, month);
    }, [year, month, refreshKey]);

    const streakData = useMemo(() => {
        void refreshKey;
        validateStreak(); // Check if streak is still valid
        return getStreakData();
    }, [refreshKey]);

    const achievementsProgress = useMemo(() => {
        return {
            unlocked: getUnlockedCount(),
            total: getTotalAchievements()
        };
    }, [refreshKey]);

    useEffect(() => {
        validateStreak();
    }, []);

    const goToPrevMonth = () => {
        if (month === 0) {
            setMonth(11);
            setYear(year - 1);
        } else {
            setMonth(month - 1);
        }
    };

    const goToNextMonth = () => {
        if (month === 11) {
            setMonth(0);
            setYear(year + 1);
        } else {
            setMonth(month + 1);
        }
    };

    const isCurrentMonth = month === today.getMonth() && year === today.getFullYear();

    // Prepare chart data
    const totalExpenses = groupData.needs + groupData.lifestyle + groupData.savings;
    const chartData = [
        { name: 'Needs', value: groupData.needs, color: '#10b981' },
        { name: 'Lifestyle', value: groupData.lifestyle, color: '#6366f1' },
        { name: 'Savings', value: groupData.savings, color: '#a855f7' }
    ].filter(item => item.value > 0);

    return (
        <div className="page">
            {/* Streak & Achievements Banner */}
            {isCurrentMonth && (
                <div style={{
                    display: 'flex',
                    gap: 'var(--space-3)',
                    marginBottom: 'var(--space-4)',
                    padding: '0 var(--space-4)'
                }}>
                    {/* Streak Badge */}
                    <div className="streak-badge">
                        <Flame size={18} fill="#f97316" stroke="#f97316" />
                        <span>{streakData.currentStreak} day{streakData.currentStreak !== 1 ? 's' : ''}</span>
                    </div>

                    {/* Achievements */}
                    <div className="streak-badge" style={{
                        background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.1))',
                        borderColor: 'rgba(251, 191, 36, 0.3)',
                        color: '#f59e0b'
                    }}>
                        <Trophy size={18} fill="#f59e0b" stroke="#f59e0b" />
                        <span>{achievementsProgress.unlocked}/{achievementsProgress.total}</span>
                    </div>
                </div>
            )}

            {/* Month Selector */}
            <div className="month-selector">
                <button className="month-btn" onClick={goToPrevMonth}>
                    <ChevronLeft size={24} />
                </button>
                <div className="month-display">
                    <div className="month-name">{MONTHS[month]}</div>
                    <div className="month-year">{year}</div>
                </div>
                <button
                    className="month-btn"
                    onClick={goToNextMonth}
                    style={{ opacity: isCurrentMonth ? 0.3 : 1, pointerEvents: isCurrentMonth ? 'none' : 'auto' }}
                >
                    <ChevronRight size={24} />
                </button>
            </div>

            {/* Summary Cards */}
            <div className="summary-grid">
                <div className="summary-card income">
                    <div className="summary-label">Income</div>
                    <div className="summary-value animated-number">
                        {formatCurrency(data.totalIncome)}
                    </div>
                </div>

                <div className="summary-card needs">
                    <div className="summary-label">Needs</div>
                    <div className="summary-value animated-number">
                        {formatCurrency(data.totalNeeds)}
                    </div>
                </div>

                <div className="summary-card lifestyle">
                    <div className="summary-label">Lifestyle</div>
                    <div className="summary-value animated-number">
                        {formatCurrency(data.totalLifestyle)}
                    </div>
                </div>

                <div className="summary-card savings">
                    <div className="summary-label">Savings</div>
                    <div className="summary-value animated-number">
                        {formatCurrency(data.totalSavings)}
                    </div>
                </div>
            </div>

            {/* Donut Chart */}
            {totalExpenses > 0 && (
                <div className="card mt-6">
                    <div className="text-muted mb-3" style={{ fontSize: '14px', fontWeight: 600 }}>
                        Spending Breakdown
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)' }}>
                        <div style={{ flex: '0 0 140px', height: '140px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={45}
                                        outerRadius={65}
                                        paddingAngle={2}
                                        dataKey="value"
                                        animationBegin={0}
                                        animationDuration={800}
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                            {chartData.map((item) => {
                                const percentage = Math.round((item.value / totalExpenses) * 100);
                                return (
                                    <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                            <div style={{
                                                width: '12px',
                                                height: '12px',
                                                borderRadius: '3px',
                                                background: item.color
                                            }} />
                                            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                                                {item.name}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-1)' }}>
                                            <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                                                {percentage}%
                                            </span>
                                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                                {formatCurrency(item.value)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Balance Summary */}
            {data.totalIncome > 0 && (
                <div className={`card mt-4 ${data.balance >= 0 ? 'balance-positive' : 'balance-negative'}`}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: 'var(--space-1)' }}>
                                Balance This Month
                            </div>
                            <div style={{ fontSize: '24px', fontWeight: 700, color: data.balance >= 0 ? 'var(--income)' : 'var(--danger)' }}>
                                {formatCurrency(Math.abs(data.balance))}
                            </div>
                        </div>
                        <div style={{ fontSize: '32px' }}>
                            {data.balance >= 0 ? '✓' : '⚠️'}
                        </div>
                    </div>
                    {data.balance >= 0 && (
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 'var(--space-2)' }}>
                            Great! You saved {Math.round((data.balance / data.totalIncome) * 100)}% this month
                        </div>
                    )}
                </div>
            )}

            {/* Empty State */}
            {data.totalIncome === 0 && totalExpenses === 0 && (
                <div className="empty-state">
                    <div className="empty-icon">📊</div>
                    <div className="empty-text">No entries yet</div>
                    <div className="empty-subtext">Tap + to add your first entry</div>
                </div>
            )}

            {/* FAB */}
            <button className="fab" onClick={onAddEntry}>
                <ActionIcons.Plus size={24} strokeWidth={2.5} />
            </button>
        </div>
    );
}
