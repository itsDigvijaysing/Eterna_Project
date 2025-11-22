const WebSocket = require('ws');

const ORDER_TYPES = ['market'];
const TOKEN_PAIRS = [
  { tokenIn: 'SOL', tokenOut: 'USDC' },
  { tokenIn: 'USDC', tokenOut: 'SOL' },
  { tokenIn: 'SOL', tokenOut: 'USDT' },
];

function createOrder(index) {
  const pair = TOKEN_PAIRS[index % TOKEN_PAIRS.length];
  return {
    orderType: 'market',
    ...pair,
    amountIn: Math.floor(Math.random() * 1000) + 100
  };
}

function submitOrder(orderData, index) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket('ws://localhost:3000/api/orders/execute');
    const updates = [];

    ws.on('open', () => {
      console.log(`[Order ${index}] Connected`);
      ws.send(JSON.stringify(orderData));
    });

    ws.on('message', (data) => {
      const update = JSON.parse(data.toString());
      updates.push(update);
      console.log(`[Order ${index}] ${update.status}${update.dexUsed ? ' - ' + update.dexUsed : ''}`);

      if (update.status === 'confirmed') {
        console.log(`[Order ${index}] ✓ TX: ${update.txHash?.substring(0, 8)}... Price: ${update.executedPrice?.toFixed(4)}`);
        ws.close();
        resolve(updates);
      } else if (update.status === 'failed') {
        console.log(`[Order ${index}] ✗ Error: ${update.error}`);
        ws.close();
        reject(new Error(update.error));
      }
    });

    ws.on('error', (error) => {
      console.error(`[Order ${index}] WebSocket error:`, error.message);
      reject(error);
    });

    ws.on('close', () => {
      console.log(`[Order ${index}] Disconnected`);
    });
  });
}

async function main() {
  const numOrders = parseInt(process.argv[2]) || 5;
  
  console.log(`\n🚀 Submitting ${numOrders} concurrent orders...\n`);

  const orders = Array.from({ length: numOrders }, (_, i) => createOrder(i));
  
  const startTime = Date.now();
  
  try {
    await Promise.all(orders.map((order, i) => submitOrder(order, i + 1)));
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n✓ All ${numOrders} orders completed in ${duration}s\n`);
  } catch (error) {
    console.error('\n✗ Some orders failed\n');
  }
}

main();
