export interface User {
  id: string;
  name: string;
  isNewUser?: boolean;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  sellerId: string;
  sellerName: string;
  status: 'active' | 'sold';
  highestOffer: number | null;
  highestOfferBuyer: string | null;
  createdAt: string;
  paymentStatus?: 'pending' | 'paid';
}

export interface Message {
  id: string;
  itemId: string;
  senderId: string;
  senderName: string;
  content: string;
  type: 'text' | 'offer';
  price?: number;
  originalPrice?: number;
  status?: 'pending' | 'accepted' | 'rejected';
  timestamp: string;
  readBy?: string[];
}