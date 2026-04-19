import { Item } from '../types/index.js';

const API_URL = '/api';

export class ItemService {
  static async getAllItems(search?: string): Promise<Item[]> {
    try {
        let url = `${API_URL}/items`;
        
        // Ensure search is actually a string before calling trim
        if (search && typeof search === 'string' && search.trim()) {
            url += `?search=${encodeURIComponent(search.trim())}`;
        }
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
                // 'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch items: ${response.status} ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error in getAllItems:', error);
        if (error instanceof Error) {
            throw new Error(`Failed to fetch items: ${error.message}`);
        }
        throw new Error('Failed to fetch items: Unknown error occurred');
    }
  }

  static async getItem(id: string): Promise<Item> {
    try {
        if (!id || typeof id !== 'string') {
            throw new Error('Invalid item ID provided');
        }
        
        const response = await fetch(`${API_URL}/items/${encodeURIComponent(id)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Item not found');
            }
            throw new Error(`Failed to fetch item: ${response.status} ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error in getItem:', error);
        if (error instanceof Error) {
            throw new Error(`Failed to fetch item: ${error.message}`);
        }
        throw new Error('Failed to fetch item: Unknown error occurred');
    }
  }
}