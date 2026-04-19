import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
// import { readItems } from '../utils/fileHelpers';
import { readItems, writeItems, readUsers, readMessages } from '../utils/fileHelpers.js';

interface Item {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  gallery?: string[];
  category?: string;
  condition?: string;
  location?: string;
  shipping?: string;
  tags?: string[];
  sellerId: string;
  sellerName: string;
  sellerEmail?: string;
  status: string;
  highestOffer: number | null;
  highestOfferBuyer: string | null;
  bidCount?: number;
  createdAt: string;
  paymentStatus?: string;
  paymentConfirmedBy?: string;
  paymentConfirmedAt?: string;
}

export const getAllItems = (req: Request, res: Response) => {
  try {
    let items = readItems();
    let filteredItems = items.filter((item: Item) => item.status === 'active');

    const { search } = req.query;
    if (search && typeof search === 'string' && search.trim()) {
      const searchTerm = search.toLowerCase().trim();
      filteredItems = filteredItems.filter((item: Item) =>
        item.name.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm) ||
        (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
      );
    }

    const { category } = req.query;
    if (category && typeof category === 'string' && category.trim()) {
      filteredItems = filteredItems.filter((item: Item) => 
        item.category === category
      );
    }

    const { minPrice, maxPrice } = req.query;
    if (minPrice && !isNaN(Number(minPrice))) {
      filteredItems = filteredItems.filter((item: Item) => 
        item.price >= Number(minPrice)
      );
    }
    if (maxPrice && !isNaN(Number(maxPrice))) {
      filteredItems = filteredItems.filter((item: Item) => 
        item.price <= Number(maxPrice)
      );
    }

    const { sort } = req.query;
    if (sort === 'price_asc') {
      filteredItems.sort((a: Item, b: Item) => a.price - b.price);
    } else if (sort === 'price_desc') {
      filteredItems.sort((a: Item, b: Item) => b.price - a.price);
    } else {
      filteredItems.sort((a: Item, b: Item) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    res.json(filteredItems);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
};

export const getItem = (req: Request, res: Response) => {
  try {
    const items = readItems();
    const item = items.find((i: Item) => i.id === req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ error: 'Failed to fetch item' });
  }
};



export const createItem = (req: Request, res: Response) => {
  try {
    const { 
      name, 
      description, 
      price, 
      image, 
      gallery, 
      category, 
      condition, 
      location, 
      shipping, 
      tags,
      sellerId, 
      sellerName,
      sellerEmail 
    } = req.body;

    if (!name || !price || !sellerId) {
      return res.status(400).json({ error: 'Name, price, and sellerId are required' });
    }

    const users = readUsers();
    const seller = users.find((u: any) => u.id === sellerId);
    
    const newItem: Item = {
      id: uuidv4(),
      name: name.trim(),
      description: description?.trim() || 'No description provided',
      price: parseFloat(price),
      image: image || (gallery && gallery[0]) || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
      gallery: gallery || [image].filter(Boolean),
      category: category || 'Other',
      condition: condition || 'Good',
      location: location || 'Nairobi, Kenya',
      shipping: shipping || 'Local pickup only',
      tags: tags || [],
      sellerId,
      sellerName: sellerName || seller?.username || 'Anonymous',
      sellerEmail: sellerEmail || seller?.email,
      status: 'active',
      highestOffer: null,
      highestOfferBuyer: null,
      bidCount: 0,
      createdAt: new Date().toISOString(),
      paymentStatus: 'pending'
    };

    const items = readItems();
    items.push(newItem);
    writeItems(items);
    
    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Failed to create item' });
  }
};

export const updateItem = (req: Request, res: Response) => {
  try {
    const items = readItems();
    const index = items.findIndex((i: Item) => i.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const allowedUpdates = ['name', 'description', 'price', 'image', 'gallery', 'category', 'condition', 'location', 'shipping', 'tags', 'status'];
    const updates: any = {};
    
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    items[index] = { ...items[index], ...updates };
    writeItems(items);
    
    res.json(items[index]);
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
};

export const deleteItem = (req: Request, res: Response) => {
  try {
    const items = readItems();
    const index = items.findIndex((i: Item) => i.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    items.splice(index, 1);
    writeItems(items);
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
};

export const placeBid = (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    const { bidAmount, buyerId, buyerName } = req.body;
    
    if (!bidAmount || !buyerId) {
      return res.status(400).json({ error: 'Bid amount and buyer ID are required' });
    }
    
    const items = readItems();
    const itemIndex = items.findIndex((i: Item) => i.id === itemId);
    
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    const item = items[itemIndex];
    
    if (item.status !== 'active') {
      return res.status(400).json({ error: 'Item is no longer active' });
    }
    
    if (bidAmount <= (item.highestOffer || item.price)) {
      return res.status(400).json({ error: `Bid must be higher than ${(item.highestOffer || item.price)}` });
    }
    
    item.highestOffer = bidAmount;
    item.highestOfferBuyer = buyerId;
    item.bidCount = (item.bidCount || 0) + 1;
    
    writeItems(items);
    
    res.json({
      success: true,
      message: 'Bid placed successfully',
      item: item
    });
  } catch (error) {
    console.error('Error placing bid:', error);
    res.status(500).json({ error: 'Failed to place bid' });
  }
};

export const checkoutItem = (req: Request, res: Response) => {
  try {
    const items = readItems();
    const index = items.findIndex((i: Item) => i.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const { buyerId, paymentMethod } = req.body;
    
    items[index].paymentStatus = 'paid';
    items[index].paymentConfirmedBy = buyerId;
    items[index].paymentConfirmedAt = new Date().toISOString();
    items[index].status = 'pending_sale';
    
    writeItems(items);

    res.json({
      success: true,
      message: 'Payment confirmed, awaiting seller confirmation',
      item: items[index]
    });
  } catch (error) {
    console.error('Error processing checkout:', error);
    res.status(500).json({ error: 'Failed to process checkout' });
  }
};

export const confirmSale = (req: Request, res: Response) => {
  try {
    const items = readItems();
    const index = items.findIndex((i: Item) => i.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Item not found' });
    }

    items[index].status = 'sold';
    items[index].paymentStatus = 'completed';
    
    writeItems(items);

    res.json({
      success: true,
      message: 'Item sale confirmed',
      item: items[index]
    });
  } catch (error) {
    console.error('Error confirming sale:', error);
    res.status(500).json({ error: 'Failed to confirm sale' });
  }
};

export const getCategories = (req: Request, res: Response) => {
  try {
    const items = readItems();
    const categories = [...new Set(items.map((item: Item) => item.category).filter(Boolean))];
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

export const getFeaturedItems = (req: Request, res: Response) => {
  try {
    const items = readItems();
    const featured = items
      .filter((item: Item) => item.status === 'active')
      .sort((a: Item, b: Item) => (b.bidCount || 0) - (a.bidCount || 0))
      .slice(0, 8);
    res.json(featured);
  } catch (error) {
    console.error('Error fetching featured items:', error);
    res.status(500).json({ error: 'Failed to fetch featured items' });
  }
};

export const getSellerStats = async (req: Request, res: Response) => {
  try {
    const { sellerId } = req.params;
    const items = readItems();
    const sellerItems = items.filter((item: any) => item.sellerId === sellerId);
    
    // Calculate stats
    const totalItems = sellerItems.length;
    const totalBids = sellerItems.reduce((sum: number, item: any) => sum + (item.bidCount || 0), 0);
    const totalRevenue = sellerItems
      .filter((item: any) => item.status === 'sold' && item.paymentStatus === 'completed')
      .reduce((sum: number, item: any) => sum + (item.price || 0), 0);
    const pendingSales = sellerItems.filter((item: any) => 
      item.status === 'active' && (item.bidCount || 0) > 0
    ).length;
    
    // Get active chats count from messages
    const messagesData = readMessages();
    const activeChats = messagesData.filter((chat: any) => 
      chat.participants?.includes(sellerId) && 
      chat.messages?.length > 0
    ).length;
    
    res.json({
      success: true,
      stats: {
        totalItems,
        totalBids,
        totalRevenue,
        pendingSales,
        activeChats
      }
    });
  } catch (error) {
    console.error('Error getting seller stats:', error);
    res.status(500).json({ error: 'Failed to get seller stats' });
  }
};

export const getSellerItems = async (req: Request, res: Response) => {
  try {
    const { sellerId } = req.params;
    const items = readItems();
    const sellerItems = items.filter((item: any) => item.sellerId === sellerId);
    
    res.json({
      success: true,
      items: sellerItems,
      count: sellerItems.length
    });
  } catch (error) {
    console.error('Error getting seller items:', error);
    res.status(500).json({ error: 'Failed to get seller items' });
  }
};