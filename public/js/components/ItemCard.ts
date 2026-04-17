import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Item } from '../types/index.js';

@customElement('item-card')
export class ItemCard extends LitElement {
  @property({ type: Object }) item!: Item;
  @property({ type: String }) currentUserId = '';

  static styles = css`
    :host { display: block; height: 100%; }
    .card { background: white; border-radius: 0.5rem; overflow: hidden; box-shadow: 0 1px 3px 0 rgba(0,0,0,0.1); height: 100%; }
    .card:hover { transform: translateY(-4px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
    img { width: 100%; height: 200px; object-fit: cover; }
    .content { padding: 1rem; }
    h3 { font-size: 1.125rem; font-weight: 600; margin: 0 0 0.5rem 0; }
    .price { font-size: 1.5rem; font-weight: bold; color: #3b82f6; }
    .seller { font-size: 0.75rem; color: #9ca3af; margin-bottom: 1rem; }
    button { width: 100%; padding: 0.5rem; background: #3b82f6; color: white; border: none; border-radius: 0.375rem; cursor: pointer; }
  `;

  render() {
    return html`
      <div class="card">
        <img src="${this.item.image}" alt="${this.item.name}">
        <div class="content">
          <h3>${this.item.name}</h3>
          <div class="price">$${this.item.price.toLocaleString()}</div>
          <div class="seller">Seller: ${this.item.sellerName}</div>
          <button @click=${() => alert('Item details coming soon!')}>View Details</button>
        </div>
      </div>
    `;
  }
}
