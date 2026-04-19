// SellerDashboard.ts - Fixed version with working button and form
import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { AuthService } from '../services/auth.js';
import { Item } from '../types/index.js';

const CATEGORIES = [
  { id: "Electronics", name: "Electronics", emoji: "📱", color: "#3B82F6" },
  { id: "Photography", name: "Photography", emoji: "📷", color: "#EF4444" },
  { id: "Music", name: "Music", emoji: "🎵", color: "#8B5CF6" },
  { id: "Furniture", name: "Furniture", emoji: "🛋️", color: "#F59E0B" },
  { id: "Sports", name: "Sports", emoji: "⚽", color: "#10B981" },
  { id: "Art", name: "Art", emoji: "🎨", color: "#EC4899" },
  { id: "Wearables", name: "Wearables", emoji: "⌚", color: "#6366F1" }
];

const CONDITIONS = [
  { value: "New", label: "New", description: "Never used, in original packaging" },
  { value: "Like New", label: "Like New", description: "Used but looks brand new" },
  { value: "Good", label: "Good", description: "Light wear and tear" },
  { value: "Fair", label: "Fair", description: "Visible wear but functional" }
];

const SHIPPING_OPTIONS = [
  "Local pickup only",
  "Nationwide shipping",
  "International shipping"
];

