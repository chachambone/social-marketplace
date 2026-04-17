import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Item } from '../types/index.js';

@customElement('item-card')
export class ItemCard extends LitElement {
  @property({ type: Object }) item!: Item;
  @property({ type: String }) currentUserId = '';

  render() {
    return html`
      <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <img src="${this.item.image}" alt="${this.item.name}" class="w-full h-48 object-cover">
        <div class="p-4">
          <h3 class="text-lg font-semibold text-gray-800 mb-2">${this.item.name}</h3>
          <p class="text-gray-600 text-sm mb-2 line-clamp-2">${this.item.description}</p>
          <div class="text-2xl font-bold text-blue-600 mb-2">
            KSh ${this.item.price.toLocaleString()}
          </div>
          <div class="text-sm text-gray-500 mb-3">Seller: ${this.item.sellerName}</div>
          <button 
            @click=${() => alert('Item details coming soon!')}
            class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Details
          </button>
        </div>
      </div>
    `;
  }
}