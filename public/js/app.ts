import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { AuthService } from './services/auth.js';
import { User } from './types/index.js';
import './components/LoginForm.js';
import './components/ItemsGrid.js';

@customElement('marketplace-app')
export class MarketplaceApp extends LitElement {
  @state() private user: User | null = null;

  constructor() {
    super();
    this.user = AuthService.getCurrentUser();
  }

  private handleLoginSuccess(e: CustomEvent) {
    this.user = e.detail;
    this.requestUpdate();
  }

  private handleLogout() {
    AuthService.logout();
    this.user = null;
    this.requestUpdate();
  }

  render() {
    if (!this.user) {
      return html`
        <login-form @login-success=${this.handleLoginSuccess}></login-form>
      `;
    }

    return html`
      <div>
        <div class="bg-blue-100 p-4 rounded-lg mb-4 flex justify-between items-center">
          <div>
            <span class="font-semibold">Welcome, ${this.user.username}! ✨ Ready to trade?</span>
            <span class="text-sm text-gray-600 ml-2">(${this.user.userType})</span>
          </div>
          <button 
            @click=${this.handleLogout}
            class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
        
        <items-grid></items-grid>
      </div>
    `;
  }
}