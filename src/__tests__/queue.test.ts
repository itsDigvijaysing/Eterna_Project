import { Queue, Worker } from 'bullmq';
import { orderQueue, OrderJob } from '../queue';
import { Order } from '../types';

jest.mock('../redis', () => ({
  redis: {
    duplicate: jest.fn().mockReturnValue({
      connect: jest.fn(),
      disconnect: jest.fn(),
    }),
  },
  cacheOrder: jest.fn(),
}));

jest.mock('../database', () => ({
  updateOrder: jest.fn(),
}));

describe('Order Queue', () => {
  test('queue is configured correctly', () => {
    expect(orderQueue).toBeDefined();
    expect(orderQueue.name).toBe('order-execution');
  });

  test('queue has retry configuration', () => {
    const opts = orderQueue.opts.defaultJobOptions;
    expect(opts?.attempts).toBe(3);
    expect(opts?.backoff).toEqual({
      type: 'exponential',
      delay: 1000,
    });
  });

  test('worker has correct concurrency', () => {
    const { orderWorker } = require('../queue');
    expect(orderWorker.opts.concurrency).toBe(10);
  });
});
