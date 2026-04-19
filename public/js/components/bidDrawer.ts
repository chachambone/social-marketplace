import { LitElement, css, html, unsafeCSS } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { Item } from '../types/index.js';
import { AuthService } from '../services/auth.js';
import { tailwindCSS } from '../styles.js';

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
  static styles = [unsafeCSS(tailwindCSS), css`
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
    .animate-fade-in-up {
      animation: fadeInUp 0.2s ease-out;
    }
    
    /* Custom scrollbar */
    .chat-messages::-webkit-scrollbar {
      width: 6px;
    }
    
    .chat-messages::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 3px;
    }
    
    .chat-messages::-webkit-scrollbar-thumb {
      background: #888;
      border-radius: 3px;
    }
    
    .chat-messages::-webkit-scrollbar-thumb:hover {
      background: #555;
    }
  `];

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
        // Close confirmation panel after announcement
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
  // Use the existing confirm-sale endpoint instead of /sold
  fetch(`/api/items/${this.item.id}/confirm-sale`, {
    method: 'POST',  // Changed from PUT to POST
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    // The confirm-sale endpoint doesn't require a body
  }).catch(error => console.error('Error updating item status:', error));
}

  private scrollToBottom() {
    const chatContainer = this.shadowRoot?.querySelector('.chat-messages');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }

  private closeDrawer() {
    this.isAnimating = true;
    setTimeout(() => {
      this.isOpen = false;
      this.isAnimating = false;
      this.showConfirmation = false; // Reset confirmation state
      this.selectedWinner = null;
      this.dispatchEvent(new CustomEvent('drawer-closed', { bubbles: true, composed: true }));
      // Don't close WebSocket here - keep it connected
      // if (this.ws) {
      //   this.ws.close();
      // }
    }, 300);
  }

  render() {
    const isSeller = this.item.sellerName === this.currentUser?.username;
    const hasBids = this.bidders.length > 0;

    return html`
      <!-- Drawer with smooth slide-in transition - 3/4 width from right -->
      <div 
        class="fixed inset-0 z-50 overflow-hidden transition-all duration-300 ease-in-out"
        style="visibility: ${this.isOpen ? 'visible' : 'hidden'}; opacity: ${this.isOpen ? '1' : '0'};"
      >
        <!-- Overlay with fade effect -->
        <div 
          class="absolute inset-0 bg-black transition-opacity duration-300 ease-in-out"
          style="opacity: ${this.isOpen ? '0.5' : '0'};"
          @click=${this.closeDrawer}
        ></div>
        
        <!-- Drawer panel - slides in from right, 3/4 width -->
        <div 
          class="absolute right-0 top-0 h-full w-3/4 bg-white shadow-2xl transition-transform duration-300 ease-in-out flex flex-col"
          style="transform: translateX(${this.isOpen ? '0%' : '100%'});"
        >
          <!-- Header with X button -->
          <div class="flex justify-between items-center p-4 border-b bg-gray-50 sticky top-0 z-10">
            <h2 class="text-xl font-bold text-gray-800 truncate flex-1">
              ${this.itemSold ? '🏆 Item Sold!' : '💰 Bid on ' + this.item.name}
            </h2>
            <button 
              @click=${this.closeDrawer} 
              class="text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg p-2 transition-all duration-200 ml-2"
              aria-label="Close drawer"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <!-- Content: Left 1/3 Details + Right 2/3 Chat -->
          <div class="flex-1 flex overflow-hidden flex-row min-h-0">
            <!-- Left Side - Item Details (1/3 of drawer width) -->
            <div class="w-1/3 overflow-y-auto p-4 border-r bg-gray-50">
              <!-- Product Image -->
              <img src="${this.item.image}" alt="${this.item.name}" class="w-full h-32 object-cover rounded-lg mb-3">
              
              <!-- Product Title -->
              <h3 class="text-md font-semibold text-gray-800 mb-1 line-clamp-2">${this.item.name}</h3>
              
              <!-- Price -->
              <div class="mb-3">
                <span class="text-xl font-bold text-blue-600">KSh ${this.item.price.toLocaleString()}</span>
                <span class="text-xs text-gray-500 ml-1">Starting bid</span>
              </div>
              
              <!-- Seller Info -->
              <div class="mb-3 text-xs text-gray-500">
                <div class="flex items-center gap-1 mb-1">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  <span class="font-medium">Seller:</span> ${this.item.sellerName}
                </div>
                <div class="flex items-center gap-1">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"></path>
                  </svg>
                  <span class="font-medium">ID:</span> ${this.item.id.slice(0, 8)}...
                </div>
              </div>
              
              <!-- Description -->
              <div class="mb-4">
                <p class="text-xs text-gray-600 line-clamp-3">${this.item.description}</p>
              </div>
              
              <!-- Bid Chips Section - Only for sellers -->
              ${isSeller && !this.itemSold && hasBids ? html`
                <div class="pt-3 border-t">
                  <label class="block text-xs font-medium text-gray-700 mb-2">🏆 Select Winning Bid:</label>
                  <div class="space-y-2 max-h-48 overflow-y-auto">
                    ${this.bidders.map(bidder => html`
                      <div 
                        @click=${() => this.selectWinner(bidder)}
                        class="bid-chip bg-white border border-gray-200 rounded-lg p-2 cursor-pointer hover:border-green-500 hover:shadow-md transition-all duration-200"
                      >
                        <div class="flex justify-between items-center">
                          <div>
                            <div class="font-semibold text-sm text-gray-800">${bidder.username}</div>
                            <div class="text-xs text-gray-500">${bidder.bidCount} bid${bidder.bidCount !== 1 ? 's' : ''}</div>
                          </div>
                          <div class="text-right">
                            <div class="font-bold text-green-600 text-sm">KSh ${bidder.highestBid.toLocaleString()}</div>
                            <div class="text-xs text-gray-400">Highest bid</div>
                          </div>
                        </div>
                      </div>
                    `)}
                  </div>
                </div>
              ` : ''}
              
              <!-- Bid Input Section - Only for buyers when item not sold -->
              ${!isSeller && !this.itemSold ? html`
                <div class="pt-3 border-t">
                  <label class="block text-xs font-medium text-gray-700 mb-2">Your Bid (KSh)</label>
                  <div class="flex flex-col gap-2">
                    <input 
                      type="number" 
                      .value=${this.bidAmount}
                      @input=${(e: Event) => this.bidAmount = (e.target as HTMLInputElement).value}
                      placeholder="Enter amount"
                      class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      ?disabled=${this.isConnecting || this.itemSold}
                    >
                    <button 
                      @click=${this.sendBid}
                      class="w-full bg-green-600 text-white px-3 py-2 text-sm rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
                      ?disabled=${this.isConnecting || !this.bidAmount || this.itemSold}
                    >
                      💰 Place Bid
                    </button>
                  </div>
                </div>
              ` : ''}
              
              <!-- Sold Badge -->
              ${this.itemSold ? html`
                <div class="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg text-center">
                  <div class="text-green-700 font-semibold text-sm">✓ Item Sold!</div>
                  <div class="text-xs text-green-600 mt-1">Thank you for participating</div>
                </div>
              ` : ''}
            </div>
            
            <!-- Right Side - Chat (2/3 of drawer width) -->
            <div class="w-2/3 flex flex-col overflow-hidden bg-white">
              <!-- Chat Header -->
              <div class="p-3 bg-gray-50 border-b sticky top-0 z-10">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                    </svg>
                    <span class="text-sm font-medium text-gray-700">Chat with ${!isSeller ? this.item.sellerName : "buyers"}</span>
                  </div>
                  ${this.itemSold ? html`
                    <span class="text-xs text-green-600 flex items-center gap-1">
                      <span class="inline-block w-2 h-2 bg-green-600 rounded-full"></span>
                      Auction Ended
                    </span>
                  ` : (this.isConnecting ? html`
                    <span class="text-xs text-yellow-600 flex items-center gap-1">
                      <span class="inline-block w-2 h-2 bg-yellow-600 rounded-full animate-pulse"></span>
                      Connecting...
                    </span>
                  ` : html`
                    <span class="text-xs text-green-600 flex items-center gap-1">
                      <span class="inline-block w-2 h-2 bg-green-600 rounded-full"></span>
                      Connected
                    </span>
                  `)}
                </div>
              </div>
              
              <!-- Chat Messages -->
              <div class="chat-messages flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                ${this.messages.length === 0 ? html`
                  <div class="text-center text-gray-500 text-sm py-12">
                    <div class="text-4xl mb-2">💬</div>
                    <p>No messages yet.</p>
                    <p class="text-xs mt-1">Start a conversation about this item!</p>
                  </div>
                ` : ''}
                
                ${this.messages.map((msg) => html`
                  <div key=${msg.id} class="animate-fade-in-up">
                    <div class="${msg.senderId === this.currentUser?.id ? 'text-right' : 'text-left'}">
                      <div class="inline-block max-w-[85%]">
                        <div class="text-xs text-gray-500 mb-1">
                          ${msg.type === 'winner_announcement' ? '🏆 System' : msg.senderName} • ${new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div class="${msg.type === 'winner_announcement' 
                          ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold'
                          : (msg.senderId === this.currentUser?.id 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-white text-gray-800 shadow-sm border')} rounded-lg px-3 py-2 break-words text-sm">
                          ${msg.type === 'bid' ? html`
                            <div class="flex items-center gap-1">
                              <span>💰</span>
                              <span class="font-bold">Bid placed: KSh ${msg.bidAmount?.toLocaleString()}</span>
                            </div>
                          ` : msg.type === 'winner_announcement' ? html`
                            <div class="flex items-center gap-2">
                              <span>🏆</span>
                              <span class="font-bold">${msg.content}</span>
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
              
              <!-- Chat Input - Disabled when item is sold -->
              <div class="p-3 bg-white border-t">
                <div class="flex gap-2">
                  <input 
                    type="text" 
                    .value=${this.newMessage}
                    @input=${(e: Event) => this.newMessage = (e.target as HTMLInputElement).value}
                    @keypress=${(e: KeyboardEvent) => e.key === 'Enter' && !this.itemSold && this.sendMessage()}
                    placeholder=${this.itemSold ? "Auction has ended" : "Type your message..."}
                    class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    ?disabled=${this.isConnecting || this.itemSold}
                  >
                  <button 
                    @click=${this.sendMessage}
                    class="bg-blue-600 text-white px-4 py-2 text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                    ?disabled=${this.isConnecting || !this.newMessage.trim() || this.itemSold}
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Confirmation Panel - Inside Drawer (Shows when seller selects a winner) -->
          ${this.showConfirmation && this.selectedWinner ? html`
            <div class="border-t bg-yellow-50 p-4 animate-fade-in-up">
              <div class="flex items-start gap-3">
                <div class="flex-shrink-0">
                  <div class="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span class="text-xl">⚠️</span>
                  </div>
                </div>
                <div class="flex-1">
                  <h4 class="text-sm font-semibold text-yellow-800 mb-1">Confirm Sale</h4>
                  <p class="text-sm text-yellow-700 mb-3">
                    Sell <strong>${this.item.name}</strong> to <strong>${this.selectedWinner.username}</strong> for 
                    <strong class="text-green-600">KSh ${this.selectedWinner.highestBid.toLocaleString()}</strong>?
                  </p>
                  <p class="text-xs text-yellow-600 mb-4">
                    ⚠️ This action cannot be undone. The auction will be closed immediately.
                  </p>
                  <div class="flex gap-3">
                    <button 
                      @click=${this.cancelConfirmation}
                      class="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors bg-white"
                    >
                      Cancel
                    </button>
                    <button 
                      @click=${this.confirmSale}
                      class="flex-1 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Confirm Sale
                    </button>
                  </div>
                </div>
                <button 
                  @click=${this.cancelConfirmation}
                  class="flex-shrink-0 text-gray-400 hover:text-gray-600"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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