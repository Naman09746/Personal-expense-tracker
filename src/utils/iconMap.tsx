// Icon mapping for categories using Lucide React
import {
    ShoppingCart,
    UtensilsCrossed,
    Bus,
    Fuel,
    Home,
    BookOpen,
    HeartPulse,
    Coffee,
    Film,
    ShoppingBag,
    Plane,
    Gamepad2,
    Gift,
    Shield,
    Smartphone,
    Target,
    CircleCheck,
    Sparkles,
    Wallet,
    Plus,
    Trash2,
    Edit,
    Check,
    X,
    Settings,
    Moon,
    Sun,
    ChevronLeft,
    ChevronRight,
    Download,
    Flame,
    Trophy,
    TrendingUp,
    TrendingDown,
    CircleDollarSign,
    type LucideIcon
} from 'lucide-react';
import type { Category, CategoryGroup } from '../types';

// Fallback icon for unknown categories
export const FallbackIcon = CircleDollarSign;

// Category Icons
export const CategoryIconMap: Record<Category, LucideIcon> = {
    // Needs
    FoodGroceries: ShoppingCart,
    Meals: UtensilsCrossed,
    Transport: Bus,
    Fuel: Fuel,
    RentUtilities: Home,
    Education: BookOpen,
    HealthHygiene: HeartPulse,
    // Lifestyle
    EatingOut: Coffee,
    Entertainment: Film,
    Shopping: ShoppingBag,
    TravelTrips: Plane,
    Hobbies: Gamepad2,
    Gifts: Gift,
    // Savings
    EmergencyFund: Shield,
    Gadgets: Smartphone,
    FutureGoals: Target
};

// Category Group Icons
export const GroupIconMap: Record<CategoryGroup, LucideIcon> = {
    needs: CircleCheck,
    lifestyle: Sparkles,
    savings: Wallet
};

// Action Icons
export const ActionIcons = {
    Plus,
    Trash: Trash2,
    Edit,
    Check,
    Close: X,
    Settings,
    Moon,
    Sun,
    ChevronLeft,
    ChevronRight,
    Download,
    Flame,
    Trophy,
    TrendingUp,
    TrendingDown
};

// Helper function to get icon component by category (with fallback for unknown categories)
export const getCategoryIcon = (category: Category): LucideIcon => {
    return CategoryIconMap[category] || FallbackIcon;
};

// Helper function to get icon component by group
export const getGroupIcon = (group: CategoryGroup): LucideIcon => {
    return GroupIconMap[group];
};
