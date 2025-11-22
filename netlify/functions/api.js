const serverless = require('serverless-http');
const express = require('express');
const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/orders/execute', async (req, res) => {
  try {
    const { orderType, tokenIn, tokenOut, amountIn } = req.body;
    
    if (!orderType || !tokenIn || !tokenOut || !amountIn) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const prices = {
      'SOL-USDC': 145.50,
      'SOL-USDT': 145.30,
      'USDC-SOL': 1 / 145.50,
      'USDT-SOL': 1 / 145.30,
    };
    
    const pair = `${tokenIn}-${tokenOut}`;
    const basePrice = prices[pair] || 1.0;
    const slippage = 0.98 + Math.random() * 0.04;
    const executedPrice = basePrice * slippage;
    const fee = Math.random() > 0.5 ? 0.003 : 0.002;
    const dexUsed = fee === 0.003 ? 'raydium' : 'meteora';
    
    const txHash = Array.from({length: 64}, () => 
      '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
      .charAt(Math.floor(Math.random() * 58))
    ).join('');
    
    res.json({
      orderId,
      status: 'confirmed',
      dexUsed,
      executedPrice,
      txHash,
      estimatedOutput: amountIn * executedPrice * (1 - fee)
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports.handler = serverless(app);
