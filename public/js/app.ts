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
      return html`<login-form @login-success=${this.handleLoginSuccess}></login-form>`;
    }

    return html`
      <div>
        <div style="background: #dbeafe; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem; display: flex; justify-content: space-between;">
          <span>Welcome, ${this.user.name}! ✨ Ready to trade?</span>
          <button @click=${this.handleLogout} style="background: #ef4444; color: white; padding: 0.5rem 1rem; border: none; border-radius: 0.5rem; cursor: pointer;">Logout</button>
        </div>
        <items-grid></items-grid>
      </div>
    `;
  }
}
