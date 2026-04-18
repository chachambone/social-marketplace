import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Item } from '../types/index.js';

@customElement('item-details-modal')
export class ItemDetailsModal extends LitElement {
  static styles = css`
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    .modal-overlay {
      position: fixed;
      inset: 0;
      z-index: 50;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      background-color: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      animation: fadeIn 0.2s ease-out;
    }

    .modal-container {
      background-color: white;
      border-radius: 1rem;
      max-width: 42rem;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      animation: slideUp 0.3s ease-out;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }

    .modal-header {
      position: sticky;
      top: 0;
      background-color: white;
      border-bottom: 1px solid #e5e7eb;
      padding: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 10;
    }

    .modal-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #111827;
      margin: 0;
    }

    .close-button {
      background: none;
      border: none;
      cursor: pointer;
      color: #6b7280;
      transition: color 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.25rem;
      border-radius: 0.375rem;
    }

    .close-button:hover {
      color: #374151;
      background-color: #f3f4f6;
    }

    .modal-content {
      padding: 1.5rem;
    }

    .item-image {
      width: 100%;
      height: 16rem;
      object-fit: cover;
      border-radius: 0.5rem;
      margin-bottom: 1rem;
    }

    .price-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }

    .item-price {
      font-size: 1.875rem;
      font-weight: 700;
      color: #F3A712;
    }

    .seller-name {
      font-size: 0.875rem;
      color: #6b7280;
    }

    .tags-section {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .tag {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.25rem 0.5rem;
      border-radius: 9999px;
    }

    .tag-condition {
      background-color: #dbeafe;
      color: #1e40af;
    }

    .tag-category {
      background-color: #f3f4f6;
      color: #4b5563;
    }

    .section {
      margin-bottom: 1rem;
    }

    .section-title {
      font-size: 1rem;
      font-weight: 600;
      color: #111827;
      margin-bottom: 0.5rem;
    }

    .section-content {
      color: #4b5563;
      line-height: 1.5;
    }

    /* Scrollbar styling */
    .modal-container::-webkit-scrollbar {
      width: 8px;
    }

    .modal-container::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 4px;
    }

    .modal-container::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 4px;
    }

    .modal-container::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }

    /* Animations */
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @keyframes slideUp {
      from {
        transform: translateY(20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    /* Mobile responsive */
    @media (max-width: 640px) {
      .modal-title {
        font-size: 1.25rem;
      }
      
      .item-price {
        font-size: 1.5rem;
      }
      
      .modal-content {
        padding: 1rem;
      }
      
      .item-image {
        height: 12rem;
      }
    }
  `;

  @property({ type: Object }) item!: Item;
  @property({ type: Boolean }) isOpen = false;

  private closeModal(e: Event) {
    if (e.target === e.currentTarget) {
      this.isOpen = false;
      this.dispatchEvent(new CustomEvent('modal-closed'));
    }
  }

  private handleCloseClick() {
    this.isOpen = false;
    this.dispatchEvent(new CustomEvent('modal-closed'));
  }

  private formatPrice(price: number) {
    return 'KSh ' + price.toLocaleString('en-KE');
  }

  render() {
    if (!this.isOpen) return html``;

    return html`
      <div class="modal-overlay" @click=${this.closeModal}>
        <div class="modal-container">
          <div class="modal-header">
            <h2 class="modal-title">${this.item.name}</h2>
            <button @click=${this.handleCloseClick} class="close-button">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          
          <div class="modal-content">
            <img 
              src="${this.item.image || 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=600&h=400&fit=crop'}" 
              alt="${this.item.name}" 
              class="item-image"
            >
            
            <div class="price-section">
              <span class="item-price">${this.formatPrice(this.item.price || this.item.starting_price || 0)}</span>
              <span class="seller-name">Seller: ${this.item.sellerName}</span>
            </div>
            
            <div class="tags-section">
              ${this.item.condition ? html`
                <span class="tag tag-condition">
                  ${this.item.condition}
                </span>
              ` : ''}
              ${this.item.category ? html`
                <span class="tag tag-category">
                  ${this.item.category}
                </span>
              ` : ''}
            </div>
            
            <div class="section">
              <h3 class="section-title">Description</h3>
              <p class="section-content">${this.item.description}</p>
            </div>
            
            ${this.item.location ? html`
              <div class="section">
                <h3 class="section-title">Location</h3>
                <p class="section-content">${this.item.location}</p>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }
}