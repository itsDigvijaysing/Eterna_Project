import { DexQuote, DexType, Order } from './types';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class MockDexRouter {
  async getRaydiumQuote(tokenIn: string, tokenOut: string, amount: number): Promise<DexQuote> {
    await sleep(200);
    const basePrice = 1.5 + Math.random() * 0.5;
    const price = basePrice * (0.98 + Math.random() * 0.04);
    return {
      dex: 'raydium',
      price,
      fee: 0.003,
      estimatedOutput: amount * price * (1 - 0.003)
    };
  }

  async getMeteorQuote(tokenIn: string, tokenOut: string, amount: number): Promise<DexQuote> {
    await sleep(200);
    const basePrice = 1.5 + Math.random() * 0.5;
    const price = basePrice * (0.97 + Math.random() * 0.05);
    return {
      dex: 'meteora',
      price,
      fee: 0.002,
      estimatedOutput: amount * price * (1 - 0.002)
    };
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
    const executedPrice = 1.5 + Math.random() * 0.5;

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
