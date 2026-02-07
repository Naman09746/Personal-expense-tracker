// Streak tracking and gamification service
import type { StreakData, Achievement } from '../types';
import { getEntries } from './storage';

const STREAK_KEY = 'expense-tracker-streak';
const ACHIEVEMENTS_KEY = 'expense-tracker-achievements';

// Get current streak data
export const getStreakData = (): StreakData => {
    const stored = localStorage.getItem(STREAK_KEY);
    if (stored) {
        return JSON.parse(stored);
    }
    return {
        currentStreak: 0,
        longestStreak: 0,
        lastEntryDate: '',
        totalDaysWithEntries: 0
    };
};

// Update streak when new entry is added
export const updateStreak = (entryDate: string): StreakData => {
    const today = new Date().toISOString().split('T')[0];
    const streak = getStreakData();

    // If entry is for today or yesterday, continue/start streak
    if (entryDate === today || entryDate === getYesterday()) {
        if (streak.lastEntryDate === getYesterday() || streak.lastEntryDate === '') {
            streak.currentStreak += 1;
        } else if (streak.lastEntryDate !== today) {
            // Streak was broken
            streak.currentStreak = 1;
        }
    } else {
        // Old entry, don't affect streak
        return streak;
    }

    streak.lastEntryDate = today;
    streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak);
    streak.totalDaysWithEntries += 1;

    localStorage.setItem(STREAK_KEY, JSON.stringify(streak));

    // Check for achievements
    checkStreakAchievements(streak.currentStreak);

    return streak;
};

// Check if streak is still valid
export const validateStreak = (): void => {
    const streak = getStreakData();
    const today = new Date().toISOString().split('T')[0];
    const yesterday = getYesterday();

    // Check if last entry was yesterday or today
    if (streak.lastEntryDate !== today && streak.lastEntryDate !== yesterday) {
        // Streak is broken
        streak.currentStreak = 0;
        localStorage.setItem(STREAK_KEY, JSON.stringify(streak));
    }
};

// Helper to get yesterday's date
const getYesterday = (): string => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
};

// ========== ACHIEVEMENTS ==========

const ACHIEVEMENT_DEFINITIONS: Achievement[] = [
    {
        id: 'first_entry',
        name: 'Getting Started',
        description: 'Add your first entry',
        icon: 'Sparkles',
        isUnlocked: false
    },
    {
        id: 'week_warrior',
        name: 'Week Warrior',
        description: 'Maintain a 7-day streak',
        icon: 'Flame',
        isUnlocked: false
    },
    {
        id: 'month_master',
        name: 'Month Master',
        description: 'Maintain a 30-day streak',
        icon: 'Trophy',
        isUnlocked: false
    },
    {
        id: 'consistent_tracker',
        name: 'Consistent Tracker',
        description: 'Track for 90 consecutive days',
        icon: 'Target',
        isUnlocked: false
    },
    {
        id: 'saver',
        name: 'Smart Saver',
        description: 'Save 20% or more in a month',
        icon: 'PiggyBank',
        isUnlocked: false
    },
    {
        id: 'budget_master',
        name: 'Budget Master',
        description: 'Stay under budget for 3 months',
        icon: 'Award',
        isUnlocked: false
    }
];

// Get all achievements with unlock status
export const getAchievements = (): Achievement[] => {
    const stored = localStorage.getItem(ACHIEVEMENTS_KEY);
    if (stored) {
        const unlocked = JSON.parse(stored) as string[];
        return ACHIEVEMENT_DEFINITIONS.map(ach => ({
            ...ach,
            isUnlocked: unlocked.includes(ach.id),
            unlockedAt: unlocked.includes(ach.id) ? Date.now() : undefined
        }));
    }
    return ACHIEVEMENT_DEFINITIONS;
};

// Unlock an achievement
export const unlockAchievement = (achievementId: string): boolean => {
    const achievements = getAchievements();
    const achievement = achievements.find(a => a.id === achievementId);

    if (!achievement || achievement.isUnlocked) {
        return false; // Already unlocked or doesn't exist
    }

    const stored = localStorage.getItem(ACHIEVEMENTS_KEY);
    const unlocked = stored ? JSON.parse(stored) : [];

    if (!unlocked.includes(achievementId)) {
        unlocked.push(achievementId);
        localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(unlocked));
        return true; // Newly unlocked
    }

    return false;
};

// Check and unlock streak-based achievements
const checkStreakAchievements = (currentStreak: number): void => {
    const entries = getEntries();

    // First entry
    if (entries.length === 1) {
        unlockAchievement('first_entry');
    }

    // Streak achievements
    if (currentStreak >= 7) {
        unlockAchievement('week_warrior');
    }
    if (currentStreak >= 30) {
        unlockAchievement('month_master');
    }
    if (currentStreak >= 90) {
        unlockAchievement('consistent_tracker');
    }
};

// Get unlocked achievements count
export const getUnlockedCount = (): number => {
    const achievements = getAchievements();
    return achievements.filter(a => a.isUnlocked).length;
};

// Get total achievements count
export const getTotalAchievements = (): number => {
    return ACHIEVEMENT_DEFINITIONS.length;
};

// Check if any new achievement was just unlocked
export const checkNewAchievements = (): Achievement | null => {
    // This would be called after adding an entry
    // Returns the latest unlocked achievement if any
    const achievements = getAchievements();
    const latestUnlocked = achievements
        .filter(a => a.isUnlocked && a.unlockedAt)
        .sort((a, b) => (b.unlockedAt || 0) - (a.unlockedAt || 0))[0];

    return latestUnlocked || null;
};
