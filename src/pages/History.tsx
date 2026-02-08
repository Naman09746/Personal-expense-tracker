import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import type { Entry, Category } from '../types';
import { CATEGORY_LABELS } from '../types';
import { getCategoryIcon, FallbackIcon } from '../utils/iconMap';
import { getEntriesByMonth, formatCurrency, formatDate, deleteEntry } from '../services/storage';

// Safe category label lookup with fallback
const getSafeCategoryLabel = (category: Category | string | undefined): string => {
    if (!category) return 'Unknown';
    return CATEGORY_LABELS[category as Category] || String(category);
};

interface HistoryProps {
    onEditEntry: (entry: Entry) => void;
    refreshKey: number;
    onRefresh: () => void;
}

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export default function History({ onEditEntry, refreshKey, onRefresh }: HistoryProps) {
    const today = new Date();
    const [month, setMonth] = useState(today.getMonth());
    const [year, setYear] = useState(today.getFullYear());
    const [swipedId, setSwipedId] = useState<string | null>(null);

    const entries = useMemo(() => {
        void refreshKey;
        return getEntriesByMonth(year, month);
    }, [year, month, refreshKey]);

    const groupedEntries = useMemo(() => {
        const groups: Record<string, Entry[]> = {};
        entries.forEach(entry => {
            if (!groups[entry.date]) {
                groups[entry.date] = [];
            }
            groups[entry.date].push(entry);
        });
        return groups;
    }, [entries]);

    const sortedDates = Object.keys(groupedEntries).sort((a, b) =>
        new Date(b).getTime() - new Date(a).getTime()
    );

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

    const handleDelete = (id: string) => {
        if (confirm('Delete this entry?')) {
            deleteEntry(id);
            setSwipedId(null);
            toast.success('Entry deleted');
            // Trigger refresh
            onRefresh();
        }
    };

    const isCurrentMonth = month === today.getMonth() && year === today.getFullYear();

    return (
        <div className="page">
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

            {/* Entries List */}
            {sortedDates.length > 0 ? (
                <div className="entries-list">
                    {sortedDates.map(date => {
                        const dayEntries = groupedEntries[date];
                        const dayTotal = dayEntries.reduce((sum, e) => {
                            return sum + (e.type === 'income' ? e.amount : -e.amount);
                        }, 0);

                        return (
                            <div key={date} className="date-group">
                                {/* Date Header */}
                                <div className="date-header">
                                    <div className="date-label">{formatDate(date)}</div>
                                    <div className={`date-total ${dayTotal >= 0 ? 'income' : 'expense'}`}>
                                        {dayTotal >= 0 ? '+' : ''}{formatCurrency(dayTotal)}
                                    </div>
                                </div>

                                {/* Entries for this date */}
                                {dayEntries.map(entry => {
                                    // Safe icon retrieval with explicit fallback
                                    const Icon = getCategoryIcon(entry.category) || FallbackIcon;
                                    const isIncome = entry.type === 'income';

                                    return (
                                        <div
                                            key={entry.id}
                                            className="entry-item-wrapper"
                                            style={{
                                                position: 'relative',
                                                overflow: 'hidden'
                                            }}
                                        >
                                            {/* Delete button (revealed on swipe) */}
                                            {swipedId === entry.id && (
                                                <div
                                                    className="entry-delete-btn"
                                                    onClick={() => handleDelete(entry.id)}
                                                    style={{
                                                        position: 'absolute',
                                                        right: 0,
                                                        top: 0,
                                                        bottom: 0,
                                                        width: '80px',
                                                        background: 'var(--danger)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: 'white',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <Trash2 size={20} />
                                                </div>
                                            )}

                                            {/* Entry Card */}
                                            <div
                                                className="entry-item"
                                                onClick={() => onEditEntry(entry)}
                                                onTouchStart={(e) => {
                                                    const touch = e.touches[0];
                                                    (e.currentTarget as any).startX = touch.clientX;
                                                }}
                                                onTouchMove={(e) => {
                                                    const touch = e.touches[0];
                                                    const startX = (e.currentTarget as any).startX;
                                                    if (startX) {
                                                        const diff = startX - touch.clientX;
                                                        if (diff > 50) {
                                                            setSwipedId(entry.id);
                                                        } else if (diff < -20) {
                                                            setSwipedId(null);
                                                        }
                                                    }
                                                }}
                                                style={{
                                                    transform: swipedId === entry.id ? 'translateX(-80px)' : 'translateX(0)',
                                                    transition: 'transform 200ms ease-out',
                                                    background: 'var(--bg-card)'
                                                }}
                                            >
                                                <div className="entry-icon" style={{
                                                    background: isIncome ? 'var(--income-bg)' :
                                                        entry.priority === 'needs' ? 'var(--need-bg)' :
                                                            entry.priority === 'lifestyle' ? 'rgba(99, 102, 241, 0.1)' :
                                                                'rgba(168, 85, 247, 0.1)'
                                                }}>
                                                    {isIncome ? '💰' : <Icon size={20} />}
                                                </div>
                                                <div className="entry-details">
                                                    <div className="entry-category">
                                                        {entry.type === 'income' ? 'Income' : getSafeCategoryLabel(entry.category)}
                                                    </div>
                                                    {entry.note && <div className="entry-note">{entry.note}</div>}
                                                    {entry.type === 'expense' && (
                                                        <div className="entry-badge">
                                                            {(entry as any).priority === 'need' || entry.priority === 'needs' ? 'Need' : entry.priority === 'savings' ? 'Savings' : 'Lifestyle'}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className={`entry-amount ${entry.type === 'income' ? 'income' : entry.priority}`}>
                                                    {entry.type === 'income' ? '+' : '-'}{formatCurrency(entry.amount)}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="empty-state">
                    <div className="empty-icon">📋</div>
                    <div className="empty-text">No entries this month</div>
                    <div className="empty-subtext">Switch months or add new entries</div>
                </div>
            )}
        </div>
    );
}
