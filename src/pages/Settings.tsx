import { useState, useEffect } from 'react';
import {
    getTheme,
    setTheme,
    exportToCSV,
    getMonthlyComparison,
    clearAllData,
    formatCurrency
} from '../services/storage';
import type { Theme, MonthlyComparison } from '../services/storage';

export default function Settings() {
    const [currentTheme, setCurrentTheme] = useState<Theme>(getTheme());
    const [comparison, setComparison] = useState<MonthlyComparison[]>([]);

    useEffect(() => {
        setComparison(getMonthlyComparison(6));
    }, []);

    const toggleTheme = () => {
        const newTheme: Theme = currentTheme === 'light' ? 'dark' : 'light';
        setCurrentTheme(newTheme);
        setTheme(newTheme);
    };

    const maxValue = Math.max(
        ...comparison.flatMap(m => [m.income, m.needs + m.wants])
    ) || 1;

    return (
        <div className="page">
            <h2 style={{ marginBottom: 'var(--space-6)' }}>Settings</h2>

            {/* Theme Toggle */}
            <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
                <div className="flex items-center justify-between">
                    <div>
                        <div style={{ fontWeight: 500 }}>Dark Mode</div>
                        <div className="text-muted" style={{ fontSize: '14px' }}>
                            {currentTheme === 'dark' ? 'On' : 'Off'}
                        </div>
                    </div>
                    <button
                        className={`toggle-btn ${currentTheme === 'dark' ? 'active' : ''}`}
                        onClick={toggleTheme}
                        style={{
                            width: '60px',
                            background: currentTheme === 'dark' ? 'var(--income)' : 'var(--bg-primary)'
                        }}
                    >
                        {currentTheme === 'dark' ? '🌙' : '☀️'}
                    </button>
                </div>
            </div>

            {/* Export Data */}
            <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
                <div className="flex items-center justify-between">
                    <div>
                        <div style={{ fontWeight: 500 }}>Export Data</div>
                        <div className="text-muted" style={{ fontSize: '14px' }}>
                            Download as CSV file
                        </div>
                    </div>
                    <button className="btn btn-secondary" onClick={exportToCSV}>
                        📥 Export
                    </button>
                </div>
            </div>

            {/* Monthly Comparison Chart */}
            <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
                <div style={{ fontWeight: 500, marginBottom: 'var(--space-4)' }}>
                    Last 6 Months
                </div>

                {comparison.length > 0 && comparison.some(m => m.income > 0 || m.needs > 0 || m.wants > 0) ? (
                    <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-end', height: '150px' }}>
                        {comparison.map((month, idx) => (
                            <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                                <div style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: '2px' }}>
                                    {/* Income bar */}
                                    <div
                                        style={{
                                            width: '100%',
                                            height: `${(month.income / maxValue) * 100}%`,
                                            minHeight: month.income > 0 ? '4px' : '0',
                                            background: 'var(--income)',
                                            borderRadius: '4px 4px 0 0',
                                            transition: 'height 300ms ease-out'
                                        }}
                                    />
                                    {/* Spending bar (needs + wants stacked) */}
                                    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                        <div
                                            style={{
                                                width: '100%',
                                                height: `${(month.needs / maxValue) * 100}%`,
                                                minHeight: month.needs > 0 ? '4px' : '0',
                                                background: 'var(--need)',
                                                transition: 'height 300ms ease-out'
                                            }}
                                        />
                                        <div
                                            style={{
                                                width: '100%',
                                                height: `${(month.wants / maxValue) * 100}%`,
                                                minHeight: month.wants > 0 ? '4px' : '0',
                                                background: 'var(--want)',
                                                borderRadius: '0 0 4px 4px',
                                                transition: 'height 300ms ease-out'
                                            }}
                                        />
                                    </div>
                                </div>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: 'var(--space-2)' }}>
                                    {month.month}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-muted text-center" style={{ padding: 'var(--space-6)' }}>
                        No data yet. Start adding entries!
                    </div>
                )}

                {/* Legend */}
                <div className="flex justify-between" style={{ marginTop: 'var(--space-4)', fontSize: '12px' }}>
                    <div className="flex items-center gap-2">
                        <div style={{ width: '12px', height: '12px', background: 'var(--income)', borderRadius: '2px' }}></div>
                        <span className="text-muted">Income</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div style={{ width: '12px', height: '12px', background: 'var(--need)', borderRadius: '2px' }}></div>
                        <span className="text-muted">Needs</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div style={{ width: '12px', height: '12px', background: 'var(--want)', borderRadius: '2px' }}></div>
                        <span className="text-muted">Wants</span>
                    </div>
                </div>
            </div>

            {/* Monthly Breakdown Table */}
            {comparison.some(m => m.income > 0 || m.needs > 0 || m.wants > 0) && (
                <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
                    <div style={{ fontWeight: 500, marginBottom: 'var(--space-3)' }}>
                        Monthly Breakdown
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--bg-primary)' }}>
                                    <th style={{ padding: 'var(--space-2)', textAlign: 'left' }}>Month</th>
                                    <th style={{ padding: 'var(--space-2)', textAlign: 'right', color: 'var(--income)' }}>In</th>
                                    <th style={{ padding: 'var(--space-2)', textAlign: 'right', color: 'var(--need)' }}>Needs</th>
                                    <th style={{ padding: 'var(--space-2)', textAlign: 'right', color: 'var(--want)' }}>Wants</th>
                                    <th style={{ padding: 'var(--space-2)', textAlign: 'right' }}>Saved</th>
                                </tr>
                            </thead>
                            <tbody>
                                {comparison.map((month, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid var(--bg-primary)' }}>
                                        <td style={{ padding: 'var(--space-2)' }}>{month.month}</td>
                                        <td style={{ padding: 'var(--space-2)', textAlign: 'right' }}>{formatCurrency(month.income)}</td>
                                        <td style={{ padding: 'var(--space-2)', textAlign: 'right' }}>{formatCurrency(month.needs)}</td>
                                        <td style={{ padding: 'var(--space-2)', textAlign: 'right' }}>{formatCurrency(month.wants)}</td>
                                        <td style={{
                                            padding: 'var(--space-2)',
                                            textAlign: 'right',
                                            color: month.savings >= 0 ? 'var(--income)' : 'var(--danger)'
                                        }}>
                                            {formatCurrency(month.savings)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Danger Zone */}
            <div className="card" style={{ borderLeft: '3px solid var(--danger)' }}>
                <div style={{ fontWeight: 500, color: 'var(--danger)', marginBottom: 'var(--space-2)' }}>
                    Danger Zone
                </div>
                <div className="text-muted" style={{ fontSize: '14px', marginBottom: 'var(--space-3)' }}>
                    This will permanently delete all your data
                </div>
                <button
                    className="btn"
                    onClick={clearAllData}
                    style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}
                >
                    🗑️ Clear All Data
                </button>
            </div>
        </div>
    );
}
