import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { Item } from '../types/index.js';
import { AuthService } from '../services/auth.js';

interface ChatMessage {
  id: string;
  itemId: string;
  senderId: string;
  senderName: string;
  type: 'message' | 'bid' | 'system' | 'winner_announcement';
  content?: string;
  bidAmount?: number;
  timestamp: string;
}

interface Bidder {
  userId: string;
  username: string;
  highestBid: number;
  bidCount: number;
}

@customElement('bid-drawer')
export class BidDrawer extends LitElement {
  static styles = css`
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    /* Drawer Overlay */
    .drawer-overlay {
      position: fixed;
      inset: 0;
      z-index: 50;
      overflow: hidden;
      transition: all 0.3s ease-in-out;
      visibility: hidden;
      opacity: 0;
    }

    .drawer-overlay.open {
      visibility: visible;
      opacity: 1;
    }

    .overlay-bg {
      position: absolute;
      inset: 0;
      background: black;
      transition: opacity 0.3s ease-in-out;
      opacity: 0;
    }

    .drawer-overlay.open .overlay-bg {
      opacity: 0.5;
    }

    /* Drawer Panel - 3/4 width from right */
    .drawer-panel {
      position: absolute;
      right: 0;
      top: 0;
      height: 100%;
      width: 75%;
      background: white;
      box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
      transition: transform 0.3s ease-in-out;
      transform: translateX(100%);
      display: flex;
      flex-direction: column;
    }

    .drawer-overlay.open .drawer-panel {
      transform: translateX(0);
    }

    /* Header */
    .drawer-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border-bottom: 1px solid #e5e7eb;
      background: #f9fafb;
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .drawer-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: #111827;
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .drawer-title.sold {
      color: #10b981;
    }

    .close-btn {
      background: transparent;
      border: none;
      color: #6b7280;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 0.5rem;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .close-btn:hover {
      color: #374151;
      background: #e5e7eb;
    }

    /* Content Container */
    .drawer-content {
      flex: 1;
      display: flex;
      overflow: hidden;
      min-height: 0;
    }

    /* Left Side - Item Details (1/3) */
    .item-details {
      width: 33.33%;
      overflow-y: auto;
      padding: 1rem;
      border-right: 1px solid #e5e7eb;
      background: #f9fafb;
    }

    /* Custom Scrollbar */
    .item-details::-webkit-scrollbar,
    .chat-messages::-webkit-scrollbar {
      width: 6px;
    }

    .item-details::-webkit-scrollbar-track,
    .chat-messages::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 3px;
    }

    .item-details::-webkit-scrollbar-thumb,
    .chat-messages::-webkit-scrollbar-thumb {
      background: #888;
      border-radius: 3px;
    }

    .item-details::-webkit-scrollbar-thumb:hover,
    .chat-messages::-webkit-scrollbar-thumb:hover {
      background: #555;
    }

    .item-image {
      width: 100%;
      height: 8rem;
      object-fit: cover;
      border-radius: 0.5rem;
      margin-bottom: 0.75rem;
    }

    .item-name {
      font-size: 0.875rem;
      font-weight: 600;
      color: #111827;
      margin-bottom: 0.25rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .price-section {
      margin-bottom: 0.75rem;
    }

    .starting-price {
      font-size: 1.25rem;
      font-weight: 700;
      color: #2563eb;
    }

    .price-label {
      font-size: 0.75rem;
      color: #6b7280;
      margin-left: 0.25rem;
    }

    .seller-info {
      margin-bottom: 0.75rem;
      font-size: 0.75rem;
      color: #6b7280;
    }

    .seller-row {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      margin-bottom: 0.25rem;
    }

    .icon-small {
      width: 0.75rem;
      height: 0.75rem;
    }

    .description {
      margin-bottom: 1rem;
    }

    .description-text {
      font-size: 0.75rem;
      color: #4b5563;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    /* Bid Chips */
    .bids-section {
      padding-top: 0.75rem;
      border-top: 1px solid #e5e7eb;
    }

    .bids-label {
      display: block;
      font-size: 0.75rem;
      font-weight: 500;
      color: #374151;
      margin-bottom: 0.5rem;
    }

    .bids-list {
      max-height: 12rem;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .bid-chip {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      padding: 0.5rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .bid-chip:hover {
      border-color: #10b981;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .bid-chip-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .bidder-name {
      font-weight: 600;
      font-size: 0.875rem;
      color: #111827;
    }

    .bid-count {
      font-size: 0.75rem;
      color: #6b7280;
    }

    .bid-amount {
      text-align: right;
    }

    .bid-amount-value {
      font-weight: 700;
      font-size: 0.875rem;
      color: #10b981;
    }

    .bid-amount-label {
      font-size: 0.75rem;
      color: #9ca3af;
    }

    /* Bid Input */
    .bid-input-section {
      padding-top: 0.75rem;
      border-top: 1px solid #e5e7eb;
    }

    .bid-label {
      display: block;
      font-size: 0.75rem;
      font-weight: 500;
      color: #374151;
      margin-bottom: 0.5rem;
    }

    .bid-form {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .bid-input {
      width: 100%;
      padding: 0.5rem 0.75rem;
      font-size: 0.875rem;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      transition: all 0.2s;
    }

    .bid-input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
    }

    .bid-input:disabled {
      background: #f3f4f6;
      cursor: not-allowed;
    }

    .bid-btn {
      width: 100%;
      background: #16a34a;
      color: white;
      padding: 0.5rem 0.75rem;
      font-size: 0.875rem;
      border: none;
      border-radius: 0.5rem;
      cursor: pointer;
      transition: background 0.2s;
    }

    .bid-btn:hover:not(:disabled) {
      background: #15803d;
    }

    .bid-btn:disabled {
      background: #9ca3af;
      cursor: not-allowed;
    }

    /* Sold Badge */
    .sold-badge {
      margin-top: 1rem;
      padding: 0.75rem;
      background: #d1fae5;
      border: 1px solid #6ee7b7;
      border-radius: 0.5rem;
      text-align: center;
    }

    .sold-title {
      color: #065f46;
      font-weight: 600;
      font-size: 0.875rem;
    }

    .sold-text {
      font-size: 0.75rem;
      color: #047857;
      margin-top: 0.25rem;
    }

    /* Right Side - Chat (2/3) */
    .chat-section {
      width: 66.67%;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: white;
    }

    .chat-header {
      padding: 0.75rem;
      background: #f9fafb;
      border-bottom: 1px solid #e5e7eb;
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .chat-header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .chat-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .chat-icon {
      width: 1.25rem;
      height: 1.25rem;
      color: #4b5563;
    }

    .chat-label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
    }

    .status-badge {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.75rem;
    }

    .status-dot {
      display: inline-block;
      width: 0.5rem;
      height: 0.5rem;
      border-radius: 50%;
    }

    .status-dot.connected {
      background: #16a34a;
    }

    .status-dot.connecting {
      background: #ca8a04;
      animation: pulse 1s infinite;
    }

    .status-text.connected {
      color: #16a34a;
    }

    .status-text.connecting {
      color: #ca8a04;
    }

    /* Chat Messages */
    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      background: #f9fafb;
    }

    .empty-chat {
      text-align: center;
      color: #6b7280;
      font-size: 0.875rem;
      padding: 3rem 0;
    }

    .empty-emoji {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
    }

    .empty-title {
      margin-bottom: 0.25rem;
    }

    .empty-hint {
      font-size: 0.75rem;
    }

    .message-wrapper {
      animation: fadeInUp 0.2s ease-out;
    }

    .message-left {
      text-align: left;
    }

    .message-right {
      text-align: right;
    }

    .message-bubble {
      display: inline-block;
      max-width: 85%;
    }

    .message-meta {
      font-size: 0.75rem;
      color: #6b7280;
      margin-bottom: 0.25rem;
    }

    .message-content {
      border-radius: 0.5rem;
      padding: 0.5rem 0.75rem;
      word-break: break-word;
      font-size: 0.875rem;
    }

    .message-content.sent {
      background: #2563eb;
      color: white;
    }

    .message-content.received {
      background: white;
      color: #374151;
      border: 1px solid #e5e7eb;
    }

    .message-content.system {
      background: linear-gradient(135deg, #fbbf24, #f97316);
      color: white;
      font-weight: 700;
    }

    .bid-content {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    /* Chat Input */
    .chat-input-container {
      padding: 0.75rem;
      background: white;
      border-top: 1px solid #e5e7eb;
    }

    .chat-form {
      display: flex;
      gap: 0.5rem;
    }

    .chat-input {
      flex: 1;
      padding: 0.5rem 0.75rem;
      font-size: 0.875rem;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      transition: all 0.2s;
    }

    .chat-input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
    }

    .chat-input:disabled {
      background: #f3f4f6;
      cursor: not-allowed;
    }

    .send-btn {
      background: #2563eb;
      color: white;
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
      border: none;
      border-radius: 0.5rem;
      cursor: pointer;
      transition: background 0.2s;
    }

    .send-btn:hover:not(:disabled) {
      background: #1d4ed8;
    }

    .send-btn:disabled {
      background: #9ca3af;
      cursor: not-allowed;
    }

    /* Confirmation Panel */
    .confirmation-panel {
      border-top: 1px solid #e5e7eb;
      background: #fef3c7;
      padding: 1rem;
      animation: fadeInUp 0.2s ease-out;
    }

    .confirmation-content {
      display: flex;
      gap: 0.75rem;
    }

    .confirmation-icon {
      flex-shrink: 0;
    }

    .icon-circle {
      width: 2.5rem;
      height: 2.5rem;
      background: #fef08a;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
    }

    .confirmation-text {
      flex: 1;
    }

    .confirmation-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: #854d0e;
      margin-bottom: 0.25rem;
    }

    .confirmation-message {
      font-size: 0.875rem;
      color: #854d0e;
      margin-bottom: 0.75rem;
    }

    .confirmation-warning {
      font-size: 0.75rem;
      color: #a16207;
      margin-bottom: 1rem;
    }

    .confirmation-actions {
      display: flex;
      gap: 0.75rem;
    }

    .cancel-btn {
      flex: 1;
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      background: white;
      cursor: pointer;
      transition: background 0.2s;
    }

    .cancel-btn:hover {
      background: #f9fafb;
    }

    .confirm-btn {
      flex: 1;
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
      background: #16a34a;
      color: white;
      border: none;
      border-radius: 0.5rem;
      cursor: pointer;
      transition: background 0.2s;
    }

    .confirm-btn:hover {
      background: #15803d;
    }

    .close-confirm-btn {
      flex-shrink: 0;
      background: transparent;
      border: none;
      color: #9ca3af;
      cursor: pointer;
      padding: 0.25rem;
    }

    .close-confirm-btn:hover {
      color: #6b7280;
    }

    /* Animations */
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    /* Helper Classes */
    .hidden {
      display: none;
    }

    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .line-clamp-3 {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `;

