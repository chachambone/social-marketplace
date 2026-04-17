import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { AuthService } from '../services/auth.js';
import { Item } from '../types/index.js';
import { tailwindCSS } from '../styles.js';

@customElement('seller-dashboard')
export class SellerDashboard extends LitElement {
  static styles = unsafeCSS(tailwindCSS);

  @property({ type: String }) sellerId = '';
  @property({ type: String }) sellerName = '';
  @state() private myItems: Item[] = [];
  @state() private loading = true;
  @state() private showAddItem = false;
  @state() private stats = {
    totalItems: 0,
    totalBids: 0,
    activeChats: 0,
    pendingSales: 0
  };

  // New item form
  @state() private newItem = {
    name: '',
    description: '',
    price: '',
    image: ''
  };

  connectedCallback() {
    super.connectedCallback();
    this.loadMyItems();
    this.loadStats();
  }

  private async loadMyItems() {
    try {
      this.loading = true;
      const response = await fetch('http://localhost:3000/api/items');
      const allItems = await response.json();
      this.myItems = allItems.filter((item: Item) => item.sellerId === this.sellerId);
      this.stats.totalItems = this.myItems.length;
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      this.loading = false;
    }
  }

  private async loadStats() {
    // Simulate stats - in production, these would come from API
    this.stats.activeChats = 3;
    this.stats.pendingSales = 1;
    this.stats.totalBids = this.myItems.reduce((sum, item) => sum + (item.highestOffer ? 1 : 0), 0);
  }

  private async createItem(e: Event) {
    e.preventDefault();
    const token = AuthService.getAccessToken();
    
    try {
      const response = await fetch('http://localhost:3000/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...this.newItem,
          price: parseFloat(this.newItem.price),
          sellerId: this.sellerId,
          sellerName: this.sellerName,
          image: this.newItem.image || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400'
        })
      });

      if (response.ok) {
        this.showAddItem = false;
        this.newItem = { name: '', description: '', price: '', image: '' };
        this.loadMyItems();
      }
    } catch (error) {
      console.error('Error creating item:', error);
    }
  }

  private async deleteItem(itemId: string) {
    if (confirm('Are you sure you want to delete this item?')) {
      const token = AuthService.getAccessToken();
      await fetch(`http://localhost:3000/api/items/${itemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      this.loadMyItems();
    }
  }

  render() {
    return html`
      <div class="space-y-6">
        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-500 text-sm">Total Items</p>
                <p class="text-2xl font-bold text-gray-800">${this.stats.totalItems}</p>
              </div>
              <span class="text-3xl">📦</span>
            </div>
          </div>
          
          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-500 text-sm">Total Bids</p>
                <p class="text-2xl font-bold text-gray-800">${this.stats.totalBids}</p>
              </div>
              <span class="text-3xl">💰</span>
            </div>
          </div>
          
          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-500 text-sm">Active Chats</p>
                <p class="text-2xl font-bold text-gray-800">${this.stats.activeChats}</p>
              </div>
              <span class="text-3xl">💬</span>
            </div>
          </div>
          
          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-500 text-sm">Pending Sales</p>
                <p class="text-2xl font-bold text-yellow-600">${this.stats.pendingSales}</p>
              </div>
              <span class="text-3xl">⏳</span>
            </div>
          </div>
        </div>

        <!-- Add Item Button -->
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-bold text-gray-800">My Products</h2>
          <button 
            @click=${() => this.showAddItem = !this.showAddItem}
            class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            ${this.showAddItem ? 'Cancel' : '+ Add New Item'}
          </button>
        </div>

        <!-- Add Item Form -->
        ${this.showAddItem ? html`
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">List New Item</h3>
            <form @submit=${this.createItem} class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                <input 
                  type="text" 
                  .value=${this.newItem.name}
                  @input=${(e: Event) => this.newItem.name = (e.target as HTMLInputElement).value}
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  .value=${this.newItem.description}
                  @input=${(e: Event) => this.newItem.description = (e.target as HTMLTextAreaElement).value}
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Price (KSh)</label>
                  <input 
                    type="number" 
                    .value=${this.newItem.price}
                    @input=${(e: Event) => this.newItem.price = (e.target as HTMLInputElement).value}
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <input 
                    type="url" 
                    .value=${this.newItem.image}
                    @input=${(e: Event) => this.newItem.image = (e.target as HTMLInputElement).value}
                    placeholder="https://..."
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                </div>
              </div>
              
              <button 
                type="submit"
                class="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Create Listing
              </button>
            </form>
          </div>
        ` : ''}

        <!-- My Items Grid -->
        ${this.loading ? html`
          <div class="text-center py-12">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ` : html`
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${this.myItems.map(item => html`
              <div class="bg-white rounded-lg shadow overflow-hidden">
                <img src="${item.image}" alt="${item.name}" class="w-full h-40 object-cover">
                <div class="p-4">
                  <h3 class="font-semibold text-gray-800 mb-1">${item.name}</h3>
                  <p class="text-sm text-gray-600 mb-2 line-clamp-2">${item.description}</p>
                  <div class="flex justify-between items-center mb-3">
                    <span class="text-lg font-bold text-blue-600">KSh ${item.price.toLocaleString()}</span>
                    <span class="text-xs ${item.status === 'active' ? 'text-green-600' : 'text-gray-500'}">
                      ${item.status}
                    </span>
                  </div>
                  ${item.highestOffer ? html`
                    <div class="text-sm text-orange-600 mb-2">
                      Highest bid: KSh ${item.highestOffer.toLocaleString()}
                    </div>
                  ` : ''}
                  <div class="flex gap-2">
                    <button 
                      @click=${() => alert('Chat with bidders coming soon!')}
                      class="flex-1 bg-blue-600 text-white py-1 rounded-lg hover:bg-blue-700 text-sm"
                    >
                      💬 View Chats
                    </button>
                    <button 
                      @click=${() => this.deleteItem(item.id)}
                      class="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            `)}
          </div>
          
          ${this.myItems.length === 0 ? html`
            <div class="text-center py-12 bg-white rounded-lg">
              <div class="text-4xl mb-2">📦</div>
              <p class="text-gray-500">No items listed yet</p>
              <p class="text-sm text-gray-400 mt-1">Click "Add New Item" to start selling</p>
            </div>
          ` : ''}
        `}
      </div>
    `;
  }
}