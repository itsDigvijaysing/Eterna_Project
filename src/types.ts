export type OrderType = 'market';
export type OrderStatus = 'pending' | 'routing' | 'building' | 'submitted' | 'confirmed' | 'failed';
export type DexType = 'raydium' | 'meteora';

export interface Order {
  orderId: string;
  orderType: OrderType;
  tokenIn: string;
  tokenOut: string;
  amountIn: number;
  status: OrderStatus;
  dexUsed?: DexType;
  executedPrice?: number;
  txHash?: string;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DexQuote {
  dex: DexType;
  price: number;
  fee: number;
  estimatedOutput: number;
}

export interface OrderStatusUpdate {
  orderId: string;
  status: OrderStatus;
  dexUsed?: DexType;
  executedPrice?: number;
  txHash?: string;
  error?: string;
  timestamp: Date;
}