  @property({ type: Object }) item!: Item;
  @property({ type: Boolean }) isOpen = false;
  @state() private messages: ChatMessage[] = [];
  @state() private user: any = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;
  @state() private newMessage = '';
  @state() private bidAmount = '';
  @state() private isConnecting = true;
  @state() private ws: WebSocket | null = null;
  @state() private isAnimating = false;
  @state() private selectedWinner: Bidder | null = null;
  @state() private bidders: Bidder[] = [];
  @state() private itemSold = false;
  @state() private showConfirmation = false;

  private currentUser = AuthService.getCurrentUser();

  connectedCallback() {
    super.connectedCallback();
    if (this.isOpen) {
      this.connectWebSocket();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.ws) {
      this.ws.close();
    }
  }

  updated(changedProperties: Map<string, any>) {
    if (changedProperties.has('isOpen') && this.isOpen) {
      this.connectWebSocket();
      setTimeout(() => this.scrollToBottom(), 200);
    }
  }

  private connectWebSocket() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return;
    
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.host}/ws?itemId=${this.item.id}&userId=${this.currentUser?.id}`;
    
    this.ws = new WebSocket(wsUrl);
    this.isConnecting = true;
    
    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.isConnecting = false;
    };
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'history') {
        console.log(`Received ${data.messages.length} historical messages`);
        this.messages = data.messages;
        this.updateBiddersList();
      } else if (data.type === 'winner_announcement') {
        this.messages = [...this.messages, data];
        this.itemSold = true;
        this.updateItemSoldStatus();
        this.showConfirmation = false;
        this.selectedWinner = null;
        setTimeout(() => {
          this.closeDrawer();
        }, 3000);
      } else if (data.type !== 'system') {
        this.messages = [...this.messages, data];
        this.updateBiddersList();
      }
      
      this.requestUpdate();
      setTimeout(() => this.scrollToBottom(), 100);
    };
    
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.isConnecting = false;
    };
    
    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.isConnecting = false;
      setTimeout(() => {
        if (this.isOpen && !this.itemSold) this.connectWebSocket();
      }, 3000);
    };
  }

  private updateBiddersList() {
    const bidderMap = new Map<string, Bidder>();
    
    this.messages.forEach(msg => {
      if (msg.type === 'bid' && msg.bidAmount) {
        const existing = bidderMap.get(msg.senderId);
        if (!existing || (msg.bidAmount && msg.bidAmount > existing.highestBid)) {
          bidderMap.set(msg.senderId, {
            userId: msg.senderId,
            username: msg.senderName,
            highestBid: msg.bidAmount,
            bidCount: (existing?.bidCount || 0) + 1
          });
        } else if (existing) {
          existing.bidCount++;
        }
      }
    });
    
    this.bidders = Array.from(bidderMap.values()).sort((a, b) => b.highestBid - a.highestBid);
  }

  private sendMessage() {
    if (!this.newMessage.trim() || !this.ws || this.ws.readyState !== WebSocket.OPEN || this.itemSold) return;
    
    const message = {
      type: 'message' as const,
      itemId: this.item.id,
      senderId: this.currentUser?.id,
      senderName: this.currentUser?.username,
      content: this.newMessage,
      timestamp: new Date().toISOString()
    };
    
    this.ws.send(JSON.stringify(message));
    this.newMessage = '';
  }

  private sendBid() {
    if (this.itemSold) {
      alert('This item has already been sold!');
      return;
    }
    
    const amount = parseFloat(this.bidAmount);
    if (isNaN(amount) || amount <= 0 || !this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    
    const bidMessage = {
      type: 'bid' as const,
      itemId: this.item.id,
      senderId: this.currentUser?.id,
      senderName: this.currentUser?.username,
      bidAmount: amount,
      timestamp: new Date().toISOString()
    };
    
    this.ws.send(JSON.stringify(bidMessage));
    this.bidAmount = '';
  }

  private selectWinner(winner: Bidder) {
    this.selectedWinner = winner;
    this.showConfirmation = true;
  }

  private cancelConfirmation() {
    this.showConfirmation = false;
    this.selectedWinner = null;
  }

  private confirmSale() {
    if (!this.selectedWinner || !this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    
    const winnerMessage = {
      type: 'winner_announcement' as const,
      itemId: this.item.id,
      winnerId: this.selectedWinner.userId,
      winnerName: this.selectedWinner.username,
      winningBid: this.selectedWinner.highestBid,
      timestamp: new Date().toISOString(),
      content: `🎉 Winner announced! ${this.selectedWinner.username} won with a bid of KSh ${this.selectedWinner.highestBid.toLocaleString()}! 🎉`
    };
    
    this.ws.send(JSON.stringify(winnerMessage));
    this.showConfirmation = false;
    this.itemSold = true;
    
    this.dispatchEvent(new CustomEvent('item-sold', { 
      detail: { 
        itemId: this.item.id, 
        winner: this.selectedWinner,
        winningBid: this.selectedWinner.highestBid
      }, 
      bubbles: true, 
      composed: true 
    }));
  }

  private updateItemSoldStatus() {
    fetch(`/api/items/${this.item.id}/confirm-sale`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
    }).catch(error => console.error('Error updating item status:', error));
  }

  private scrollToBottom() {
    const chatContainer = this.shadowRoot?.querySelector('.chat-messages');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }

  private closeDrawer() {
    this.isOpen = false;
    this.showConfirmation = false;
    this.selectedWinner = null;
    this.dispatchEvent(new CustomEvent('drawer-closed', { bubbles: true, composed: true }));
  }

  render() {
    const isSeller = this.item.sellerName === this.currentUser?.username;
    const hasBids = this.bidders.length > 0;

    return html`
      <div class="drawer-overlay ${this.isOpen ? 'open' : ''}">
        <div class="overlay-bg" @click=${this.closeDrawer}></div>
        
        <div class="drawer-panel">
          <!-- Header -->
          <div class="drawer-header">
            <h2 class="drawer-title ${this.itemSold ? 'sold' : ''}">
              ${this.itemSold ? '🏆 Item Sold!' : '💰 Bid on ' + this.item.name}
            </h2>
            <button @click=${this.closeDrawer} class="close-btn" aria-label="Close drawer">
              <svg class="icon-small" style="width: 1.5rem; height: 1.5rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <!-- Content -->
          <div class="drawer-content">
            <!-- Left Side - Item Details -->
            <div class="item-details">
              <img src="${this.item.image}" alt="${this.item.name}" class="item-image">
              
              <h3 class="item-name">${this.item.name}</h3>
              
              <div class="price-section">
                <span class="starting-price">KSh ${this.item.price.toLocaleString()}</span>
                <span class="price-label">Starting bid</span>
              </div>
              
              <div class="seller-info">
                <div class="seller-row">
                  <svg class="icon-small" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  <span><strong>Seller:</strong> ${this.item.sellerName}</span>
                </div>
                <div class="seller-row">
                  <svg class="icon-small" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"></path>
                  </svg>
                  <span><strong>ID:</strong> ${this.item.id.slice(0, 8)}...</span>
                </div>
              </div>
              
              <div class="description">
                <p class="description-text">${this.item.description}</p>
              </div>
              
              <!-- Bid Chips for Seller -->
              ${isSeller && !this.itemSold && hasBids ? html`
                <div class="bids-section">
                  <label class="bids-label">🏆 Select Winning Bid:</label>
                  <div class="bids-list">
                    ${this.bidders.map(bidder => html`
                      <div @click=${() => this.selectWinner(bidder)} class="bid-chip">
                        <div class="bid-chip-content">
                          <div>
                            <div class="bidder-name">${bidder.username}</div>
                            <div class="bid-count">${bidder.bidCount} bid${bidder.bidCount !== 1 ? 's' : ''}</div>
                          </div>
                          <div class="bid-amount">
                            <div class="bid-amount-value">KSh ${bidder.highestBid.toLocaleString()}</div>
                            <div class="bid-amount-label">Highest bid</div>
                          </div>
                        </div>
                      </div>
                    `)}
                  </div>
                </div>
              ` : ''}
              
              <!-- Bid Input for Buyers -->
              ${!isSeller && !this.itemSold ? html`
                <div class="bid-input-section">
                  <label class="bid-label">Your Bid (KSh)</label>
                  <div class="bid-form">
                    <input 
                      type="number" 
                      .value=${this.bidAmount}
                      @input=${(e: Event) => this.bidAmount = (e.target as HTMLInputElement).value}
                      placeholder="Enter amount"
                      class="bid-input"
                      ?disabled=${this.isConnecting || this.itemSold}
                    >
                    <button 
                      @click=${this.sendBid}
                      class="bid-btn"
                      ?disabled=${this.isConnecting || !this.bidAmount || this.itemSold}
                    >
                      💰 Place Bid
                    </button>
                  </div>
                </div>
              ` : ''}
              
              <!-- Sold Badge -->
              ${this.itemSold ? html`
                <div class="sold-badge">
                  <div class="sold-title">✓ Item Sold!</div>
                  <div class="sold-text">Thank you for participating</div>
                </div>
              ` : ''}
            </div>
            
            <!-- Right Side - Chat -->
            <div class="chat-section">
              <div class="chat-header">
                <div class="chat-header-content">
                  <div class="chat-info">
                    <svg class="chat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                    </svg>
                    <span class="chat-label">Chat with ${!isSeller ? this.item.sellerName : "buyers"}</span>
                  </div>
                  ${this.itemSold ? html`
                    <div class="status-badge">
                      <span class="status-dot connected"></span>
                      <span class="status-text connected">Auction Ended</span>
                    </div>
                  ` : (this.isConnecting ? html`
                    <div class="status-badge">
                      <span class="status-dot connecting"></span>
                      <span class="status-text connecting">Connecting...</span>
                    </div>
                  ` : html`
                    <div class="status-badge">
                      <span class="status-dot connected"></span>
                      <span class="status-text connected">Connected</span>
                    </div>
                  `)}
                </div>
              </div>
              
              <div class="chat-messages">
                ${this.messages.length === 0 ? html`
                  <div class="empty-chat">
                    <div class="empty-emoji">💬</div>
                    <p class="empty-title">No messages yet.</p>
                    <p class="empty-hint">Start a conversation about this item!</p>
                  </div>
                ` : ''}
                
                ${this.messages.map((msg) => html`
                  <div class="message-wrapper">
                    <div class="${msg.senderId === this.currentUser?.id ? 'message-right' : 'message-left'}">
                      <div class="message-bubble">
                        <div class="message-meta">
                          ${msg.type === 'winner_announcement' ? '🏆 System' : msg.senderName} • ${new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div class="message-content ${msg.type === 'winner_announcement' ? 'system' : (msg.senderId === this.currentUser?.id ? 'sent' : 'received')}">
                          ${msg.type === 'bid' ? html`
                            <div class="bid-content">
                              <span>💰</span>
                              <span><strong>Bid placed: KSh ${msg.bidAmount?.toLocaleString()}</strong></span>
                            </div>
                          ` : msg.type === 'winner_announcement' ? html`
                            <div class="bid-content">
                              <span>🏆</span>
                              <span><strong>${msg.content}</strong></span>
                            </div>
                          ` : html`
                            ${msg.content}
                          `}
                        </div>
                      </div>
                    </div>
                  </div>
                `)}
              </div>
              
              <div class="chat-input-container">
                <div class="chat-form">
                  <input 
                    type="text" 
                    .value=${this.newMessage}
                    @input=${(e: Event) => this.newMessage = (e.target as HTMLInputElement).value}
                    @keypress=${(e: KeyboardEvent) => e.key === 'Enter' && !this.itemSold && this.sendMessage()}
                    placeholder=${this.itemSold ? "Auction has ended" : "Type your message..."}
                    class="chat-input"
                    ?disabled=${this.isConnecting || this.itemSold}
                  >
                  <button 
                    @click=${this.sendMessage}
                    class="send-btn"
                    ?disabled=${this.isConnecting || !this.newMessage.trim() || this.itemSold}
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Confirmation Panel -->
          ${this.showConfirmation && this.selectedWinner ? html`
            <div class="confirmation-panel">
              <div class="confirmation-content">
                <div class="confirmation-icon">
                  <div class="icon-circle">⚠️</div>
                </div>
                <div class="confirmation-text">
                  <h4 class="confirmation-title">Confirm Sale</h4>
                  <p class="confirmation-message">
                    Sell <strong>${this.item.name}</strong> to <strong>${this.selectedWinner.username}</strong> for 
                    <strong>KSh ${this.selectedWinner.highestBid.toLocaleString()}</strong>?
                  </p>
                  <p class="confirmation-warning">
                    ⚠️ This action cannot be undone. The auction will be closed immediately.
                  </p>
                  <div class="confirmation-actions">
                    <button @click=${this.cancelConfirmation} class="cancel-btn">Cancel</button>
                    <button @click=${this.confirmSale} class="confirm-btn">Confirm Sale</button>
                  </div>
                </div>
                <button @click=${this.cancelConfirmation} class="close-confirm-btn">
                  <svg class="icon-small" style="width: 1.25rem; height: 1.25rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }
}