@customElement('seller-dashboard')
export class SellerDashboard extends LitElement {
  static styles = css`
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    :host {
      display: block;
      width: 100%;
    }

    .container {
      min-height: 100vh;
      background: linear-gradient(to bottom right, #f9fafb, #f3f4f6);
      padding: 2rem 1rem;
    }

    .max-width {
      max-width: 80rem;
      margin: 0 auto;
    }

    /* Header */
    .header {
      margin-bottom: 2rem;
    }

    .title {
      font-size: 1.875rem;
      font-weight: 700;
      color: #111827;
      margin-bottom: 0.5rem;
    }

    .subtitle {
      color: #6b7280;
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      border-radius: 0.75rem;
      border: 1px solid #f3f4f6;
      padding: 1.25rem;
      transition: all 0.2s;
      cursor: pointer;
    }

    .stat-card:hover {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }

    .stat-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .stat-label {
      color: #6b7280;
      font-size: 0.875rem;
    }

    .stat-value {
      font-size: 1.875rem;
      font-weight: 700;
      color: #111827;
      margin-top: 0.25rem;
    }

    .stat-icon {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 9999px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
    }

    .stat-value-green {
      color: #10b981;
    }

    .stat-value-yellow {
      color: #d97706;
    }

    /* Action Bar */
    .action-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .section-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: #111827;
    }

    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 1.25rem;
      background: #F3A712;
      color: white;
      border: none;
      border-radius: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 0.875rem;
    }

    .btn-primary:hover {
      background: #F97316;
      transform: translateY(-1px);
    }

    .btn-secondary {
      padding: 0.5rem 1rem;
      background: #4b5563;
      color: white;
      border: none;
      border-radius: 0.75rem;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
    }

    .btn-secondary:hover {
      background: #374151;
    }

    .btn-danger {
      padding: 0.5rem 1rem;
      background: #ef4444;
      color: white;
      border: none;
      border-radius: 0.75rem;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
    }

    .btn-danger:hover {
      background: #dc2626;
    }

    .btn-outline {
      flex: 1;
      padding: 0.625rem 1.5rem;
      background: white;
      border: 1px solid #d1d5db;
      border-radius: 0.75rem;
      cursor: pointer;
      transition: all 0.2s;
      font-weight: 500;
    }

    .btn-outline:hover {
      background: #f9fafb;
    }

    /* Form */
    .form-container {
      background: white;
      border-radius: 1rem;
      border: 1px solid #f3f4f6;
      overflow: hidden;
      margin-bottom: 2rem;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    }

    .form-header {
      padding: 1.5rem;
      border-bottom: 1px solid #f3f4f6;
      background: #fef3c7;
    }

    .form-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: #111827;
    }

    .form-subtitle {
      font-size: 0.875rem;
      color: #6b7280;
      margin-top: 0.25rem;
    }

    .form-body {
      padding: 1.5rem;
    }

    .form-group {
      margin-bottom: 1.25rem;
    }

    .form-label {
      display: block;
      font-size: 0.875rem;
      font-weight: 600;
      color: #374151;
      margin-bottom: 0.5rem;
    }

    .form-label .required {
      color: #ef4444;
    }

    .form-input,
    .form-textarea,
    .form-select {
      width: 100%;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 0.75rem;
      padding: 0.75rem 1rem;
      font-size: 0.875rem;
      transition: all 0.2s;
    }

    .form-input:focus,
    .form-textarea:focus,
    .form-select:focus {
      outline: none;
      border-color: #F3A712;
      box-shadow: 0 0 0 2px rgba(243, 167, 18, 0.1);
    }

    .form-textarea {
      resize: vertical;
    }

    .price-input-wrapper {
      position: relative;
    }

    .price-prefix {
      position: absolute;
      left: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      color: #6b7280;
    }

    .price-input {
      width: 100%;
      padding: 0.75rem 1rem 0.75rem 2.5rem;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 0.75rem;
      font-size: 1rem;
      font-weight: 600;
    }

    .grid-2 {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    @media (min-width: 768px) {
      .grid-2 {
        grid-template-columns: 1fr 1fr;
      }
    }

    /* Image Upload */
    .upload-area {
      border: 2px dashed #d1d5db;
      border-radius: 0.75rem;
      padding: 1.5rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
    }

    .upload-area:hover {
      border-color: #F3A712;
    }

    .upload-icon {
      font-size: 3rem;
      color: #9ca3af;
      margin-bottom: 0.75rem;
      display: inline-block;
    }

    .upload-text {
      color: #6b7280;
      margin-bottom: 0.5rem;
    }

    .upload-hint {
      font-size: 0.75rem;
      color: #9ca3af;
      margin-bottom: 1rem;
    }

    .upload-buttons {
      display: flex;
      gap: 0.5rem;
      justify-content: center;
    }

    .btn-upload {
      padding: 0.5rem 1rem;
      background: #F3A712;
      color: white;
      border: none;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      cursor: pointer;
    }

    .btn-url {
      padding: 0.5rem 1rem;
      background: white;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      cursor: pointer;
    }

    .gallery {
      margin-top: 1rem;
      display: flex;
      gap: 0.5rem;
      overflow-x: auto;
      padding-bottom: 0.5rem;
    }

    .gallery-item {
      position: relative;
      flex-shrink: 0;
    }

    .gallery-image {
      width: 5rem;
      height: 5rem;
      border-radius: 0.5rem;
      object-fit: cover;
      border: 2px solid #e5e7eb;
    }

    .remove-image {
      position: absolute;
      top: -0.5rem;
      right: -0.5rem;
      background: #ef4444;
      color: white;
      border: none;
      border-radius: 9999px;
      width: 1.25rem;
      height: 1.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      cursor: pointer;
    }

    /* Tags */
    .tag-input-wrapper {
      display: flex;
      gap: 0.5rem;
    }

    .tag-input {
      flex: 1;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 0.75rem;
      padding: 0.75rem 1rem;
      font-size: 0.875rem;
    }

    .tag-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }

    .tag {
      background: #f3f4f6;
      color: #374151;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
    }

    .tag-remove {
      background: none;
      border: none;
      cursor: pointer;
      color: #6b7280;
      font-size: 0.75rem;
    }

    /* Items Grid */
    .items-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .item-card {
      background: white;
      border-radius: 1rem;
      overflow: hidden;
      border: 1px solid #f3f4f6;
      transition: all 0.2s;
    }

    .item-card:hover {
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      transform: translateY(-4px);
    }

    .item-image-wrapper {
      position: relative;
      height: 12rem;
      overflow: hidden;
      background: #f3f4f6;
    }

    .item-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s;
    }

    .item-card:hover .item-image {
      transform: scale(1.05);
    }

    .item-badge {
      position: absolute;
      top: 0.75rem;
      left: 0.75rem;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.25rem 0.5rem;
      border-radius: 9999px;
      background: #dbeafe;
      color: #1e40af;
    }

    .item-category {
      position: absolute;
      top: 0.75rem;
      right: 0.75rem;
      font-size: 0.875rem;
      font-weight: 600;
      padding: 0.25rem 0.5rem;
      border-radius: 9999px;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(4px);
    }

    .sold-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .sold-text {
      background: #ef4444;
      color: white;
      font-weight: 900;
      font-size: 1.5rem;
      padding: 0.5rem 1.25rem;
      border-radius: 0.75rem;
      transform: rotate(-6deg);
    }

    .item-content {
      padding: 1rem;
    }

    .item-title {
      font-weight: 700;
      color: #111827;
      font-size: 1rem;
      margin-bottom: 0.25rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .item-description {
      color: #6b7280;
      font-size: 0.75rem;
      margin-bottom: 0.5rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .item-price-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }

    .item-price {
      font-weight: 700;
      font-size: 1.25rem;
      color: #F3A712;
    }

    .item-status {
      font-size: 0.75rem;
      padding: 0.25rem 0.5rem;
      border-radius: 9999px;
    }

    .status-active {
      background: #d1fae5;
      color: #065f46;
    }

    .status-sold {
      background: #fee2e2;
      color: #991b1b;
    }

    .highest-bid {
      font-size: 0.875rem;
      color: #10b981;
      margin-bottom: 0.75rem;
    }

    .item-actions {
      display: flex;
      gap: 0.5rem;
    }

    /* Loading Spinner */
    .spinner-container {
      display: flex;
      justify-content: center;
      padding: 3rem;
    }

    .spinner {
      display: inline-block;
      width: 2rem;
      height: 2rem;
      border: 2px solid #f3f4f6;
      border-top-color: #F3A712;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    /* Empty State */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 4rem;
      background: white;
      border-radius: 1rem;
      border: 1px solid #f3f4f6;
    }

    .empty-icon {
      width: 5rem;
      height: 5rem;
      background: #f3f4f6;
      border-radius: 9999px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      margin-bottom: 1rem;
    }

    .empty-title {
      color: #6b7280;
      font-weight: 500;
      margin-bottom: 0.25rem;
    }

    .empty-subtitle {
      font-size: 0.875rem;
      color: #9ca3af;
    }

    /* Toast */
    .toast {
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 50;
      background: #10b981;
      color: white;
      border-radius: 0.75rem;
      padding: 1rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      animation: slideIn 0.3s ease-out;
    }

    /* Form Actions */
    .form-actions {
      display: flex;
      gap: 0.75rem;
      padding-top: 1rem;
    }

    /* Animations */
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    /* Helper Classes */
    .hidden {
      display: none !important;
    }

    .inline-block {
      display: inline-block;
    }

    .mr-2 {
      margin-right: 0.5rem;
    }
  `;

