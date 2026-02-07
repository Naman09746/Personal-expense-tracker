import { useState, useEffect, useRef } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import type { Entry, Category, EntryType, CategoryGroup } from '../types';
import {
    NEEDS_CATEGORIES,
    LIFESTYLE_CATEGORIES,
    SAVINGS_CATEGORIES,
    CATEGORY_LABELS,
    CATEGORY_TO_GROUP,
    CATEGORY_GROUP_META
} from '../types';
import { getCategoryIcon, getGroupIcon, ActionIcons } from '../utils/iconMap';
import { addEntry, updateEntry } from '../services/storage';
import { updateStreak } from '../services/gamification';

interface AddEntryProps {
    onClose: () => void;
    onSave: () => void;
    editEntry?: Entry | null;
}

export default function AddEntry({ onClose, onSave, editEntry }: AddEntryProps) {
    const [amount, setAmount] = useState(editEntry?.amount?.toString() || '');
    const [type, setType] = useState<EntryType>(editEntry?.type || 'expense');
    const [categoryGroup, setCategoryGroup] = useState<CategoryGroup | null>(
        editEntry ? (editEntry.categoryGroup || CATEGORY_TO_GROUP[editEntry.category]) : null
    );
    const [category, setCategory] = useState<Category>(editEntry?.category || 'FoodGroceries');
    const [date, setDate] = useState(editEntry?.date || new Date().toISOString().split('T')[0]);
    const [note, setNote] = useState(editEntry?.note || '');
    const [showSuccess, setShowSuccess] = useState(false);

    const amountRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (amountRef.current && !editEntry) {
            amountRef.current.focus();
        }
    }, [editEntry]);

    const handleSave = () => {
        const parsedAmount = parseFloat(amount);
        if (!parsedAmount || parsedAmount <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        if (type === 'expense' && !categoryGroup) {
            toast.error('Please select a category group');
            return;
        }

        const selectedCategoryGroup = type === 'income' ? 'needs' : categoryGroup!;
        const priority = selectedCategoryGroup === 'needs' ? 'needs' : selectedCategoryGroup === 'lifestyle' ? 'lifestyle' : 'savings';

        const entryData = {
            amount: parsedAmount,
            type,
            category,
            categoryGroup: selectedCategoryGroup,
            priority: priority as any,
            date,
            note: note.trim() || undefined
        };

        if (editEntry) {
            updateEntry(editEntry.id, entryData);
            toast.success('Entry updated!');
        } else {
            addEntry(entryData);
            updateStreak(date); // Update streak tracking
            toast.success('Entry added!');
        }

        setShowSuccess(true);

        if ('vibrate' in navigator) {
            navigator.vibrate(50);
        }

        setTimeout(() => {
            onSave();
            onClose();
        }, 400);
    };

    const getCategoriesForGroup = (group: CategoryGroup): Category[] => {
        if (group === 'needs') return NEEDS_CATEGORIES;
        if (group === 'lifestyle') return LIFESTYLE_CATEGORIES;
        return SAVINGS_CATEGORIES;
    };

    if (showSuccess) {
        return (
            <div className="sheet" onClick={onClose}>
                <div className="sheet-content" onClick={e => e.stopPropagation()}>
                    <div className="success-check">
                        <ActionIcons.Check size={48} strokeWidth={3} />
                    </div>
                    <div className="text-center h3">
                        {editEntry ? 'Updated!' : 'Added!'}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <Toaster position="top-center" />
            <div className="sheet" onClick={onClose}>
                <div className="sheet-content" onClick={e => e.stopPropagation()}>
                    {/* Header */}
                    <div className="sheet-header">
                        <h2>{editEntry ? 'Edit Entry' : 'Add Entry'}</h2>
                        <button className="sheet-close" onClick={onClose}>
                            <ActionIcons.Close size={20} />
                        </button>
                    </div>

                    {/* Amount Input */}
                    <div className="form-section">
                        <input
                            ref={amountRef}
                            type="number"
                            inputMode="decimal"
                            className="input input-amount"
                            placeholder="₹0"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                        />
                    </div>

                    {/* Type Toggle */}
                    <div className="form-section">
                        <div className="toggle-group">
                            <button
                                className={`toggle-btn income ${type === 'income' ? 'active' : ''}`}
                                onClick={() => setType('income')}
                            >
                                💰 Income
                            </button>
                            <button
                                className={`toggle-btn expense ${type === 'expense' ? 'active' : ''}`}
                                onClick={() => setType('expense')}
                            >
                                💸 Expense
                            </button>
                        </div>
                    </div>

                    {/* Category Group Selection (only for expenses) */}
                    {type === 'expense' && !categoryGroup && (
                        <div className="form-section">
                            <label className="form-label">Select Category Type</label>
                            <div className="category-group-grid">
                                {(['needs', 'lifestyle', 'savings'] as CategoryGroup[]).map(group => {
                                    const GroupIcon = getGroupIcon(group);
                                    const meta = CATEGORY_GROUP_META[group];
                                    return (
                                        <button
                                            key={group}
                                            className={`category-group-card ${group}`}
                                            onClick={() => setCategoryGroup(group)}
                                        >
                                            <GroupIcon size={32} strokeWidth={2} />
                                            <div className="category-group-label">{meta.label}</div>
                                            <div className="category-group-desc">{meta.description}</div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Category Selection (when group is selected) */}
                    {type === 'expense' && categoryGroup && (
                        <div className="form-section">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                                <label className="form-label" style={{ marginBottom: 0 }}>
                                    {CATEGORY_GROUP_META[categoryGroup].label}
                                </label>
                                <button
                                    className="btn-link"
                                    onClick={() => setCategoryGroup(null)}
                                    style={{ fontSize: '14px', color: 'var(--text-secondary)' }}
                                >
                                    Change
                                </button>
                            </div>
                            <div className="category-grid">
                                {getCategoriesForGroup(categoryGroup).map(cat => {
                                    const Icon = getCategoryIcon(cat);
                                    return (
                                        <button
                                            key={cat}
                                            className={`category-btn ${category === cat ? 'active' : ''}`}
                                            onClick={() => setCategory(cat)}
                                        >
                                            <span className="category-icon">
                                                <Icon size={24} strokeWidth={2} />
                                            </span>
                                            <span className="category-label">{CATEGORY_LABELS[cat]}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Date */}
                    <div className="form-section">
                        <label className="form-label">Date</label>
                        <input
                            type="date"
                            className="input"
                            value={date}
                            max={new Date().toISOString().split('T')[0]}
                            onChange={e => setDate(e.target.value)}
                        />
                    </div>

                    {/* Note */}
                    <div className="form-section">
                        <label className="form-label">Note (optional)</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="What was this for?"
                            value={note}
                            onChange={e => setNote(e.target.value)}
                        />
                    </div>

                    {/* Save Button */}
                    <button
                        className="btn btn-primary btn-large btn-block"
                        onClick={handleSave}
                        disabled={!amount || parseFloat(amount) <= 0}
                        style={{ opacity: !amount || parseFloat(amount) <= 0 ? 0.5 : 1 }}
                    >
                        {editEntry ? 'Update Entry' : 'Save Entry'}
                    </button>
                </div>
            </div>
        </>
    );
}
