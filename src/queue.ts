import { Queue, Worker, Job } from 'bullmq';
import { saveOrder, updateOrder, cacheOrder, redisPub } from './redis';
import { MockDexRouter } from './dexRouter';
import { Order, OrderStatusUpdate } from './types';

const dexRouter = new MockDexRouter();

const redisConnection = {
  host: 'redis-11109.c305.ap-south-1-1.ec2.cloud.redislabs.com',
  port: 11109,
  username: 'default',
  password: 'xAVHDjQrfWKeAVeRcNjb0903kpCLwW31',
};

export const orderQueue = new Queue('order-execution', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  },
});

export interface OrderJob {
  order: Order;
}

async function processOrder(job: Job<OrderJob>) {
  const { order } = job.data;
  const attemptNumber = job.attemptsMade + 1;

  console.log(`Processing order ${order.orderId} (attempt ${attemptNumber}/3)`);

  const notifyCallback = async (update: OrderStatusUpdate) => {
    await redisPub.publish(`order:${order.orderId}`, JSON.stringify(update));
  };

  try {
    await notifyCallback({
      orderId: order.orderId,
      status: 'routing',
      timestamp: new Date(),
    });
    await updateOrder(order.orderId, { status: 'routing' });

    const bestQuote = await dexRouter.getBestQuote(order.tokenIn, order.tokenOut, order.amountIn);

    await notifyCallback({
      orderId: order.orderId,
      status: 'building',
      dexUsed: bestQuote.dex,
      timestamp: new Date(),
    });
    await updateOrder(order.orderId, { status: 'building', dexUsed: bestQuote.dex });

    await new Promise(resolve => setTimeout(resolve, 500));

    await notifyCallback({
      orderId: order.orderId,
      status: 'submitted',
      dexUsed: bestQuote.dex,
      timestamp: new Date(),
    });
    await updateOrder(order.orderId, { status: 'submitted' });

    const { txHash, executedPrice } = await dexRouter.executeSwap(bestQuote.dex, order);

    await notifyCallback({
      orderId: order.orderId,
      status: 'confirmed',
      dexUsed: bestQuote.dex,
      executedPrice,
      txHash,
      timestamp: new Date(),
    });
    await updateOrder(order.orderId, {
      status: 'confirmed',
      executedPrice,
      txHash,
    });

    await cacheOrder(order.orderId, { ...order, status: 'confirmed', txHash, executedPrice });

  } catch (error: any) {
    const errorMessage = error.message || 'Unknown error';
    const attemptNumber = job.attemptsMade + 1;
    
    console.log(`Order ${order.orderId} failed on attempt ${attemptNumber}: ${errorMessage}`);
    
    if (attemptNumber >= 3) {
      console.log(`Order ${order.orderId} failed after all 3 attempts - marking as failed`);
      
      await notifyCallback({
        orderId: order.orderId,
        status: 'failed',
        error: errorMessage,
        timestamp: new Date(),
      });
      await updateOrder(order.orderId, { status: 'failed', error: errorMessage });
    }

    throw error;
  }
}

export const orderWorker = new Worker<OrderJob>('order-execution', processOrder, {
  connection: redisConnection,
  concurrency: 10,
});

orderWorker.on('completed', (job) => {
  console.log(`Order ${job.data.order.orderId} completed`);
});

orderWorker.on('failed', (job, err) => {
  console.log(`Order ${job?.data.order.orderId} failed after retries: ${err.message}`);
});
