import { LitElement, html, css,unsafeCSS } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { ItemService } from '../services/item.js';
import { AuthService } from '../services/auth.js';
import { Item } from '../types/index.js';
import './ItemCard.js';
import { tailwindCSS } from '../styles.js';

@customElement('items-grid')
export class ItemsGrid extends LitElement {

    static styles = [unsafeCSS(tailwindCSS),
css`
    :host { display: block; }
    .search-bar { margin-bottom: 2rem; }
    .search-input { width: 100%; max-width: 400px; padding: 0.75rem; border: 1px solid #e5e7eb; border-radius: 0.5rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
    .loading, .error, .empty { text-align: center; padding: 3rem; }
    .spinner { display: inline-block; width: 40px; height: 40px; border: 3px solid #f3f4f6; border-top-color: #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `

    ];
  

  @state() private items: Item[] = [];
  @state() private loading = true;
  @state() private error = '';
  @state() private searchTerm = '';


  connectedCallback() {
    super.connectedCallback();
    this.loadItems();
  }

  private async loadItems() {
    try {
      this.loading = true;
      this.error = '';
      this.items = await ItemService.getAllItems(this.searchTerm);
    } catch (err: any) {
      this.error = err.message || 'Failed to load items';
    } finally {
      this.loading = false;
    }
  }

  private handleSearch(e: Event) {
    const input = e.target as HTMLInputElement;
    this.searchTerm = input.value;
    this.loadItems();
  }

  render() {
    const currentUser = AuthService.getCurrentUser();
    
    if (this.loading) {
      return html`<div class="loading"><div class="spinner"></div><p>Loading items...</p></div>`;
    }

    if (this.error) {
      return html`<div class="error"><p>❌ ${this.error}</p><button @click=${this.loadItems}>Try Again</button></div>`;
    }

    if (this.items.length === 0) {
      return html`<div class="empty"><p>��� No items found</p></div>`;
    }

    return html`
      <div class="search-bar">
        <input type="text" class="search-input" placeholder="��� Search items..." .value=${this.searchTerm} @input=${this.handleSearch}>
      </div>
      <div class="grid">
        ${this.items.map(item => html`<item-card .item=${item} .currentUserId=${currentUser?.id || ''}></item-card>`)}
      </div>
    `;
  }
}