  @property({ type: String }) sellerId = '';
  @property({ type: String }) sellerName = '';
  @property({ type: String }) sellerEmail = '';
  @state() private currentUser: any = null;
  
  @state() private myItems: Item[] = [];
  @state() private loading = true;
  @state() private showAddItem = false;
  @state() private showEditItem = false;
  @state() private editingItem: Item | null = null;
  @state() private showSuccess = false;
  @state() private successMessage = '';
  @state() private uploadingImage = false;
  @state() private currentPreviewIndex = 0;
  @state() private stats = {
    totalItems: 0,
    totalBids: 0,
    activeChats: 0,
    pendingSales: 0,
    totalRevenue: 0
  };

  @state() private newItem = {
    name: '',
    description: '',
    price: '',
    category: 'Electronics',
    condition: 'Good',
    location: 'Nairobi, Kenya',
    shipping: 'Local pickup only',
    tags: [] as string[],
    image: '',
    gallery: [] as string[]
  };

  @state() private currentTag = '';

  connectedCallback() {
    super.connectedCallback();
    this.loadCurrentUser();
    this.loadMyItems();
  }


  private loadCurrentUser() {
  // Try to get user from localStorage first
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    this.currentUser = JSON.parse(storedUser);
    this.sellerId = this.currentUser.id;
    this.sellerName = this.currentUser.name || this.currentUser.username;
    this.sellerEmail = this.currentUser.email;
  }
  
