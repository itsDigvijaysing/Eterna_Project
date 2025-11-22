import { MockDexRouter } from '../dexRouter';

describe('MockDexRouter', () => {
  let router: MockDexRouter;

  beforeEach(() => {
    router = new MockDexRouter();
  });

  test('getRaydiumQuote returns valid quote', async () => {
    const quote = await router.getRaydiumQuote('SOL', 'USDC', 100);
    
    expect(quote.dex).toBe('raydium');
    expect(quote.price).toBeGreaterThan(0);
    expect(quote.fee).toBe(0.003);
    expect(quote.estimatedOutput).toBeGreaterThan(0);
  });

  test('getMeteorQuote returns valid quote', async () => {
    const quote = await router.getMeteorQuote('SOL', 'USDC', 100);
    
    expect(quote.dex).toBe('meteora');
    expect(quote.price).toBeGreaterThan(0);
    expect(quote.fee).toBe(0.002);
    expect(quote.estimatedOutput).toBeGreaterThan(0);
  });

  test('getBestQuote compares both DEXes', async () => {
    const bestQuote = await router.getBestQuote('SOL', 'USDC', 100);
    
    expect(['raydium', 'meteora']).toContain(bestQuote.dex);
    expect(bestQuote.estimatedOutput).toBeGreaterThan(0);
  });

  test('executeSwap returns transaction hash and price', async () => {
    const result = await router.executeSwap('raydium', {
      orderId: 'test123',
      orderType: 'market',
      tokenIn: 'SOL',
      tokenOut: 'USDC',
      amountIn: 100,
      status: 'building',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    expect(result.txHash).toBeDefined();
    expect(result.txHash.length).toBe(64);
    expect(result.executedPrice).toBeGreaterThan(0);
  });
});
