import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { Item } from '../types/index.js';

@customElement('chat-drawer')
export class ChatDrawer extends LitElement {
  static styles = css`
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    .drawer-backdrop {
      position: fixed;
      inset: 0;
      background-color: rgba(0, 0, 0, 0.3);
      z-index: 40;
      animation: fadeIn 0.2s ease-out;
    }

    .drawer-container {
      position: fixed;
      inset: 0;
      right: 0;
      z-index: 50;
      width: 100%;
      max-width: 28rem;
      background-color: white;
      box-shadow: -10px 0 25px -5px rgba(0, 0, 0, 0.1);
      transform: translateX(100%);
      animation: slideIn 0.3s ease-out forwards;
      display: flex;
      flex-direction: column;
    }

    .drawer-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem;
      border-bottom: 1px solid #e5e7eb;
      background-color: white;
    }

    .seller-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .seller-avatar {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 9999px;
      object-fit: cover;
    }

    .seller-details {
      flex: 1;
    }

    .item-name {
      font-weight: 600;
      color: #111827;
      font-size: 0.875rem;
    }

    .seller-name {
      font-size: 0.75rem;
      color: #6b7280;
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

    .messages-container {
      flex: 1;
      overflow-y: auto;
      padding: 1rem;
      background-color: #f9fafb;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .message-wrapper {
      display: flex;
      width: 100%;
    }

    .message-wrapper.own {
      justify-content: flex-end;
    }

    .message-wrapper.other {
      justify-content: flex-start;
    }

    .message-bubble {
      max-width: 70%;
      border-radius: 0.5rem;
      padding: 0.5rem;
    }

    .message-bubble.own {
      background-color: #F3A712;
      color: white;
    }

    .message-bubble.other {
      background-color: white;
      border: 1px solid #e5e7eb;
      color: #111827;
    }

    .message-text {
      font-size: 0.875rem;
      word-wrap: break-word;
    }

    .message-time {
      font-size: 0.625rem;
      margin-top: 0.25rem;
      opacity: 0.7;
    }

    .message-time.own {
      text-align: right;
    }

    .empty-state {
      text-align: center;
      color: #9ca3af;
      margin-top: 2rem;
    }

    .empty-title {
      font-size: 0.875rem;
      margin-bottom: 0.5rem;
    }

    .empty-subtitle {
      font-size: 0.75rem;
    }

    .input-form {
      padding: 1rem;
      border-top: 1px solid #e5e7eb;
      background-color: white;
    }

    .input-container {
      display: flex;
      gap: 0.5rem;
    }

    .message-input {
      flex: 1;
      padding: 0.5rem 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      transition: all 0.2s;
    }

    .message-input:focus {
      outline: none;
      border-color: #F3A712;
      box-shadow: 0 0 0 2px rgba(243, 167, 18, 0.1);
    }

    .send-button {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 0.5rem;
      font-weight: 600;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s;
      background-color: #F3A712;
      color: white;
    }

    .send-button:hover {
      background-color: #e0950a;
      transform: translateY(-1px);
    }

    .send-button:active {
      transform: translateY(0);
    }

    /* Scrollbar styling */
    .messages-container::-webkit-scrollbar {
      width: 6px;
    }

    .messages-container::-webkit-scrollbar-track {
      background: #f1f1f1;
    }

    .messages-container::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 3px;
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

    @keyframes slideIn {
      from {
        transform: translateX(100%);
      }
      to {
        transform: translateX(0);
      }
    }

    /* Mobile responsive */
    @media (max-width: 640px) {
      .drawer-container {
        max-width: 100%;
      }
      
      .message-bubble {
        max-width: 85%;
      }
    }
  `;

  @property({ type: Object }) item!: Item;
  @property({ type: String }) currentUserId = '';
  @property({ type: Boolean }) isOpen = false;
  @state() private messages: Array<{text: string, userId: string, timestamp: Date}> = [];
  @state() private newMessage = '';

  private closeDrawer() {
    this.isOpen = false;
    this.dispatchEvent(new CustomEvent('drawer-closed'));
  }

  private sendMessage(e: Event) {
    e.preventDefault();
    if (!this.newMessage.trim()) return;
    
    this.messages = [...this.messages, {
      text: this.newMessage.trim(),
      userId: this.currentUserId,
      timestamp: new Date()
    }];
    
    this.newMessage = '';
    
    // Scroll to bottom after render
    setTimeout(() => {
      const container = this.shadowRoot?.querySelector('.messages-container');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 0);
  }

  private formatTime(date: Date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  render() {
    if (!this.isOpen) return html``;

    return html`
      <div class="drawer-backdrop" @click=${this.closeDrawer}></div>
      
      <div class="drawer-container">
        <!-- Header -->
        <div class="drawer-header">
          <div class="seller-info">
            <img 
              src="${this.item.image || 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=40&h=40&fit=crop'}" 
              alt="${this.item.name}" 
              class="seller-avatar"
            >
            <div class="seller-details">
              <div class="item-name">${this.item.name}</div>
              <div class="seller-name">with ${this.item.sellerName}</div>
            </div>
          </div>
          <button @click=${this.closeDrawer} class="close-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <!-- Messages -->
        <div class="messages-container">
          ${this.messages.length === 0 ? html`
            <div class="empty-state">
              <div class="empty-title">💬 No messages yet</div>
              <div class="empty-subtitle">Start the conversation about ${this.item.name}</div>
            </div>
          ` : ''}
          ${this.messages.map(msg => html`
            <div class="message-wrapper ${msg.userId === this.currentUserId ? 'own' : 'other'}">
              <div class="message-bubble ${msg.userId === this.currentUserId ? 'own' : 'other'}">
                <div class="message-text">${msg.text}</div>
                <div class="message-time ${msg.userId === this.currentUserId ? 'own' : 'other'}">
                  ${this.formatTime(msg.timestamp)}
                </div>
              </div>
            </div>
          `)}
        </div>
        
        <!-- Input -->
        <form @submit=${this.sendMessage} class="input-form">
          <div class="input-container">
            <input 
              type="text" 
              .value=${this.newMessage}
              @input=${(e: Event) => this.newMessage = (e.target as HTMLInputElement).value}
              placeholder="Type your message..."
              class="message-input"
            >
            <button type="submit" class="send-button">
              Send
            </button>
          </div>
        </form>
      </div>
    `;
  }
}