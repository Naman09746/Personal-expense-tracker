// LocalStorage service for persisting expense data
import type { Entry, MonthlyData, CategoryChartData, TrendData, GroupedData, CategoryGroup, Category } from '../types';
import { CATEGORY_TO_GROUP, CATEGORY_LABELS } from '../types';

const STORAGE_KEY = 'expense-tracker-entries';

// Generate unique ID
export const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Get all entries from storage
export const getEntries = (): Entry[] => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return [];
        return JSON.parse(data) as Entry[];
    } catch {
        console.error('Error reading from localStorage');
        return [];
    }
};

// Save all entries to storage
const saveEntries = (entries: Entry[]): void => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {
        console.error('Error saving to localStorage');
    }
};

// Add a new entry
export const addEntry = (entry: Omit<Entry, 'id' | 'createdAt'>): Entry => {
    const entries = getEntries();
    const newEntry: Entry = {
        ...entry,
        id: generateId(),
        createdAt: Date.now()
    };
    entries.push(newEntry);
    saveEntries(entries);
    return newEntry;
};

// Update an existing entry
export const updateEntry = (id: string, updates: Partial<Omit<Entry, 'id' | 'createdAt'>>): Entry | null => {
    const entries = getEntries();
    const index = entries.findIndex(e => e.id === id);
    if (index === -1) return null;

    entries[index] = { ...entries[index], ...updates };
    saveEntries(entries);
    return entries[index];
};

// Delete an entry
export const deleteEntry = (id: string): boolean => {
    const entries = getEntries();
    const filtered = entries.filter(e => e.id !== id);
    if (filtered.length === entries.length) return false;

    saveEntries(filtered);
    return true;
};

// Get entries for a specific month
export const getEntriesByMonth = (year: number, month: number): Entry[] => {
    const entries = getEntries();
    return entries.filter(entry => {
        const date = new Date(entry.date);
        return date.getFullYear() === year && date.getMonth() === month;
    }).sort((a, b) => b.createdAt - a.createdAt);
};

// Calculate monthly summary
export const getMonthlyData = (year: number, month: number): MonthlyData => {
    const entries = getEntriesByMonth(year, month);

    let totalIncome = 0;
    let totalNeeds = 0;
    let totalLifestyle = 0;
    let totalSavings = 0;

    entries.forEach(entry => {
        if (entry.type === 'income') {
            totalIncome += entry.amount;
        } else {
            // Use categoryGroup if available, fallback to priority for backward compatibility
            const group = (entry as any).categoryGroup || entry.priority;
            if (group === 'needs' || group === 'need') {
                totalNeeds += entry.amount;
            } else if (group === 'lifestyle') {
                totalLifestyle += entry.amount;
            } else if (group === 'savings') {
                totalSavings += entry.amount;
            } else if (group === 'want') {
                // Legacy data - map 'want' to 'lifestyle'
                totalLifestyle += entry.amount;
            }
        }
    });

    return {
        totalIncome,
        totalNeeds,
        totalLifestyle,
        totalSavings,
        totalWants: totalLifestyle, // For backward compatibility
        balance: totalIncome - totalNeeds - totalLifestyle - totalSavings
    };
};

// Get entries grouped by date
export const getEntriesGroupedByDate = (year: number, month: number): Record<string, Entry[]> => {
    const entries = getEntriesByMonth(year, month);
    const grouped: Record<string, Entry[]> = {};

    entries.forEach(entry => {
        if (!grouped[entry.date]) {
            grouped[entry.date] = [];
        }
        grouped[entry.date].push(entry);
    });

    return grouped;
};

// Format currency for display (Indian Rupees)
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};

// Format date for display
export const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateStr === today.toISOString().split('T')[0]) {
        return 'Today';
    }
    if (dateStr === yesterday.toISOString().split('T')[0]) {
        return 'Yesterday';
    }

    return date.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
    });
};

// ============ THEME MANAGEMENT ============
const THEME_KEY = 'expense-tracker-theme';

export type Theme = 'light' | 'dark';

export const getTheme = (): Theme => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
    // Default to system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    return 'light';
};

export const setTheme = (theme: Theme): void => {
    localStorage.setItem(THEME_KEY, theme);
    document.documentElement.setAttribute('data-theme', theme);
};

