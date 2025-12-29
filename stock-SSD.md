# Software System Design (SSD) – Market Sense AI

**Version:** 1.0  
**Author:** Ayodeji Onawunmi  
**Target Audience:** Beginner to Intermediate Investors  
**Primary Use Case:** Educational market analytics & trend awareness

---

## 1. System Overview

Market Sense AI is a web-based platform designed to help beginner and intermediate users explore financial markets (stocks, ETFs, options, crypto) with real-time data, trend scoring, and AI-driven beginner-friendly explanations.

Key Features:
- Market activity trends: volume spikes, price movements, and news
- Risk warnings for volatile assets
- Beginner-oriented guidance (informational only)
- Near real-time updates during market hours
- Multi-region support: US, Canada, UK

The system is implemented using **Next.js (React)** with server-side API routes to safely fetch market data.

---

## 2. Design Goals & Constraints

### Goals
- Provide a clear, minimalistic, beginner-friendly dashboard
- Highlight trending assets without offering financial advice
- Modular design for AI explanations and future mobile support
- Scalable, near real-time data display

### Constraints
- No direct financial advice
- Server-side API calls only
- Legally defensible educational content
- Must work across Canadian, American, and British markets

---

## 3. System Architecture

User (Browser)
|
v
Next.js Client (React UI)
|
v
Next.js API Routes (Server Proxy)
|
v
Yahoo Finance Public API

yaml
Copy code

- Client–Server architecture
- Component-based UI
- API Gateway pattern for market data

---

## 4. Technology Stack

**Frontend:** React (Next.js), TypeScript, Tailwind CSS  
**Backend:** Next.js API Routes, Node.js  
**Data Source:** Yahoo Finance API (server-side only)  
**Tooling:** Node.js, npm, Git, VS Code  

---

## 5. File & Module Structure

market-sense-ai/
├── app/
│ ├── page.tsx
│ ├── layout.tsx
│ └── api/market/route.ts
├── components/
│ ├── Dashboard.tsx
│ ├── MarketCard.tsx
│ ├── RiskBadge.tsx
│ ├── VolumeIndicator.tsx
│ └── NewsSummary.tsx
├── lib/
│ ├── yahoo.ts
│ ├── scoring.ts
│ └── risk.ts
├── types/
│ └── market.ts
├── styles/
│ └── globals.css

yaml
Copy code

---

## 6. Component Design

### Dashboard
- Fetches market data
- Renders grid of MarketCard components
- Handles loading and empty states

### MarketCard
- Displays individual asset data (symbol, name, price, change %, volume)
- Integrates RiskBadge component

### RiskBadge
- Evaluates volume for risk level
- Shows visual risk warnings for beginners

### NewsSummary (planned)
- Highlights major news affecting the asset
- Uses simple language for beginner understanding

---

## 7. Data Design

### MarketQuote Interface

```ts
interface MarketQuote {
  symbol: string
  shortName: string
  regularMarketPrice: number
  regularMarketChangePercent: number
  regularMarketVolume: number
}
Data Flow:

Client requests market data

API route fetches and normalizes Yahoo Finance data

Data is passed to UI components

Risk and trend scoring applied

8. Market Activity Scoring
Scale: 1–10

Inputs: trading volume, price volatility, market sector, news

Purpose: highlight trending vs low-activity assets

Does not constitute financial advice

9. AI Integration (Planned)
Beginner-friendly explanations of market trends

Risk warnings in plain language

Adaptive to user goals, horizon, and region

Guardrails:

No buy/sell instructions

No price predictions

Always educational/informational

10. Risk Management
Financial Risk:

Beginner-friendly, educational-only language

Clear disclaimers

Technical Risk:

Server-side only API calls

Graceful handling of API failures

Strong TypeScript typing

User Risk:

Volatility warnings

Beginner-oriented content

Options/crypto flagged as advanced

11. Performance & Scalability
Lightweight UI for fast rendering

Server-side caching potential

Modular components for future AI, news, and mobile features

12. Future Enhancements
AI chat-style guidance

News sentiment analysis

Region-based filtering and goals

Mobile app (React Native)

Historical trend visualization

13. Conclusion
Market Sense AI is a risk-aware, beginner-friendly financial analytics system. It balances usability, educational content, and technical rigor, making it suitable as a portfolio project demonstrating applied data analytics, frontend engineering, and beginner-focused financial insight.

yaml
Copy code

---

You can **save this directly** as:

market-sense-ai/SSD.md

yaml


