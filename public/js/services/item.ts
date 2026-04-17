import { Item } from '../types/index.js';

const API_URL = 'http://localhost:3000/api';

export class ItemService {
  static async getAllItems(search?: string): Promise<Item[]> {
    let url = `${API_URL}/items`;
    if (search && search.trim()) {
      url += `?search=${encodeURIComponent(search)}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
        // 'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch items');
    }
    return response.json();
  }

  static async getItem(id: string): Promise<Item> {
    const response = await fetch(`${API_URL}/items/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch item');
    }
    return response.json();
  }
}