  // Also try to get from AuthService
  const authUser = AuthService.getCurrentUser();
  if (authUser) {
    this.currentUser = authUser;
    this.sellerId = authUser.id;
    this.sellerName = authUser.name || authUser.username;
    this.sellerEmail = authUser.email;
  }
  
  console.log('Seller info loaded:', {
    sellerId: this.sellerId,
    sellerName: this.sellerName,
    sellerEmail: this.sellerEmail
  });
}


  private async loadMyItems() {
    try {
      this.loading = true;
      const token = AuthService.getAccessToken();
      const response = await fetch('/api/items', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const allItems = await response.json();
      this.myItems = allItems.filter((item: Item) => item.sellerId === this.sellerId);
      await this.loadStats();
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      this.loading = false;
    }
  }


  private validateItem() {
    const errors: Record<string, string> = {};
    if (!this.newItem.name.trim()) errors.name = "Please enter a title for your item";
    if (this.newItem.name.length < 5) errors.name = "Title must be at least 5 characters";
    if (!this.newItem.description.trim()) errors.description = "Please describe your item";
    if (this.newItem.description.length < 20) errors.description = "Description must be at least 20 characters";
    if (!this.newItem.price) errors.price = "Please set a price";
    if (Number(this.newItem.price) <= 0) errors.price = "Price must be greater than 0";
    return errors;
  }

  private async handleImageUpload(e: Event) {
    const files = Array.from((e.target as HTMLInputElement).files || []);
    if (files.length + this.newItem.gallery.length > 10) {
      alert("Maximum 10 images allowed");
      return;
    }

    this.uploadingImage = true;
    this.requestUpdate();

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size must be less than 5MB");
        continue;
      }

      await new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          this.newItem.gallery = [...this.newItem.gallery, event.target?.result as string];
          if (!this.newItem.image) {
            this.newItem.image = event.target?.result as string;
          }
          this.requestUpdate();
          resolve();
        };
        reader.readAsDataURL(file);
      });
    }
    
    this.uploadingImage = false;
    this.requestUpdate();
  }

  private handleImageUrlAdd() {
    const url = prompt("Enter image URL:");
    if (url && url.trim()) {
      this.newItem.gallery = [...this.newItem.gallery, url.trim()];
      if (!this.newItem.image) {
        this.newItem.image = url.trim();
      }
      this.requestUpdate();
    }
  }

  private handleRemoveImage(index: number) {
    this.newItem.gallery = this.newItem.gallery.filter((_, i) => i !== index);
    if (this.currentPreviewIndex >= this.newItem.gallery.length - 1) {
      this.currentPreviewIndex = Math.max(0, this.newItem.gallery.length - 2);
    }
    if (this.newItem.gallery.length === 0) {
      this.newItem.image = '';
    } else if (this.newItem.image === this.newItem.gallery[index]) {
      this.newItem.image = this.newItem.gallery[0];
    }
    this.requestUpdate();
  }

  private handleAddTag() {
    if (this.currentTag.trim() && !this.newItem.tags.includes(this.currentTag.trim())) {
      this.newItem.tags = [...this.newItem.tags, this.currentTag.trim()];
      this.currentTag = "";
      this.requestUpdate();
    }
  }

  private handleRemoveTag(tag: string) {
    this.newItem.tags = this.newItem.tags.filter(t => t !== tag);
    this.requestUpdate();
  }

  private async loadStats() {
  try {
    const token = AuthService.getAccessToken();
    const response = await fetch(`/api/items/seller/${this.sellerId}/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.stats) {
        this.stats = {
          totalItems: data.stats.totalItems || 0,
          totalBids: data.stats.totalBids || 0,
          activeChats: data.stats.activeChats || 0,
          pendingSales: data.stats.pendingSales || 0,
          totalRevenue: data.stats.totalRevenue || 0
        };
      }
    }
  } catch (error) {
    console.error('Error loading stats:', error);
    // Fallback to local calculation
    this.stats.totalItems = this.myItems.length;
    this.stats.totalBids = this.myItems.reduce((sum, item) => sum + ((item as any).bidCount || 0), 0);
    this.stats.pendingSales = this.myItems.filter(item => 
      item.status === 'active' && ((item as any).bidCount || 0) > 0
    ).length;
    this.stats.totalRevenue = this.myItems
      .filter(item => item.status === 'sold')
      .reduce((sum, item) => sum + item.price, 0);
  }
}

private async createItem(e: Event) {
  e.preventDefault();
  const errors = this.validateItem();
  if (Object.keys(errors).length > 0) {
    alert(Object.values(errors).join('\n'));
    return;
  }

  // Ensure seller info is available
  if (!this.sellerId) {
    alert('Please log in again to list items');
    return;
  }

  const token = AuthService.getAccessToken();
  this.loading = true;
  
  try {
    const itemData = {
      name: this.newItem.name.trim(),
      description: this.newItem.description.trim(),
      price: parseFloat(this.newItem.price),
      image: this.newItem.gallery[0] || this.newItem.image || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
      gallery: this.newItem.gallery,
      category: this.newItem.category,
      condition: this.newItem.condition,
      location: this.newItem.location,
      shipping: this.newItem.shipping,
      tags: this.newItem.tags,
      sellerId: this.sellerId,  // Must be populated
      sellerName: this.sellerName,  // Must be populated
      sellerEmail: this.sellerEmail  // Must be populated
    };
    
    console.log('Creating item with data:', itemData);
    
    const response = await fetch('/api/items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(itemData)
    });

    if (response.ok) {
      this.showSuccessMessage('Item listed successfully!');
      this.showAddItem = false;
      this.resetForm();
      await this.loadMyItems();
      
      this.dispatchEvent(new CustomEvent('item-created', { 
        detail: { item: await response.json() },
        bubbles: true 
      }));
    } else {
      const error = await response.json();
      console.error('Server error:', error);
      alert(error.error || 'Failed to create item');
    }
  } catch (error) {
    console.error('Error creating item:', error);
    alert('Failed to create item. Please try again.');
  } finally {
    this.loading = false;
  }
}

  private async updateItem(e: Event) {
    e.preventDefault();
    if (!this.editingItem) return;

    const token = AuthService.getAccessToken();
    this.loading = true;
    
    try {
      const response = await fetch(`/api/items/${this.editingItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: this.newItem.name,
          description: this.newItem.description,
          price: parseFloat(this.newItem.price),
          image: this.newItem.gallery[0] || this.newItem.image,
          gallery: this.newItem.gallery,
          category: this.newItem.category,
          condition: this.newItem.condition,
          location: this.newItem.location,
          shipping: this.newItem.shipping,
          tags: this.newItem.tags
        })
      });

      if (response.ok) {
        this.showSuccessMessage('Item updated successfully!');
        this.showEditItem = false;
        this.editingItem = null;
        this.resetForm();
        await this.loadMyItems();
        
        this.dispatchEvent(new CustomEvent('item-updated', { 
          detail: { item: await response.json() },
          bubbles: true 
        }));
      } else {
        throw new Error('Failed to update item');
      }
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Failed to update item. Please try again.');
    } finally {
      this.loading = false;
    }
  }

  private async deleteItem(itemId: string) {
    if (confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      const token = AuthService.getAccessToken();
      try {
        const response = await fetch(`/api/items/${itemId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          this.showSuccessMessage('Item deleted successfully!');
          await this.loadMyItems();
          
          this.dispatchEvent(new CustomEvent('item-deleted', { 
            detail: { itemId },
            bubbles: true 
          }));
        }
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('Failed to delete item');
      }
    }
  }

  private editItem(item: Item) {
    this.editingItem = item;
    this.newItem = {
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: (item as any).category || 'Electronics',
      condition: (item as any).condition || 'Good',
      location: (item as any).location || 'Nairobi, Kenya',
      shipping: (item as any).shipping || 'Local pickup only',
      tags: (item as any).tags || [],
      image: item.image,
      gallery: (item as any).gallery || [item.image]
    };
    this.showEditItem = true;
    this.showAddItem = false;
    this.requestUpdate();
  }

  private resetForm() {
    this.newItem = {
      name: '',
      description: '',
      price: '',
      category: 'Electronics',
      condition: 'Good',
      location: 'Nairobi, Kenya',
      shipping: 'Local pickup only',
      tags: [],
      image: '',
      gallery: []
    };
    this.currentTag = '';
    this.currentPreviewIndex = 0;
  }

  private showSuccessMessage(message: string) {
    this.successMessage = message;
    this.showSuccess = true;
    setTimeout(() => {
      this.showSuccess = false;
    }, 3000);
  }

  private toggleAddItem() {
    this.showAddItem = !this.showAddItem;
    this.showEditItem = false;
    this.editingItem = null;
    this.resetForm();
    this.requestUpdate();
  }

  private formatPrice(price: number) {
    return 'KSh ' + price.toLocaleString('en-KE');
  }

  private getCategoryEmoji(categoryId: string) {
    const cat = CATEGORIES.find(c => c.id === categoryId);
    return cat?.emoji || '📦';
  }

  render() {
    return html`
      <div class="container">
        ${this.showSuccess ? html`
          <div class="toast">
            <span>✅</span>
            <span>${this.successMessage}</span>
          </div>
        ` : ''}

        <div class="max-width">
          <!-- Header -->
          <div class="header">
            <h1 class="title">Seller Dashboard</h1>
            <p class="subtitle">Manage your items, track sales, and connect with buyers</p>
          </div>

          <!-- Stats Grid -->
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-content">
                <div>
                  <p class="stat-label">Total Items</p>
                  <p class="stat-value">${this.stats.totalItems}</p>
                </div>
                <div class="stat-icon" style="background: #dbeafe;">📦</div>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-content">
                <div>
                  <p class="stat-label">Total Bids</p>
                  <p class="stat-value">${this.stats.totalBids}</p>
                </div>
                <div class="stat-icon" style="background: #d1fae5;">📈</div>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-content">
                <div>
                  <p class="stat-label">Active Chats</p>
                  <p class="stat-value">${this.stats.activeChats}</p>
                </div>
                <div class="stat-icon" style="background: #ede9fe;">💬</div>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-content">
                <div>
                  <p class="stat-label">Pending Sales</p>
                  <p class="stat-value stat-value-yellow">${this.stats.pendingSales}</p>
                </div>
                <div class="stat-icon" style="background: #fef3c7;">⏳</div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-content">
                <div>
                  <p class="stat-label">Total Revenue</p>
                  <p class="stat-value stat-value-green">${this.formatPrice(this.stats.totalRevenue)}</p>
                </div>
                <div class="stat-icon" style="background: #d1fae5;">💰</div>
              </div>
            </div>
          </div>

          <div class="action-bar">
  <h2 class="section-title">My Products</h2>
  <div class="flex gap-3">
    <a href="/seller/chats" class="btn-primary" style="background-color: #8B5CF6;">
      💬 View All Chats
    </a>
    <button @click=${this.toggleAddItem} class="btn-primary">
      <span>+</span>
      ${this.showAddItem ? 'Cancel' : 'Add New Item'}
    </button>
  </div>
</div>


          <!-- Add/Edit Item Form -->
          ${this.showAddItem || this.showEditItem ? html`
            <div class="form-container">
              <div class="form-header">
                <h3 class="form-title">${this.showEditItem ? '✏️ Edit Item' : '➕ List New Item'}</h3>
                <p class="form-subtitle">Fill in the details below to ${this.showEditItem ? 'update your' : 'create a new'} listing</p>
              </div>
              
              <form @submit=${this.showEditItem ? this.updateItem : this.createItem} class="form-body">
                <!-- Basic Info -->
                <div class="form-group">
                  <label class="form-label">Title <span class="required">*</span></label>
                  <input
                    .value=${this.newItem.name}
                    @input=${(e: Event) => this.newItem.name = (e.target as HTMLInputElement).value}
                    placeholder="e.g., MacBook Pro M2 2023 - 16GB RAM, 512GB SSD"
                    class="form-input"
                    required
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">Description <span class="required">*</span></label>
                  <textarea
                    .value=${this.newItem.description}
                    @input=${(e: Event) => this.newItem.description = (e.target as HTMLTextAreaElement).value}
                    placeholder="Describe your item in detail - condition, features, accessories included, history..."
                    rows="4"
                    class="form-textarea"
                    required
                  ></textarea>
                </div>

                <div class="grid-2">
                  <div class="form-group">
                    <label class="form-label">Category</label>
                    <select
                      .value=${this.newItem.category}
                      @change=${(e: Event) => this.newItem.category = (e.target as HTMLSelectElement).value}
                      class="form-select"
                    >
                      ${CATEGORIES.map(cat => html`
                        <option value=${cat.id}>${cat.emoji} ${cat.name}</option>
                      `)}
                    </select>
                  </div>

                  <div class="form-group">
                    <label class="form-label">Condition</label>
                    <select
                      .value=${this.newItem.condition}
                      @change=${(e: Event) => this.newItem.condition = (e.target as HTMLSelectElement).value}
                      class="form-select"
                    >
                      ${CONDITIONS.map(cond => html`
                        <option value=${cond.value}>${cond.label}</option>
                      `)}
                    </select>
                    <p style="font-size: 0.75rem; color: #9ca3af; margin-top: 0.25rem;">
                      ${CONDITIONS.find(c => c.value === this.newItem.condition)?.description}
                    </p>
                  </div>
                </div>

                <div class="grid-2">
                  <div class="form-group">
                    <label class="form-label">📍 Location</label>
                    <input
                      .value=${this.newItem.location}
                      @input=${(e: Event) => this.newItem.location = (e.target as HTMLInputElement).value}
                      class="form-input"
                    />
                  </div>

                  <div class="form-group">
                    <label class="form-label">🚚 Shipping</label>
                    <select
                      .value=${this.newItem.shipping}
                      @change=${(e: Event) => this.newItem.shipping = (e.target as HTMLSelectElement).value}
                      class="form-select"
                    >
                      ${SHIPPING_OPTIONS.map(option => html`
                        <option value=${option}>${option}</option>
                      `)}
                    </select>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Price (KSh) <span class="required">*</span></label>
                  <div class="price-input-wrapper">
                    <span class="price-prefix">KSh</span>
                    <input
                      type="number"
                      .value=${this.newItem.price}
                      @input=${(e: Event) => this.newItem.price = (e.target as HTMLInputElement).value}
                      placeholder="0"
                      class="price-input"
                      required
                    />
                  </div>
                </div>

                <!-- Photos -->
                <div class="form-group">
                  <label class="form-label">Photos (${this.newItem.gallery.length}/10)</label>
                  
                  <div class="upload-area" @click=${() => (this.renderRoot.querySelector('#file-upload') as HTMLInputElement)?.click()}>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      @change=${this.handleImageUpload}
                      style="display: none;"
                      id="file-upload"
                      ?disabled=${this.uploadingImage}
                    />
                    ${this.uploadingImage ? html`
                      <div style="padding: 2rem; text-align: center;">
                        <div class="spinner" style="margin: 0 auto 0.75rem;"></div>
                        <p style="color: #6b7280;">Uploading images...</p>
                      </div>
                    ` : html`
                      <div>
                        <div class="upload-icon">📸</div>
                        <p class="upload-text">Click or drag and drop to upload</p>
                        <p class="upload-hint">PNG, JPG up to 5MB each</p>
                      </div>
                    `}
                    <div class="upload-buttons">
                      <button
                        type="button"
                        @click=${(e: Event) => {
                          e.stopPropagation();
                          (this.renderRoot.querySelector('#file-upload') as HTMLInputElement)?.click();
                        }}
                        class="btn-upload"
                      >
                        Select Files
                      </button>
                      <button
                        type="button"
                        @click=${(e: Event) => {
                          e.stopPropagation();
                          this.handleImageUrlAdd();
                        }}
                        class="btn-url"
                      >
                        Add URL
                      </button>
                    </div>
                  </div>

                  ${this.newItem.gallery.length > 0 ? html`
                    <div class="gallery">
                      ${this.newItem.gallery.map((img, idx) => html`
                        <div class="gallery-item">
                          <img src=${img} alt="" class="gallery-image" />
                          <button type="button" @click=${() => this.handleRemoveImage(idx)} class="remove-image">✕</button>
                        </div>
                      `)}
                    </div>
                  ` : ''}
                </div>

                <!-- Tags -->
                <div class="form-group">
                  <label class="form-label">🏷️ Tags (optional)</label>
                  <div class="tag-input-wrapper">
                    <input
                      .value=${this.currentTag}
                      @input=${(e: Event) => this.currentTag = (e.target as HTMLInputElement).value}
                      @keypress=${(e: KeyboardEvent) => e.key === 'Enter' && this.handleAddTag()}
                      placeholder="Add tags like 'vintage', 'rare', 'collectible'"
                      class="tag-input"
                    />
                    <button type="button" @click=${this.handleAddTag} class="btn-primary" style="padding: 0.75rem 1rem;">+</button>
                  </div>
                  <div class="tag-list">
                    ${this.newItem.tags.map(tag => html`
                      <span class="tag">
                        #${tag}
                        <button type="button" @click=${() => this.handleRemoveTag(tag)} class="tag-remove">✕</button>
                      </span>
                    `)}
                  </div>
                </div>

                <div class="form-actions">
                  <button
                    type="button"
                    @click=${() => { this.showAddItem = false; this.showEditItem = false; this.resetForm(); }}
                    class="btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    ?disabled=${this.loading}
                    class="btn-primary"
                    style="flex: 1;"
                  >
                    ${this.loading ? html`
                      <span class="inline-block spinner" style="width: 1rem; height: 1rem; margin-right: 0.5rem;"></span>
                      ${this.showEditItem ? 'Updating...' : 'Creating...'}
                    ` : html`
                      ✅ ${this.showEditItem ? 'Update Item' : 'List Item'}
                    `}
                  </button>
                </div>
              </form>
            </div>
          ` : ''}

          <!-- Items Grid -->
          ${this.loading && !this.showAddItem ? html`
            <div class="spinner-container">
              <div class="spinner"></div>
            </div>
          ` : html`
            <div class="items-grid">
              ${this.myItems.map(item => html`
                <div class="item-card">
                  <div class="item-image-wrapper">
                    <img src="${item.image}" alt="${item.name}" class="item-image" />
                    ${(item as any).condition ? html`
                      <span class="item-badge">${(item as any).condition}</span>
                    ` : ''}
                    <span class="item-category">
                      ${this.getCategoryEmoji((item as any).category)}
                    </span>
                    ${item.status === 'sold' ? html`
                      <div class="sold-overlay">
                        <span class="sold-text">SOLD</span>
                      </div>
                    ` : ''}
                  </div>
                  
                  <div class="item-content">
                    <h3 class="item-title">${item.name}</h3>
                    <p class="item-description">${item.description}</p>
                    <div class="item-price-row">
                      <p class="item-price">${this.formatPrice(item.price)}</p>
                      <span class="item-status ${item.status === 'sold' ? 'status-sold' : 'status-active'}">
                        ${item.status || 'active'}
                      </span>
                    </div>
                    
                    ${(item as any).highestOffer ? html`
                      <div class="highest-bid">
                        Highest bid: ${this.formatPrice((item as any).highestOffer)}
                      </div>
                    ` : ''}
                    
                    <div class="item-actions">
                      <button @click=${() => this.editItem(item)} class="btn-secondary">
                        ✏️ Edit
                      </button>
                      <button @click=${() => this.deleteItem(item.id)} class="btn-danger">
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              `)}
            </div>
            
            ${this.myItems.length === 0 && !this.showAddItem && !this.loading ? html`
              <div class="empty-state">
                <div class="empty-icon">📦</div>
                <p class="empty-title">No items listed yet</p>
                <p class="empty-subtitle">Click "Add New Item" to start selling</p>
              </div>
            ` : ''}
          `}
        </div>
      </div>
    `;
  }
}