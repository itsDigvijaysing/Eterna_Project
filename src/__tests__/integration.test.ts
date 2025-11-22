import WebSocket from 'ws';

jest.setTimeout(15000);

describe('WebSocket Integration', () => {
  let ws: WebSocket;

  beforeEach(() => {
    ws = new WebSocket('ws://localhost:3000/api/orders/execute');
  });

  afterEach(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.close();
    }
  });

  test('order execution flow through WebSocket', (done) => {
    const messages: any[] = [];

    ws.on('open', () => {
      ws.send(JSON.stringify({
        orderType: 'market',
        tokenIn: 'SOL',
        tokenOut: 'USDC',
        amountIn: 100
      }));
    });

    ws.on('message', (data) => {
      const message = JSON.parse(data.toString());
      messages.push(message);

      if (message.status === 'confirmed' || message.status === 'failed') {
        expect(messages.length).toBeGreaterThan(0);
        expect(messages[0]).toHaveProperty('orderId');
        done();
      }
    });

    ws.on('error', (error) => {
      done(error);
    });
  });
});
