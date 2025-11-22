import { DexQuote, DexType, Order } from './types';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class MockDexRouter {
  async getRaydiumQuote(tokenIn: string, tokenOut: string, amount: number): Promise<DexQuote> {
    await sleep(200);
    const basePrice = this.getMarketPrice(tokenIn, tokenOut);
    const slippage = 0.98 + Math.random() * 0.04;
    const price = basePrice * slippage;
    return {
      dex: 'raydium',
      price,
      fee: 0.003,
      estimatedOutput: amount * price * (1 - 0.003)
    };
  }

  async getMeteorQuote(tokenIn: string, tokenOut: string, amount: number): Promise<DexQuote> {
    await sleep(200);
    const basePrice = this.getMarketPrice(tokenIn, tokenOut);
    const slippage = 0.97 + Math.random() * 0.05;
    const price = basePrice * slippage;
    return {
      dex: 'meteora',
      price,
      fee: 0.002,
      estimatedOutput: amount * price * (1 - 0.002)
    };
  }

  private getMarketPrice(tokenIn: string, tokenOut: string): number {
    const pair = `${tokenIn}-${tokenOut}`;
    
    const marketPrices: Record<string, number> = {
      'SOL-USDC': 145.50,
      'SOL-USDT': 145.30,
      'USDC-SOL': 1 / 145.50,
      'USDT-SOL': 1 / 145.30,
      'USDC-USDT': 1.0002,
      'USDT-USDC': 0.9998,
    };

    return marketPrices[pair] || 1.0;
  }

  async getBestQuote(tokenIn: string, tokenOut: string, amount: number): Promise<DexQuote> {
    const [raydiumQuote, meteoraQuote] = await Promise.all([
      this.getRaydiumQuote(tokenIn, tokenOut, amount),
      this.getMeteorQuote(tokenIn, tokenOut, amount)
    ]);

    console.log(`Quote comparison - Raydium: ${raydiumQuote.estimatedOutput.toFixed(4)}, Meteora: ${meteoraQuote.estimatedOutput.toFixed(4)}`);

    return raydiumQuote.estimatedOutput > meteoraQuote.estimatedOutput ? raydiumQuote : meteoraQuote;
  }

  async executeSwap(dex: DexType, order: Order): Promise<{ txHash: string; executedPrice: number }> {
    await sleep(2000 + Math.random() * 1000);
    
    const txHash = this.generateMockTxHash();
    const basePrice = this.getMarketPrice(order.tokenIn, order.tokenOut);
    const slippage = 0.995 + Math.random() * 0.01;
    const executedPrice = basePrice * slippage;

    console.log(`Executed swap on ${dex} - TX: ${txHash}, Price: ${executedPrice.toFixed(4)}`);

    return { txHash, executedPrice };
  }

  private generateMockTxHash(): string {
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let hash = '';
    for (let i = 0; i < 64; i++) {
      hash += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return hash;
  }
}
