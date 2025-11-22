import { createClient } from 'redis';

export const redis = createClient({
  username: 'default',
  password: 'xAVHDjQrfWKeAVeRcNjb0903kpCLwW31',
  socket: {
    host: 'redis-11109.c305.ap-south-1-1.ec2.cloud.redislabs.com',
    port: 11109
  }
});

export const redisPub = createClient({
  username: 'default',
  password: 'xAVHDjQrfWKeAVeRcNjb0903kpCLwW31',
  socket: {
    host: 'redis-11109.c305.ap-south-1-1.ec2.cloud.redislabs.com',
    port: 11109
  }
});

export const redisSub = createClient({
  username: 'default',
  password: 'xAVHDjQrfWKeAVeRcNjb0903kpCLwW31',
  socket: {
    host: 'redis-11109.c305.ap-south-1-1.ec2.cloud.redislabs.com',
    port: 11109
  }
});

export async function saveOrder(order: any) {
  await redis.hSet(`order:${order.orderId}`, {
    orderId: order.orderId,
    orderType: order.orderType,
    tokenIn: order.tokenIn,
    tokenOut: order.tokenOut,
    amountIn: order.amountIn.toString(),
    status: order.status,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
}

export async function updateOrder(orderId: string, updates: any) {
  const data: any = { updatedAt: new Date().toISOString() };
  
  if (updates.status) data.status = updates.status;
  if (updates.dexUsed) data.dexUsed = updates.dexUsed;
  if (updates.executedPrice) data.executedPrice = updates.executedPrice.toString();
  if (updates.txHash) data.txHash = updates.txHash;
  if (updates.error) data.error = updates.error;
  
  await redis.hSet(`order:${orderId}`, data);
}

export async function getOrder(orderId: string) {
  return await redis.hGetAll(`order:${orderId}`);
}

export async function cacheOrder(orderId: string, order: any) {
  await redis.set(`cache:${orderId}`, JSON.stringify(order), { EX: 3600 });
}

export async function getCachedOrder(orderId: string) {
  const data = await redis.get(`cache:${orderId}`);
  return data ? JSON.parse(data) : null;
}

export async function deleteCachedOrder(orderId: string) {
  await redis.del(`cache:${orderId}`);
}
