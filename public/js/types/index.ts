export interface User {
  id: string;
  email: string;
  username: string;  // Changed from 'name' to 'username'
  userType: 'buyer' | 'seller' | 'admin';
  accessToken?: string;
  createdAt: string;
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

export interface LoginResponse {
  user: User;
  accessToken: string;
  userType: 'buyer' | 'seller' | 'admin';
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  userType: 'buyer' | 'seller';
}