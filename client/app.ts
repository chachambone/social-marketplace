import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { AuthService } from './services/auth.js';
import { User } from './types/index.js';
import './components/LoginForm.js';

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
          <span>Welcome, ${this.user.name}!</span>
          <button 
            @click=${this.handleLogout}
            class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
        
        <!-- Items will go here -->
        <div class="text-center py-8">
          <p class="text-gray-600">Marketplace items coming soon...</p>
        </div>
      </div>
    `;
  }
}