import dotenv from 'dotenv';
dotenv.config();

import { fastify, initializeRedisSubscriber } from './server';
import { redis, redisPub, redisSub } from './redis';
import { orderWorker } from './queue';

const PORT = parseInt(process.env.PORT || '3000');

async function start() {
  try {
    await redis.connect();
    await redis.ping();
    console.log('Redis connected');

    await redisPub.connect();
    console.log('Redis pub connected');

    await redisSub.connect();
    await initializeRedisSubscriber();
    console.log('Redis sub connected');

    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`Server running on http://localhost:${PORT}`);
  } catch (err) {
    console.error('Failed to start:', err);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  console.log('Shutting down...');
  await orderWorker.close();
  await redis.disconnect();
  await redisPub.disconnect();
  await redisSub.disconnect();
  await fastify.close();
  process.exit(0);
});

start();
