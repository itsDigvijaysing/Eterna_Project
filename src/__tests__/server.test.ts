import { fastify } from '../server';

jest.mock('../database', () => ({
  saveOrder: jest.fn(),
}));

jest.mock('../redis', () => ({
  redis: {},
  cacheOrder: jest.fn(),
}));

jest.mock('../queue', () => ({
  orderQueue: {
    add: jest.fn(),
  },
  orderWorker: {},
}));

describe('Server API', () => {
  afterAll(async () => {
    await fastify.close();
  });

  test('health endpoint returns ok', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/health',
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.payload)).toEqual({ status: 'ok' });
  });
});
