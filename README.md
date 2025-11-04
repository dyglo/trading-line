# T-Line - Professional Trading Platform

**Elevate Your Trading with Advanced Institutional Indicators**

T-Line is a cutting-edge trading platform that empowers traders of all levels with AI-powered indicators, professional-grade tools, and comprehensive learning resources. Trade in Forex, Cryptocurrencies, Indices, and Stocks effortlessly with our advanced institutional indicators that identify market tops and bottoms in real-time.

## 🎯 App Goal & Mission

T-Line is designed to transform your trading journey by providing:

- **AI-Powered Trading Intelligence**: Advanced algorithms that adapt to market trends, identifying 'bottoms' and 'tops' with institutional-grade precision
- **Multi-Asset Trading**: Trade effortlessly across Forex, Cryptocurrencies, Indices, and Stocks all in one platform
- **Risk-Free Learning**: Practice with confidence using our demo account with $10,000 virtual capital
- **Professional Tools**: Access to institutional-grade charting, analytics, and trading tools

## ✨ Key Features

### 🚀 Trading Features
- **Real-Time Market Data**: Live price feeds for stocks, forex, crypto, and commodities with instant updates every 3 seconds
- **$10,000 Virtual Capital**: Practice trading strategies without financial risk
- **25+ Trading Instruments**: Trade stocks, forex pairs, cryptocurrencies, commodities, and indices
- **Professional TradingView Integration**: Advanced charts with real-time market data
- **Multiple Order Types**: Market, Limit, and Stop orders with automatic execution
- **Risk Management**: Set stop-loss and take-profit levels automatically
- **Performance Analytics**: Track P&L, win rate, profit factor, and equity curves in real-time

### 🎨 UI/UX Features
- **Dark/Light Theme Toggle**: Switch between dark and light modes with a beautiful moon/sun toggle button
- **3D Animated Sphere**: Interactive 3D glass orb with gold gradient animation using Three.js
- **Glassmorphic Design**: Transparent glass cards with gradient borders and backdrop blur effects
- **Responsive Design**: Fully responsive layout that works on all devices
- **Smooth Animations**: GSAP-powered animations and Framer Motion transitions throughout
- **Interactive Trading Charts**: Carousel-style chart dashboard with multiple trading instruments

### 📚 Educational Resources
- **Comprehensive Learning Materials**: Everything you need to go from beginner to confident trader
- **Trading Basics**: Understanding order types, positions, charts, and market terminology
- **Platform Features**: Master all the tools at your disposal
- **Risk Management**: Position sizing, stop-losses, and risk-reward ratios
- **Strategy Development**: Backtesting, analysis, and building consistent trading habits

## 🛠️ Technologies Used

### Core Framework
- **Vite**: Fast build tool and development server
- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Type-safe development
- **React Router DOM**: Client-side routing

### UI & Styling
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: High-quality React components built on Radix UI
- **Framer Motion**: Smooth animations and transitions
- **GSAP (GreenSock)**: Advanced animations with ScrollTrigger
- **Lucide React**: Beautiful icon library

### 3D Graphics
- **Three.js**: 3D graphics library for interactive sphere animations
- **Post-Processing**: Bloom effects and advanced rendering

### Trading Integration
- **TradingView Widgets**: Professional trading charts and market data
- **Zustand**: Lightweight state management for trading data

### Theme System
- **next-themes**: Theme management with dark/light mode support

### Additional Libraries
- **TanStack React Query**: Data fetching and caching
- **React Hook Form**: Form management
- **Zod**: Schema validation
- **date-fns**: Date manipulation

## 📁 Project Structure

```
project/
├── src/
│   ├── components/
│   │   ├── landing/          # Landing page sections
│   │   │   ├── HeroSection.tsx           # Hero with trading charts
│   │   │   ├── PartnersSection.tsx       # Partner logos
│   │   │   ├── ProToolkitsSection.tsx    # Pro toolkits showcase
│   │   │   ├── Sphere3DSection.tsx      # 3D sphere with goals
│   │   │   ├── FeaturesSection.tsx       # Feature grid
│   │   │   ├── HowItWorks.tsx           # Step-by-step guide
│   │   │   ├── EducationalResources.tsx  # Learning resources
│   │   │   ├── LiveDemoPreview.tsx      # Dashboard preview
│   │   │   ├── BenefitsSection.tsx      # Why choose T-Line
│   │   │   ├── CTASection.tsx            # Call-to-action
│   │   │   └── Footer.tsx                # Footer with theme toggle
│   │   ├── ui/                # shadcn/ui components
│   │   │   ├── theme-toggle.tsx         # Theme switcher
│   │   │   └── features-detail.tsx       # Dashboard carousel
│   │   ├── Header.tsx                    # Navigation header
│   │   ├── AnalyticsChart.tsx            # TradingView chart
│   │   ├── PortfolioDashboard.tsx        # Portfolio metrics
│   │   └── ...                          # Other components
│   ├── pages/
│   │   ├── Landing.tsx                   # Landing page
│   │   ├── Dashboard.tsx                 # Trading dashboard
│   │   └── NotFound.tsx                  # 404 page
│   ├── store/
│   │   └── tradingStore.ts               # Zustand trading store
│   ├── lib/
│   │   ├── utils.ts                      # Utility functions
│   │   └── tradingview.ts                # TradingView helpers
│   ├── App.tsx                           # Main app component
│   ├── main.tsx                          # Entry point
│   └── index.css                         # Global styles & theme
├── public/                               # Static assets
├── tailwind.config.ts                    # Tailwind configuration
├── tsconfig.json                         # TypeScript config
├── vite.config.ts                        # Vite configuration
└── package.json                          # Dependencies
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher) - [Install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- **npm** or **yarn** package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <YOUR_GIT_URL>
   cd trade-line/project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   - Navigate to `http://localhost:8080` (or the port shown in terminal)
   - The app will automatically reload when you make changes

