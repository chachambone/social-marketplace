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
  type: 'message' | 'bid';
  content?: string;
  bidAmount?: number;
  timestamp: string;
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
  `];

  @property({ type: Object }) item!: Item;
  @property({ type: Boolean }) isOpen = false;
  @state() private messages: ChatMessage[] = [];
  @state() private newMessage = '';
  @state() private bidAmount = '';
  @state() private isConnecting = true;
  @state() private ws: WebSocket | null = null;
  @state() private isAnimating = false;

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
      
      // Handle message history
      if (data.type === 'history') {
        console.log(`Received ${data.messages.length} historical messages`);
        this.messages = data.messages;
      } else if (data.type !== 'system') {
        this.messages = [...this.messages, data];
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
        if (this.isOpen) this.connectWebSocket();
      }, 3000);
    };
  }

  private sendMessage() {
    if (!this.newMessage.trim() || !this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    
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
      this.dispatchEvent(new CustomEvent('drawer-closed', { bubbles: true, composed: true }));
      if (this.ws) {
        this.ws.close();
      }
    }, 300);
  }

  render() {
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
          class="absolute right-0 top-0 h-full w-3/4 bg-white shadow-2xl transition-transform duration-300 ease-in-out"
          style="transform: translateX(${this.isOpen ? '0%' : '100%'});"
        >
          <div class="flex flex-col h-full">
            <!-- Header with X button -->
            <div class="flex justify-between items-center p-4 border-b bg-gray-50 sticky top-0 z-10">
              <h2 class="text-xl font-bold text-gray-800 truncate flex-1">
                💰 Bid on ${this.item.name}
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
            <div class="flex-1 flex overflow-hidden flex-row">
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
                
                <!-- Bid Input Section -->
                <div class="pt-3 border-t">
                  <label class="block text-xs font-medium text-gray-700 mb-2">Your Bid (KSh)</label>
                  <div class="flex flex-col gap-2">
                    <input 
                      type="number" 
                      .value=${this.bidAmount}
                      @input=${(e: Event) => this.bidAmount = (e.target as HTMLInputElement).value}
                      placeholder="Enter amount"
                      class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                    <button 
                      @click=${this.sendBid}
                      class="w-full bg-green-600 text-white px-3 py-2 text-sm rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
                      ?disabled=${this.isConnecting || !this.bidAmount}
                    >
                      💰 Place Bid
                    </button>
                  </div>
                </div>
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
                      <span class="text-sm font-medium text-gray-700">Chat with seller</span>
                    </div>
                    ${this.isConnecting ? html`
                      <span class="text-xs text-yellow-600 flex items-center gap-1">
                        <span class="inline-block w-2 h-2 bg-yellow-600 rounded-full animate-pulse"></span>
                        Connecting...
                      </span>
                    ` : html`
                      <span class="text-xs text-green-600 flex items-center gap-1">
                        <span class="inline-block w-2 h-2 bg-green-600 rounded-full"></span>
                        Connected
                      </span>
                    `}
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
                            ${msg.senderName} • ${new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div class="${msg.senderId === this.currentUser?.id 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-white text-gray-800 shadow-sm border'} rounded-lg px-3 py-2 break-words text-sm">
                            ${msg.type === 'bid' ? html`
                              <div class="flex items-center gap-1">
                                <span>💰</span>
                                <span class="font-bold">Bid placed: KSh ${msg.bidAmount?.toLocaleString()}</span>
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
                
                <!-- Chat Input -->
                <div class="p-3 bg-white border-t">
                  <div class="flex gap-2">
                    <input 
                      type="text" 
                      .value=${this.newMessage}
                      @input=${(e: Event) => this.newMessage = (e.target as HTMLInputElement).value}
                      @keypress=${(e: KeyboardEvent) => e.key === 'Enter' && this.sendMessage()}
                      placeholder="Type your message..."
                      class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      ?disabled=${this.isConnecting}
                    >
                    <button 
                      @click=${this.sendMessage}
                      class="bg-blue-600 text-white px-4 py-2 text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                      ?disabled=${this.isConnecting || !this.newMessage.trim()}
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}