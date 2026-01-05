
export type MessageType = 'user' | 'ai';

export interface MessagePart {
  text?: string;
  button?: {
    label: string;
    url: string;
    type: 'checkout' | 'support' | 'whatsapp';
  };
}

export interface Message {
  id: string;
  type: MessageType;
  parts: MessagePart[];
  timestamp: Date;
}

export interface CheckoutParams {
  quantity: number;
  items: Array<{
    color: 'palha' | 'marrom';
    qty: number;
  }>;
}
