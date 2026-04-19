import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { Item } from '../types/index.js';
import { AuthService } from '../services/auth.js';
import { tailwindCSS } from '../styles.js';
import './bidDrawer.js';
import './itemDetails.Modal.js';
import './chatDrawer.js';

@customElement('item-card')
export class ItemCard extends LitElement {
  static styles = unsafeCSS(tailwindCSS);

  @property({ type: Object }) item!: Item;
  @property({ type: String }) currentUserId = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).id : null;
  @property({ type: Boolean }) showDrawer = false;
  @property({ type: Boolean }) showDetailsModal = false;
  @property({ type: Boolean }) showChatDrawer = false;
  @state() private isFavorited = false;

  connectedCallback() {
    super.connectedCallback();
    this.loadFavoriteStatus();
  }

  private loadFavoriteStatus() {
    const favorites = localStorage.getItem('favorites');
    if (favorites) {
      try {
        const favs = JSON.parse(favorites);
        this.isFavorited = favs.includes(this.item.id);
      } catch (e) {
        console.error('Error loading favorites', e);
      }
    }
  }

  private toggleFavorite(e: Event) {
    e.stopPropagation();
    const favorites = localStorage.getItem('favorites');
    let favs: string[] = [];
    if (favorites) {
      try {
        favs = JSON.parse(favorites);
      } catch (e) {}
    }
    
    if (this.isFavorited) {
      favs = favs.filter(id => id !== this.item.id);
    } else {
      favs.push(this.item.id);
    }
    
    localStorage.setItem('favorites', JSON.stringify(favs));
    this.isFavorited = !this.isFavorited;
    this.requestUpdate();
  }

  private openBidDrawer() {
    this.showDrawer = true;
    this.requestUpdate();
  }

  private closeDrawer() {
    this.showDrawer = false;
    this.requestUpdate();
  }

  private openDetailsModal() {
    this.showDetailsModal = true;
    this.requestUpdate();
  }

  private closeDetailsModal() {
    this.showDetailsModal = false;
    this.requestUpdate();
  }

  private openChatDrawer(e: Event) {
    e.stopPropagation();
    if (!this.currentUserId) {
      localStorage.setItem('redirectAfterLogin', `/chat/${this.item.id}`);
      window.location.href = '/login';
      return;
    }
    this.showChatDrawer = true;
    this.requestUpdate();
  }

  private closeChatDrawer() {
    this.showChatDrawer = false;
    this.requestUpdate();
  }

  private formatPrice(price: number) {
    return 'KSh ' + price.toLocaleString('en-KE');
  }

  private getConditionColor(condition: string) {
    const colors: Record<string, string> = {
      'New': 'bg-green-100 text-green-700',
      'Like New': 'bg-emerald-100 text-emerald-700',
      'Excellent': 'bg-blue-100 text-blue-700',
      'Good': 'bg-amber-100 text-amber-700',
      'Fair': 'bg-gray-100 text-gray-600'
    };
    return colors[condition] || 'bg-gray-100 text-gray-600';
  }

  render() {
    console.log("Rendering ItemCard for item:", this.item,this.currentUserId);
    const isOwner = this.currentUserId === this.item.sellerId;
    
    return html`
      <div class="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer">
        <!-- Image Section -->
        <div class="relative h-48 overflow-hidden bg-gray-100">
          <img 
            src="${this.item.image || 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400&h=300&fit=crop'}" 
            alt="${this.item.name}" 
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          >
          ${this.item.condition ? html`
            <span class="absolute top-3 left-3 text-xs font-semibold px-2 py-1 rounded-full ${this.getConditionColor(this.item.condition)}">
              ${this.item.condition}
            </span>
          ` : ''}
          <button 
            @click=${this.toggleFavorite}
            class="absolute top-3 right-3 p-1.5 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="${this.isFavorited ? '#EF4444' : 'none'}" stroke="${this.isFavorited ? '#EF4444' : '#9CA3AF'}" stroke-width="2">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
            </svg>
          </button>
          ${this.item.sold ? html`
            <div class="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span class="bg-red-500 text-white font-black text-xl px-5 py-2 rounded-xl rotate-[-6deg]">SOLD</span>
            </div>
          ` : ''}
        </div>
        
        <!-- Content Section -->
        <div class="p-4">
          <h3 class="font-bold text-gray-900 text-base line-clamp-1 mb-1">${this.item.name}</h3>
          <p class="text-gray-500 text-xs line-clamp-2 mb-2">${this.item.description}</p>
          <div class="flex items-center justify-between mb-2">
            <p class="font-bold text-xl" style="color: #F3A712">${this.formatPrice(this.item.price || this.item.starting_price || 0)}</p>
            <span class="text-xs text-gray-400">Seller: ${this.item.sellerName}</span>
          </div>
          
          <div class="flex gap-2 mt-3">
            <button 
              @click=${this.openDetailsModal}
              class="flex-1 bg-gray-600 text-white py-2 rounded-xl hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              View Details
            </button>
            ${!this.item.sold ? html`
              <button 
                @click=${this.openBidDrawer}
                class="flex-1 py-2 rounded-xl font-semibold text-sm transition-colors"
                style="background-color: #F3A712; color: white;"
              >
              ${!isOwner ? 'Make Offer' : 'View Chat'}
              </button>
              
            ` : ''}

            
          </div>
        </div>
      </div>
      
      <!-- Bid Drawer -->
      <bid-drawer 
        .item=${this.item}
        .isOpen=${this.showDrawer}
        @drawer-closed=${this.closeDrawer}
      ></bid-drawer>
      
      <!-- Item Details Modal -->
      <item-details-modal
        .item=${this.item}
        .isOpen=${this.showDetailsModal}
        @modal-closed=${this.closeDetailsModal}
      ></item-details-modal>
      
      <!-- Chat Drawer -->
      <chat-drawer
        .item=${this.item}
        .currentUserId=${this.currentUserId}
        .isOpen=${this.showChatDrawer}
        @drawer-closed=${this.closeChatDrawer}
      ></chat-drawer>
    `;
  }
}