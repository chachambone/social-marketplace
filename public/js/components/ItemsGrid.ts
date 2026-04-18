import { LitElement, html, css, unsafeCSS } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { ItemService } from '../services/item.js';
import { AuthService } from '../services/auth.js';
import { Item } from '../types/index.js';
import { tailwindCSS } from '../styles.js';
import './ItemCard.js';

// SVG Icons
const searchIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`;
const gridIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`;
const listIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`;
const filterIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 13 10 21 14 18 14 13 22 3"/></svg>`;
const xIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
const chevronDownIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`;

@customElement('items-grid')
export class ItemsGrid extends LitElement {
  static styles = [
    unsafeCSS(tailwindCSS),
    css`
      :host { display: block; }
      
      .search-container {
        margin-bottom: 1.5rem;
      }
      
      .search-wrapper {
        position: relative;
        max-width: 100%;
      }
      
      .search-icon {
        position: absolute;
        left: 1rem;
        top: 50%;
        transform: translateY(-50%);
        color: #9CA3AF;
        pointer-events: none;
      }
      
      .search-input {
        width: 100%;
        padding: 0.875rem 1rem 0.875rem 2.75rem;
        border: 1px solid #E5E7EB;
        border-radius: 1rem;
        font-size: 0.875rem;
        transition: all 0.2s;
        background-color: white;
      }
      
      .search-input:focus {
        outline: none;
        border-color: #F3A712;
        box-shadow: 0 0 0 3px rgba(243, 167, 18, 0.1);
      }
      
      .toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        flex-wrap: wrap;
        gap: 1rem;
      }
      
      .filters-section {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }
      
      .filter-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        background-color: #F3F4F6;
        border: none;
        border-radius: 2rem;
        font-size: 0.875rem;
        font-weight: 500;
        color: #374151;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .filter-btn:hover {
        background-color: #E5E7EB;
      }
      
      .filter-btn.active {
        background-color: #F3A712;
        color: white;
      }
      
      .results-count {
        font-size: 0.875rem;
        color: #6B7280;
      }
      
      .view-toggle {
        display: flex;
        gap: 0.25rem;
        background-color: #F3F4F6;
        padding: 0.25rem;
        border-radius: 0.75rem;
      }
      
      .view-btn {
        padding: 0.5rem;
        border-radius: 0.5rem;
        border: none;
        cursor: pointer;
        background: transparent;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .view-btn.active {
        background-color: #F3A712;
        color: white;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }
      
      .view-btn:not(.active) {
        color: #6B7280;
      }
      
      .view-btn:not(.active):hover {
        background-color: #E5E7EB;
      }
      
      /* Filter Chips */
      .filter-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 1.5rem;
      }
      
      .filter-chip {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.375rem 0.75rem;
        background-color: #F3A712;
        color: white;
        border-radius: 2rem;
        font-size: 0.75rem;
        font-weight: 500;
      }
      
      .filter-chip button {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0.8;
      }
      
      .filter-chip button:hover {
        opacity: 1;
      }
      
      /* Filter Panel */
      .filter-panel {
        background-color: white;
        border-radius: 1rem;
        border: 1px solid #E5E7EB;
        padding: 1.25rem;
        margin-bottom: 1.5rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
      }
      
      .filter-group {
        margin-bottom: 1rem;
      }
      
      .filter-label {
        font-size: 0.75rem;
        font-weight: 600;
        color: #6B7280;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 0.5rem;
      }
      
      .filter-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }
      
      .filter-option {
        padding: 0.375rem 0.875rem;
        background-color: #F3F4F6;
        border: none;
        border-radius: 2rem;
        font-size: 0.813rem;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .filter-option:hover {
        background-color: #E5E7EB;
      }
      
      .filter-option.selected {
        background-color: #F3A712;
        color: white;
      }
      
      .price-inputs {
        display: flex;
        gap: 0.75rem;
      }
      
      .price-input {
        flex: 1;
        padding: 0.5rem 0.75rem;
        border: 1px solid #E5E7EB;
        border-radius: 0.75rem;
        font-size: 0.875rem;
      }
      
      .price-input:focus {
        outline: none;
        border-color: #F3A712;
      }
      
      .filter-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid #F3F4F6;
      }
      
      .clear-filters-btn {
        padding: 0.5rem 1rem;
        background: none;
        border: none;
        color: #6B7280;
        font-size: 0.813rem;
        cursor: pointer;
      }
      
      .apply-filters-btn {
        padding: 0.5rem 1.25rem;
        background-color: #F3A712;
        color: white;
        border: none;
        border-radius: 0.75rem;
        font-size: 0.813rem;
        font-weight: 500;
        cursor: pointer;
      }
      
      /* Grid View */
      .grid-view {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
      }
      
      /* List View */
      .list-view {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      
      .loading-container, .error-container, .empty-container {
        text-align: center;
        padding: 3rem;
        background: white;
        border-radius: 1rem;
        border: 1px solid #F3F4F6;
      }
      
      .spinner {
        display: inline-block;
        width: 40px;
        height: 40px;
        border: 3px solid #F3F4F6;
        border-top-color: #F3A712;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      
      .error-btn {
        margin-top: 1rem;
        padding: 0.5rem 1.5rem;
        background-color: #F3A712;
        color: white;
        border: none;
        border-radius: 0.75rem;
        cursor: pointer;
        font-weight: 600;
      }
      
      .error-btn:hover {
        background-color: #E8950A;
      }
    `
  ];

  @state() private items: Item[] = [];
  @state() private filteredItems: Item[] = [];
  @state() private loading = true;
  @state() private error = '';
  @state() private searchTerm = '';
  @state() private searchDraft = '';
  @state() private viewMode: 'grid' | 'list' = 'grid';
  @state() private showFilters = false;
  
  // Filter states
  @state() private selectedCategory = 'All';
  @state() private selectedCondition = 'All';
  @state() private priceMin: number | null = null;
  @state() private priceMax: number | null = null;
  @state() private sortBy: 'newest' | 'price-low' | 'price-high' | 'rating' = 'newest';
  
  private categories = ['All', 'Electronics', 'Furniture', 'Clothing', 'Books', 'Sports', 'Toys', 'Art', 'Jewelry', 'Collectibles'];
  private conditions = ['All', 'New', 'Like New', 'Excellent', 'Good', 'Fair'];
  private debounceTimer: number | null = null;

  connectedCallback() {
    super.connectedCallback();
    const savedView = localStorage.getItem('items_grid_view');
    if (savedView === 'list' || savedView === 'grid') {
      this.viewMode = savedView;
    }
    this.loadItems();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
  }

  private async loadItems() {
    try {
      this.loading = true;
      this.error = '';
      const params: any = { sold: 'false' };
      if (this.searchTerm.trim()) params.search = this.searchTerm.trim();
      if (this.selectedCategory !== 'All') params.category = this.selectedCategory;
      
      const data = await ItemService.getAllItems(params);
      //@ts-ignore
      this.items = Array.isArray(data) ? data : (data.items || []);
      this.applyFiltersAndSort();
    } catch (err: any) {
      this.error = err.message || 'Failed to load items';
    } finally {
      this.loading = false;
    }
  }

  private applyFiltersAndSort() {
    let filtered = [...this.items];
    
    // Apply condition filter
    if (this.selectedCondition !== 'All') {
      filtered = filtered.filter(item => item.condition === this.selectedCondition);
    }
    
    // Apply price range filter
    if (this.priceMin !== null) {
      filtered = filtered.filter(item => (item.price || item.starting_price || 0) >= this.priceMin!);
    }
    if (this.priceMax !== null) {
      filtered = filtered.filter(item => (item.price || item.starting_price || 0) <= this.priceMax!);
    }
    
    // Apply sorting
    switch (this.sortBy) {
      case 'price-low':
        filtered.sort((a, b) => (a.price || a.starting_price || 0) - (b.price || b.starting_price || 0));
        break;
      case 'price-high':
        filtered.sort((a, b) => (b.price || b.starting_price || 0) - (a.price || a.starting_price || 0));
        break;
      case 'rating':
        //@ts-ignore
        filtered.sort((a, b) => (b.sellerRating || 0) - (a.sellerRating || 0));
        break;
      default: // newest
        filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }
    
    this.filteredItems = filtered;
    this.requestUpdate();
  }

  private handleSearchInput(e: Event) {
    const input = e.target as HTMLInputElement;
    this.searchDraft = input.value;
    
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    
    this.debounceTimer = window.setTimeout(() => {
      this.searchTerm = this.searchDraft;
      this.loadItems();
    }, 350);
  }

  private handleSearchSubmit(e: Event) {
    e.preventDefault();
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.searchTerm = this.searchDraft;
    this.loadItems();
  }

  private setViewMode(mode: 'grid' | 'list') {
    this.viewMode = mode;
    localStorage.setItem('items_grid_view', mode);
    this.requestUpdate();
  }

  private toggleFilters() {
    this.showFilters = !this.showFilters;
    this.requestUpdate();
  }

  private setCategory(category: string) {
    this.selectedCategory = category;
    if (category === 'All') {
      this.loadItems();
    } else {
      this.loadItems();
    }
  }

  private setCondition(condition: string) {
    this.selectedCondition = condition;
    this.applyFiltersAndSort();
  }

  private setSortBy(e: Event) {
    const select = e.target as HTMLSelectElement;
    this.sortBy = select.value as any;
    this.applyFiltersAndSort();
  }

  private updatePriceMin(e: Event) {
    const input = e.target as HTMLInputElement;
    this.priceMin = input.value ? Number(input.value) : null;
    this.applyFiltersAndSort();
  }

  private updatePriceMax(e: Event) {
    const input = e.target as HTMLInputElement;
    this.priceMax = input.value ? Number(input.value) : null;
    this.applyFiltersAndSort();
  }

  private clearFilters() {
    this.selectedCategory = 'All';
    this.selectedCondition = 'All';
    this.priceMin = null;
    this.priceMax = null;
    this.sortBy = 'newest';
    this.searchDraft = '';
    this.searchTerm = '';
    this.loadItems();
  }

  private getActiveFilterCount(): number {
    let count = 0;
    if (this.selectedCategory !== 'All') count++;
    if (this.selectedCondition !== 'All') count++;
    if (this.priceMin !== null) count++;
    if (this.priceMax !== null) count++;
    return count;
  }

  private removeFilter(type: string) {
    switch (type) {
      case 'category':
        this.selectedCategory = 'All';
        this.loadItems();
        break;
      case 'condition':
        this.selectedCondition = 'All';
        this.applyFiltersAndSort();
        break;
      case 'priceMin':
        this.priceMin = null;
        this.applyFiltersAndSort();
        break;
      case 'priceMax':
        this.priceMax = null;
        this.applyFiltersAndSort();
        break;
    }
  }

  private icon(svg: string, size = 16, className = '') {
    return html`<span class="inline-flex items-center justify-center ${className}" style="width:${size}px;height:${size}px">${unsafeHTML(svg)}</span>`;
  }

  render() {
    if (this.loading) {
      return html`
        <div class="loading-container">
          <div class="spinner"></div>
          <p class="mt-3 text-gray-500">Loading amazing items...</p>
        </div>
      `;
    }

    if (this.error) {
      return html`
        <div class="error-container">
          <div class="text-5xl mb-3">😕</div>
          <p class="text-red-500 mb-3">${this.error}</p>
          <button class="error-btn" @click=${this.loadItems}>Try Again</button>
        </div>
      `;
    }

    const activeFilterCount = this.getActiveFilterCount();

    return html`
      <div>
        <!-- Search Bar -->
        <div class="search-container">
          <form @submit=${this.handleSearchSubmit} class="search-wrapper">
            <span class="search-icon">${this.icon(searchIcon, 20)}</span>
            <input 
              type="text" 
              class="search-input"
              placeholder="Search items by name, category, or keyword..." 
              .value=${this.searchDraft}
              @input=${this.handleSearchInput}
            />
          </form>
        </div>
        
        <!-- Toolbar -->
        <div class="toolbar">
          <div class="filters-section">
            <button class="filter-btn ${this.showFilters ? 'active' : ''}" @click=${this.toggleFilters}>
              ${this.icon(filterIcon, 14)} Filters
              ${activeFilterCount > 0 ? html`<span class="ml-1 bg-white/30 px-1.5 py-0.5 rounded-full text-xs">${activeFilterCount}</span>` : ''}
            </button>
            
            <select class="filter-btn" @change=${this.setSortBy} .value=${this.sortBy}>
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
          
          <div class="flex items-center gap-3">
            <span class="results-count">${this.filteredItems.length} item${this.filteredItems.length !== 1 ? 's' : ''}</span>
            <div class="view-toggle">
              <button class="view-btn ${this.viewMode === 'grid' ? 'active' : ''}" @click=${() => this.setViewMode('grid')} title="Grid view">
                ${this.icon(gridIcon, 16)}
              </button>
              <button class="view-btn ${this.viewMode === 'list' ? 'active' : ''}" @click=${() => this.setViewMode('list')} title="List view">
                ${this.icon(listIcon, 16)}
              </button>
            </div>
          </div>
        </div>
        
        <!-- Filter Panel -->
        ${this.showFilters ? html`
          <div class="filter-panel">
            <div class="filter-group">
              <div class="filter-label">Category</div>
              <div class="filter-options">
                ${this.categories.map(cat => html`
                  <button class="filter-option ${this.selectedCategory === cat ? 'selected' : ''}" @click=${() => this.setCategory(cat)}>
                    ${cat}
                  </button>
                `)}
              </div>
            </div>
            
            <div class="filter-group">
              <div class="filter-label">Condition</div>
              <div class="filter-options">
                ${this.conditions.map(cond => html`
                  <button class="filter-option ${this.selectedCondition === cond ? 'selected' : ''}" @click=${() => this.setCondition(cond)}>
                    ${cond}
                  </button>
                `)}
              </div>
            </div>
            
            <div class="filter-group">
              <div class="filter-label">Price Range (KSh)</div>
              <div class="price-inputs">
                <input type="number" class="price-input" placeholder="Min" .value=${this.priceMin || ''} @input=${this.updatePriceMin}>
                <input type="number" class="price-input" placeholder="Max" .value=${this.priceMax || ''} @input=${this.updatePriceMax}>
              </div>
            </div>
            
            <div class="filter-actions">
              <button class="clear-filters-btn" @click=${this.clearFilters}>Clear all filters</button>
            </div>
          </div>
        ` : ''}
        
        <!-- Active Filter Chips -->
        ${activeFilterCount > 0 && !this.showFilters ? html`
          <div class="filter-chips">
            ${this.selectedCategory !== 'All' ? html`
              <span class="filter-chip">
                Category: ${this.selectedCategory}
                <button @click=${() => this.removeFilter('category')}>${this.icon(xIcon, 12)}</button>
              </span>
            ` : ''}
            ${this.selectedCondition !== 'All' ? html`
              <span class="filter-chip">
                Condition: ${this.selectedCondition}
                <button @click=${() => this.removeFilter('condition')}>${this.icon(xIcon, 12)}</button>
              </span>
            ` : ''}
            ${this.priceMin !== null ? html`
              <span class="filter-chip">
                Min: KSh ${this.priceMin.toLocaleString()}
                <button @click=${() => this.removeFilter('priceMin')}>${this.icon(xIcon, 12)}</button>
              </span>
            ` : ''}
            ${this.priceMax !== null ? html`
              <span class="filter-chip">
                Max: KSh ${this.priceMax.toLocaleString()}
                <button @click=${() => this.removeFilter('priceMax')}>${this.icon(xIcon, 12)}</button>
              </span>
            ` : ''}
          </div>
        ` : ''}
        
        <!-- Items Grid/List -->
        ${this.filteredItems.length === 0 ? html`
          <div class="empty-container">
            <div class="text-6xl mb-3">🔍</div>
            <p class="text-gray-800 font-semibold text-lg mb-2">No items found</p>
            <p class="text-gray-400 text-sm">Try adjusting your search or filters</p>
            <button class="error-btn mt-4" @click=${this.clearFilters}>Clear Filters</button>
          </div>
        ` : html`
          <div class="${this.viewMode === 'grid' ? 'grid-view' : 'list-view'}">
            ${this.filteredItems.map(item => html`
              <item-card 
                .item=${item} 
                .currentUserId=${AuthService.getCurrentUser()?.id || ''}
              ></item-card>
            `)}
          </div>
        `}
      </div>
    `;
  }
}