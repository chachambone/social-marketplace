import { Request, Response } from 'express';
import { readItems, writeItems } from '../utils/fileHelpers.js';
import { v4 as uuidv4 } from 'uuid';
import { items } from '../data/items.js';

interface Item {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  sellerId: string;
  sellerName: string;
  status: string;
  highestOffer: number | null;
  highestOfferBuyer: string | null;
  createdAt: string;
  paymentStatus?: string;
  paymentConfirmedBy?: string;
  paymentConfirmedAt?: string;
}

export const getAllItems = (req: Request, res: Response) => {
  try {
    

    console.log("items are ",items)
    items.filter((item: Item) => item.status === 'active');

    const { search } = req.query;
    if (search && typeof search === 'string' && search.trim()) {
      const searchTerm = search.toLowerCase().trim();
      items.filter((item: Item) =>
        item.name.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm)
      );
    }

    items.sort((a: Item, b: Item) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
};

export const getItem = (req: Request, res: Response) => {
  try {
    const items: Item[] = readItems();
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
    const items: Item[] = readItems();
    const { name, description, price, image, sellerId, sellerName } = req.body;

    if (!name || !price || !sellerId) {
      return res.status(400).json({ error: 'Name, price, and sellerId are required' });
    }

    const newItem: Item = {
      id: uuidv4(),
      name,
      description: description || 'No description provided',
      price: parseFloat(price),
      image: image || 'https://via.placeholder.com/400x300?text=Collectible+Item',
      sellerId,
      sellerName: sellerName || 'Anonymous',
      status: 'active',
      highestOffer: null,
      highestOfferBuyer: null,
      createdAt: new Date().toISOString()
    };

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
    const items: Item[] = readItems();
    const index = items.findIndex((i: Item) => i.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Item not found' });
    }

    items[index] = { ...items[index], ...req.body };
    writeItems(items);
    res.json(items[index]);
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
};

export const deleteItem = (req: Request, res: Response) => {
  try {
    const items: Item[] = readItems();
    const filtered = items.filter((i: Item) => i.id !== req.params.id);
    writeItems(filtered);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
};

export const checkoutItem = (req: Request, res: Response) => {
  try {
    const items: Item[] = readItems();
    const index = items.findIndex((i: Item) => i.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Item not found' });
    }

    items[index].paymentStatus = 'paid';
    items[index].paymentConfirmedBy = req.body.buyerId;
    items[index].paymentConfirmedAt = new Date().toISOString();
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
    const items: Item[] = readItems();
    const index = items.findIndex((i: Item) => i.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const soldItem = items[index];
    items.splice(index, 1);
    writeItems(items);

    res.json({
      success: true,
      message: 'Item sold and removed from marketplace',
      item: soldItem
    });
  } catch (error) {
    console.error('Error confirming sale:', error);
    res.status(500).json({ error: 'Failed to confirm sale' });
  }
};