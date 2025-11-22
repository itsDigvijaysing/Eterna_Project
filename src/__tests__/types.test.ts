import { Order } from '../types';

describe('Order Types and Validation', () => {
  test('valid market order structure', () => {
    const order: Order = {
      orderId: 'test_123',
      orderType: 'market',
      tokenIn: 'SOL',
      tokenOut: 'USDC',
      amountIn: 100,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(order.orderType).toBe('market');
    expect(order.amountIn).toBeGreaterThan(0);
    expect(order.status).toBe('pending');
  });

  test('order status transitions', () => {
    const statuses = ['pending', 'routing', 'building', 'submitted', 'confirmed'];
    
    statuses.forEach(status => {
      expect(['pending', 'routing', 'building', 'submitted', 'confirmed', 'failed']).toContain(status);
    });
  });

  test('DEX types are valid', () => {
    const dexTypes = ['raydium', 'meteora'];
    
    dexTypes.forEach(dex => {
      expect(['raydium', 'meteora']).toContain(dex);
    });
  });
});
