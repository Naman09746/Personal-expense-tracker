# 💰 Personal Expense Tracker

> A production-grade, gamified personal finance app with beautiful gradients, animated charts, and streak tracking

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://personal-expense-tracker-iota-ten.vercel.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.x-61dafb)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646cff)](https://vitejs.dev/)

## ✨ Features

### 🎨 Modern UI/UX
- **Gradient Theme** - Beautiful gradients across all cards and navigation
- **Glassmorphism Effects** - Modern frosted glass card designs
- **Smooth Animations** - 800ms chart animations, pulse effects, and transitions
- **Dark Mode** - Full dark theme support with optimized gradients
- **Lucide Icons** - Professional icon set throughout (no emojis!)

### 📊 Advanced Visualizations
- **Animated Donut Chart** - Real-time spending breakdown with smooth transitions
- **Live Percentages** - Dynamic calculation of category distributions
- **4 Summary Cards** - Income, Needs, Lifestyle, and Savings at a glance
- **Color-Coded Legend** - Easy-to-read breakdown with category colors

### 🎮 Gamification
- **Daily Streak Tracking** 🔥 - Track consecutive days with entries
- **6 Achievement Badges** 🏆:
  - Getting Started (First entry)
  - Week Warrior (7-day streak)
  - Month Master (30-day streak)
  - Consistent Tracker (90-day streak)
  - Smart Saver (20%+ savings rate)
  - Budget Master (Under budget for 3 months)
- **Animated Badges** - Pulse effects and visual feedback
- **Progress Tracking** - See your unlocked achievements (X/6)

### 💳 Smart Category System
**3-Tier Organization** with 17 specific categories:

- **Needs** (Essential Expenses)
  - Food & Groceries
  - Meals
  - Transport
  - Fuel
  - Rent & Utilities
  - Education
  - Health & Hygiene

- **Lifestyle** (Discretionary Spending)
  - Eating Out
  - Entertainment
  - Shopping
  - Travel & Trips
  - Hobbies
  - Gifts

- **Savings & Goals**
  - Emergency Fund
  - Gadgets
  - Future Goals

### 🚀 UX Enhancements
- **Toast Notifications** - Instant feedback for all actions
- **Swipe-to-Delete** - Smooth gesture controls on mobile
- **Smart Month Navigation** - Easy browsing of historical data
- **Auto-Validation** - Streak validation and data integrity checks
- **Responsive Design** - Optimized for iPhone XR and all mobile devices

### 🔒 Privacy First
- **100% Local Storage** - All data stays on your device
- **No Server Calls** - Complete offline functionality
- **No Tracking** - Zero analytics or third-party scripts
- **Data Privacy** - Your financial data never leaves your phone

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **Charts**: Recharts
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Styling**: Vanilla CSS with CSS Variables
- **Deployment**: Vercel
- **Storage**: Browser LocalStorage API

## 📱 Live Demo

👉 **[Try it now](https://personal-expense-tracker-iota-ten.vercel.app)**

Optimized for mobile devices (iPhone XR and similar)

## 🎯 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/Personal-expense-tracker.git

# Navigate to project directory
cd Personal-expense-tracker

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view it in your browser.

### Build for Production

```bash
npm run build
```

Outputs to `dist/` folder, ready for deployment.

## 📸 Screenshots

### Home Dashboard with Streak & Charts
- Daily streak counter with fire icon
- Achievement progress tracker
- 4 gradient summary cards
- Animated donut chart showing category breakdown

### Add Entry Flow
- Beautiful category group selection
- Professional Lucide icons
- Two-step category selection (Group → Category)
- Toast confirmations

### History with Swipe-to-Delete
- Chronological entry list
- Swipe left to reveal delete button
- Lucide icons for all categories
- Toast confirmation on delete

## 🎨 Design System

### Color Palette

**Category Groups**
- Needs: `#10b981` (Emerald)
- Lifestyle: `#6366f1` (Indigo)
- Savings: `#a855f7` (Purple)

**Gamification**
- Streak: `#f97316` (Orange)
- Achievements: `#f59e0b` (Amber)

**Status**
- Positive: `#10b981` (Green)
- Negative: `#ef4444` (Red)

### Gradient Examples

```css
/* FAB Button */
background: linear-gradient(135deg, #6366f1, #8b5cf6);

/* Income Card */
background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05));

/* Streak Badge */
background: linear-gradient(135deg, rgba(251, 146, 60, 0.15), rgba(249, 115, 22, 0.1));
```

## 📦 Project Structure

```
src/
├── pages/
│   ├── Home.tsx          # Dashboard with charts & streaks
│   ├── AddEntry.tsx      # Entry creation with category selection
│   ├── History.tsx       # Entry history with swipe-to-delete
│   ├── Insights.tsx      # Analytics page
│   └── Settings.tsx      # App settings & data export
├── services/
│   ├── storage.ts        # LocalStorage management
│   └── gamification.ts   # Streak & achievements logic
├── utils/
│   └── iconMap.tsx       # Lucide icon mappings
├── types.ts              # TypeScript type definitions
└── index.css             # Global styles with gradients
```

## 🎯 Core Features Explained

### Streak Tracking
Automatically tracks consecutive days with entries. Streak increments when you add an entry today or yesterday. Breaks if 2+ days pass without an entry. Longest streak is always preserved.

### Achievement System
Automatically unlocks badges when you meet criteria. Progress persists in localStorage. Visual feedback when new achievements unlock.

### Category Intelligence
Smart mapping between categories and groups. Auto-assigns priority based on selected category. Backward compatible with legacy entries.

### Data Management
All data stored in browser localStorage. Efficient querying with indexed lookups. Automatic validation and cleanup. Export to CSV available in Settings.

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod
```

### Other Platforms
Build the project and deploy the `dist/` folder to any static hosting:
- Netlify
- GitHub Pages
- Cloudflare Pages
- AWS S3

## 🔧 Configuration

### Theme Customization
Edit CSS variables in `src/index.css`:

```css
:root {
  --primary: #6366f1;
  --need: #10b981;
  --want: #6366f1;
  --income: #10b981;
  --danger: #ef4444;
}
```

### Adding New Categories
Update `src/types.ts` to add new categories to any group.

## 📊 Performance

- **Bundle Size**: 170KB gzipped
- **Load Time**: <2s on 3G
- **Lighthouse Score**: 95+ (Performance)
- **First Contentful Paint**: <1.5s

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Icons by [Lucide](https://lucide.dev/)
- Charts by [Recharts](https://recharts.org/)
- Notifications by [React Hot Toast](https://react-hot-toast.com/)
- Deployed on [Vercel](https://vercel.com/)

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

**Made with ❤️ and modern web technologies**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/Personal-expense-tracker)