export const initTheme = (): void => {
    const theme = getTheme();
    document.documentElement.setAttribute('data-theme', theme);
};

// ============ CSV EXPORT ============
export const exportToCSV = (): void => {
    const entries = getEntries();
    if (entries.length === 0) {
        alert('No entries to export!');
        return;
    }

    const headers = ['Date', 'Type', 'Category', 'Priority', 'Amount', 'Note'];
    const rows = entries.map(entry => [
        entry.date,
        entry.type,
        entry.category,
        entry.priority,
        entry.amount.toString(),
        entry.note || ''
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `expenses_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

// ============ MONTHLY COMPARISON ============
export interface MonthlyComparison {
    month: string;
    year: number;
    monthNum: number;
    income: number;
    needs: number;
    wants: number;
    savings: number;
}

export const getMonthlyComparison = (numMonths: number = 6): MonthlyComparison[] => {
    const result: MonthlyComparison[] = [];
    const today = new Date();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = numMonths - 1; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const year = date.getFullYear();
        const month = date.getMonth();
        const data = getMonthlyData(year, month);

        result.push({
            month: monthNames[month],
            year,
            monthNum: month,
            income: data.totalIncome,
            needs: data.totalNeeds,
            wants: data.totalWants,
            savings: data.balance
        });
    }

    return result;
};

// ============ CLEAR ALL DATA ============
export const clearAllData = (): void => {
    if (confirm('Are you sure you want to delete ALL your expense data? This cannot be undone!')) {
        localStorage.removeItem(STORAGE_KEY);
    }
};

// ============ NEW CATEGORY HELPER FUNCTIONS ============

// Get category group totals
export const getCategoryGroupData = (year: number, month: number): GroupedData => {
    const entries = getEntriesByMonth(year, month).filter(e => e.type === 'expense');

    const grouped: GroupedData = {
        needs: 0,
        lifestyle: 0,
        savings: 0
    };

    entries.forEach(entry => {
        const group = (entry as any).categoryGroup || entry.priority;
        if (group === 'needs' || group === 'need') {
            grouped.needs += entry.amount;
        } else if (group === 'lifestyle' || group === 'want') {
            grouped.lifestyle += entry.amount;
        } else if (group === 'savings') {
            grouped.savings += entry.amount;
        }
    });

    return grouped;
};

// Get live category breakdown for pie chart
export const getLiveCategoryBreakdown = (year: number, month: number): CategoryChartData[] => {
    const entries = getEntriesByMonth(year, month).filter(e => e.type === 'expense');

    const categoryTotals: Record<string, number> = {};
    let total = 0;

    entries.forEach(entry => {
        const cat = entry.category;
        categoryTotals[cat] = (categoryTotals[cat] || 0) + entry.amount;
        total += entry.amount;
    });

    const colors: Record<CategoryGroup, string> = {
        needs: '#10b981',
        lifestyle: '#6366f1',
        savings: '#a855f7'
    };

    return Object.entries(categoryTotals).map(([category, value]) => {
        const group = CATEGORY_TO_GROUP[category as Category] || 'needs';
        return {
            name: CATEGORY_LABELS[category as Category] || category,
            value,
            color: colors[group],
            percentage: total > 0 ? Math.round((value / total) * 100) : 0
        };
    }).sort((a, b) => b.value - a.value);
};

// Get spending trend for last N days
export const getSpendingTrend = (days: number = 7): TrendData[] => {
    const entries = getEntries().filter(e => e.type === 'expense');
    const today = new Date();
    const result: TrendData[] = [];

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        const dayEntries = entries.filter(e => e.date === dateStr);

        let needs = 0;
        let lifestyle = 0;
        let savings = 0;

        dayEntries.forEach(entry => {
            const group = (entry as any).categoryGroup || entry.priority;
            if (group === 'needs' || group === 'need') {
                needs += entry.amount;
            } else if (group === 'lifestyle' || group === 'want') {
                lifestyle += entry.amount;
            } else if (group === 'savings') {
                savings += entry.amount;
            }
        });

        result.push({
            date: dateStr,
            needs,
            lifestyle,
            savings,
            total: needs + lifestyle + savings
        });
    }

    return result;
};