### Build for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## 🎨 Design System

### Color Palette

- **Primary (Gold)**: `hsl(43, 96%, 56%)` - Main accent color for buttons, borders, highlights
- **Background**: 
  - Dark mode: Pure black `hsl(0, 0%, 0%)`
  - Light mode: White `hsl(0, 0%, 100%)`
- **Card**: 
  - Dark mode: `hsl(0, 0%, 5%)`
  - Light mode: `hsl(0, 0%, 98%)`
- **Long (Green)**: `hsl(142, 76%, 36%)` - Profitable trades
- **Short (Red)**: `hsl(0, 72%, 51%)` - Losses

### Theme System

The app supports both dark and light themes:
- **Dark Theme** (Default): Pure black background with gold accents
- **Light Theme**: White background with gold accents
- **Theme Toggle**: Located in the footer with moon/sun icons
- **Automatic**: All components use CSS variables for seamless theme switching

## 🌟 Key Components

### Landing Page Sections

1. **Hero Section**: 
   - Main headline with animated trading charts
   - Carousel-style chart dashboard with 3 trading instruments
   - Early Access and Join Now CTAs

2. **Partners Section**: 
   - Showcases trusted partners (BYBIT, BINANCE, Bitcoin, Meta, BingX)

3. **Pro Toolkits Section**: 
   - Professional trading tools showcase
   - Interactive chart with timeframe selector

4. **3D Sphere Section**: 
   - Interactive 3D animated glass orb with gold gradient
   - App goals and help section

5. **Features Section**: 
   - Grid of key features with icons

6. **How It Works**: 
   - Step-by-step guide to using the platform

7. **Educational Resources**: 
   - Comprehensive learning materials
   - Trading basics, platform features, risk management, strategy development

8. **Live Demo Preview**: 
   - Transparent glass card with 3D sphere background
   - Real-time dashboard preview with account metrics

9. **Benefits Section**: 
   - Why choose T-Line with glassmorphic cards

10. **CTA Section**: 
    - Final call-to-action to get started

### Dashboard Features

- **Analytics Chart**: TradingView integration for professional charting
- **Portfolio Dashboard**: Performance metrics, win rate, profit factor
- **Account Panel**: Balance, equity, and account information
- **Orders Panel**: Place and manage orders
- **Trades History**: Complete trade history with P&L
- **Ticker Tape**: Real-time market ticker

## 🎯 Core Goals

1. **Master Trading Strategies**: Learn professional techniques with AI-powered indicators
2. **Multi-Asset Trading**: Trade across Forex, Cryptocurrencies, Indices, and Stocks
3. **AI-Powered Insights**: Advanced algorithms that adapt to market trends
4. **Risk-Free Learning**: Practice with confidence using demo account

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style

- **TypeScript**: Strict type checking enabled
- **ESLint**: Code linting for quality assurance
- **Prettier**: Code formatting (if configured)

## 📦 Dependencies

### Core Dependencies
- `react` & `react-dom`: ^18.3.1
- `react-router-dom`: ^6.30.1
- `typescript`: ^5.8.3
- `vite`: ^5.4.19

### UI & Styling
- `tailwindcss`: ^3.4.17
- `framer-motion`: ^12.23.24
- `lucide-react`: ^0.462.0
- `@radix-ui/*`: Component primitives

### Animation & 3D
- `gsap`: ^3.13.0
- `three`: Latest
- `@types/three`: TypeScript types

### State Management
- `zustand`: ^5.0.8
- `@tanstack/react-query`: ^5.83.0

### Theme
- `next-themes`: ^0.3.0

## 🚢 Deployment

### Via Lovable

Simply open [Lovable Project](https://lovable.dev/projects/b4457f70-ef91-4a4d-8898-aa7e16bd87d8) and click on **Share → Publish**.

### Custom Domain

To connect a custom domain:
1. Navigate to **Project > Settings > Domains**
2. Click **Connect Domain**
3. Follow the setup instructions

[Learn more about custom domains](https://docs.lovable.dev/features/custom-domain#custom-domain)

## 📝 License

This project is private and proprietary.

## 🤝 Contributing

This is a private project. For changes and updates, please use the Lovable platform or submit changes through the repository.

## 📧 Contact

For questions or support, please contact through the Lovable platform.

---

**Built with ❤️ using Lovable, React, and modern web technologies**
