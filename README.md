# Order Execution Engine

A fast order execution system for Solana DEX trading with automatic routing between Raydium and Meteora.

![Home Page](Home%20Page.jpeg)

## What It Does

- Takes market orders and finds the best price
- Compares Raydium and Meteora in parallel
- Handles 10 orders at once (100+ orders per minute)
- Shows real-time updates via WebSocket
- Retries failed orders 3 times with increasing delays

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

**Live Demo**: https://YOUR-RENDER-URL.onrender.com
*(Replace with your actual Render URL)*

## How It Works

1. **Submit Order** - Enter token pair and amount
2. **Quote Comparison** - System checks both DEXes (200ms each)
3. **Best Price Selection** - Picks the DEX with better output after fees
4. **Execute** - Sends transaction to chosen DEX (2-3 seconds)
5. **Confirm** - Returns transaction hash and final price

## Features

- **Web UI** - Submit orders and watch execution logs
- **10 Concurrent Workers** - Process multiple orders simultaneously  
- **Smart Routing** - Raydium (0.3% fee) vs Meteora (0.2% fee)
- **Retry Logic** - 3 attempts with 1s → 2s → 4s delays
- **Real-time Updates** - 5 status stages: pending → routing → building → submitted → confirmed

## CLI Testing

```bash
node test-client.js 5
```

Tests 5 concurrent orders. All complete in ~5 seconds.

## Tech Stack

- Node.js + TypeScript
- Fastify (HTTP + WebSocket)
- BullMQ (job queue)
- Redis (cloud storage + pub/sub)

## Project Structure

```
src/
├── index.ts      - Server startup
├── server.ts     - API endpoints
├── queue.ts      - Order processing
├── redis.ts      - Data storage
├── dexRouter.ts  - Price comparison
└── types.ts      - TypeScript definitions

public/
└── index.html    - Web interface
```

## Environment

Redis cloud is pre-configured in `.env`. 
---
