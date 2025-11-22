import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import staticFiles from '@fastify/static';
import path from 'path';
import { Order } from './types';
import { saveOrder, cacheOrder, redisSub } from './redis';
import { orderQueue } from './queue';

const fastify = Fastify({ logger: false });

fastify.register(staticFiles, {
  root: path.join(__dirname, '../public'),
  prefix: '/',
});

fastify.register(websocket);

export async function initializeRedisSubscriber() {}

fastify.register(async function (fastify) {
  fastify.get('/api/orders/execute', { websocket: true }, (connection, req) => {
    const { socket } = connection;

    socket.on('message', async (message) => {
      try {
        const body = JSON.parse(message.toString());

        if (!body.orderType || !body.tokenIn || !body.tokenOut || !body.amountIn) {
          socket.send(JSON.stringify({ error: 'Invalid request body' }));
          socket.close();
          return;
        }

        const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const order: Order = {
          orderId,
          orderType: body.orderType,
          tokenIn: body.tokenIn,
          tokenOut: body.tokenOut,
          amountIn: body.amountIn,
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await saveOrder(order);
        await cacheOrder(orderId, order);

        socket.send(JSON.stringify({ orderId, status: 'pending' }));
        
        await redisSub.subscribe(`order:${orderId}`, (message) => {
          try {
            socket.send(message);
          } catch (err) {
            console.error('Failed to send to WebSocket:', err);
          }
        });

        await orderQueue.add('execute-order', { order });

        socket.on('close', () => {
          redisSub.unsubscribe(`order:${orderId}`);
        });

      } catch (error: any) {
        socket.send(JSON.stringify({ error: error.message }));
        socket.close();
      }
    });
  });
});

fastify.get('/health', async (request, reply) => {
  return { status: 'ok' };
});

export { fastify };
