import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
// import { readItems } from '../utils/fileHelpers';
import { readItems, writeItems, readUsers, readMessages, readChats } from '../utils/fileHelpers.js';

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
    const chats = readChats();
    
    // Filter items for this seller
    const sellerItems = items.filter((item: any) => item.sellerId === sellerId);
    
    // 1. TOTAL ITEMS - Remove items with paymentStatus: 'completed' (sold items)
    const totalItems = sellerItems.filter((item: any) => 
      item.paymentStatus !== 'completed' && item.status !== 'sold'
    ).length;
    
    // 2. TOTAL BIDS - Get from chats.json messages where type === 'bid'
    let totalBids = 0;
    const sellerItemIds = sellerItems.map((item: any) => item.id);
    
    chats.forEach((chat: any) => {
      if (sellerItemIds.includes(chat.itemId) && chat.messages) {
        const bidCount = chat.messages.filter((msg: any) => msg.type === 'bid').length;
        totalBids += bidCount;
      }
    });
    
    // 3. ACTIVE CHATS - Items that are not sold and have messages
    const activeChats = chats.filter((chat: any) => {
      const item = items.find((i: any) => i.id === chat.itemId);
      return sellerItemIds.includes(chat.itemId) && 
             item && 
             item.paymentStatus !== 'completed' && 
             item.status !== 'sold' &&
             chat.messages && 
             chat.messages.length > 0;
    }).length;
    
    // 4. PENDING SALES - Items with paymentStatus === 'pending' (not yet paid/completed)
    const pendingSales = sellerItems.filter((item: any) => 
      item.paymentStatus === 'pending' && item.status !== 'sold'
    ).length;
    
    // 5. TOTAL REVENUE - Sum of prices from sold items (paymentStatus: 'completed')
    const totalRevenue = sellerItems
      .filter((item: any) => item.paymentStatus === 'completed' || item.status === 'sold')
      .reduce((sum: number, item: any) => sum + (item.price || 0), 0);
    
    res.json({
      success: true,
      stats: {
        totalItems,
        totalBids,
        activeChats,
        pendingSales,
        totalRevenue
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
    const chats = readChats();
    
    // Get all items for this seller
    const sellerItems = items.filter((item: any) => item.sellerId === sellerId);
    
    // Enhance items with chat information
    const enhancedItems = sellerItems.map((item: any) => {
      const chat = chats.find((c: any) => c.itemId === item.id);
      const bidCount = chat?.messages?.filter((msg: any) => msg.type === 'bid').length || 0;
      const lastMessage = chat?.messages?.[chat.messages.length - 1];
      
      return {
        ...item,
        bidCount,
        lastMessage: lastMessage || null,
        hasActiveChat: chat && chat.messages && chat.messages.length > 0
      };
    });
    
    res.json({
      success: true,
      items: enhancedItems,
      count: sellerItems.length,
      activeChatsCount: enhancedItems.filter((i: any) => i.hasActiveChat && i.paymentStatus !== 'completed').length
    });
  } catch (error) {
    console.error('Error getting seller items:', error);
    res.status(500).json({ error: 'Failed to get seller items' });
  }
};

// Add this new function to get chat details for a specific item
export const getItemChatDetails = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    const items = readItems();
    const chats = readChats();
    
    const item = items.find((i: any) => i.id === itemId);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    const chat = chats.find((c: any) => c.itemId === itemId);
    
    // Get all unique participants (buyers who have messaged or bid)
    const participants = chat?.participants?.filter((p: any) => p !== item.sellerId) || [];
    
    // Get all bids from this item
    const bids = chat?.messages?.filter((msg: any) => msg.type === 'bid') || [];
    const highestBid = bids.length > 0 
      ? Math.max(...bids.map((b: any) => b.bidAmount))
      : null;
    const highestBidder = bids.length > 0 
      ? bids.find((b: any) => b.bidAmount === highestBid)?.senderName
      : null;
    
    res.json({
      success: true,
      item: {
        ...item,
        chat: chat || { messages: [], participants: [] },
        stats: {
          totalMessages: chat?.messages?.length || 0,
          totalBids: bids.length,
          uniqueBuyers: participants.length,
          highestBid,
          highestBidder
        }
      }
    });
  } catch (error) {
    console.error('Error getting item chat details:', error);
    res.status(500).json({ error: 'Failed to get item chat details' });
  }
};