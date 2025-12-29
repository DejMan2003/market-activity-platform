# Market Sense AI 📈

An educational market analytics platform powered by AI, designed to provide real-time volatility tracking, trend scoring, and risk analysis for stocks, ETFs, and cryptocurrencies.

![Market Sense AI Dashboard](https://your-screenshot-url-here.png)

## Features

- **Real-time Market Data**: Live tracking of major indices, stocks, and crypto (via Yahoo Finance).
- **AI Activity Score**: Proprietary 1-10 scoring system to identify high-activity assets.
- **Risk Analysis**: Automated risk categorization (Low, Medium, High, Volatile).
- **Interactive Dashboard**: Beautiful, responsive UI built with Tailwind CSS and Shadcn UI.
- **Region & Asset Filtering**: dynamic filtering by geography and asset class.

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **UI Library**: [Shadcn UI](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Data Fetching**: [Yahoo Finance 2](https://github.com/gadicc/node-yahoo-finance2)

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/market-sense-ai.git
   cd market-sense-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/              # Next.js App Router pages and API routes
├── components/       # React components (Dashboard, MarketCard, etc.)
├── lib/              # Utility functions and data fetching logic
└── types/            # TypeScript definitions
```

## Disclaimer

**Educational Purpose Only.** This application is for learning and demonstration purposes. It does not constitute financial advice. Always do your own research.
