import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Item } from '../types/index.js';
import { tailwindCSS } from '../styles.js';
import './BidDrawer.js';

@customElement('item-card')
export class ItemCard extends LitElement {
  static styles = unsafeCSS(tailwindCSS);

  @property({ type: Object }) item!: Item;
  @property({ type: String }) currentUserId = '';
  @property({ type: Boolean }) showDrawer = false;

  private openBidDrawer() {
    this.showDrawer = true;
    this.requestUpdate();
  }

  private closeDrawer() {
    this.showDrawer = false;
    this.requestUpdate();
  }

  render() {
    const isOwner = this.currentUserId === this.item.sellerId;
    
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
          <div class="flex gap-2">
            <button 
              @click=${() => alert('Item details coming soon!')}
              class="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              View Details
            </button>
            ${!isOwner ? html`
              <button 
                @click=${this.openBidDrawer}
                class="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                💰 Start Bid
              </button>
            ` : ''}
          </div>
        </div>
      </div>
      
      <bid-drawer 
        .item=${this.item}
        .isOpen=${this.showDrawer}
        @drawer-closed=${this.closeDrawer}
      ></bid-drawer>
    `;
  }
}