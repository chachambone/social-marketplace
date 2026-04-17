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
