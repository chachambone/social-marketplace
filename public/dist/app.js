var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { AuthService } from './services/auth.js';
import './components/LoginForm.js';
import './components/ItemsGrid.js';
let MarketplaceApp = class MarketplaceApp extends LitElement {
    constructor() {
        super();
        this.user = null;
        this.user = AuthService.getCurrentUser();
    }
    handleLoginSuccess(e) {
        this.user = e.detail;
        this.requestUpdate();
    }
    handleLogout() {
        AuthService.logout();
        this.user = null;
        this.requestUpdate();
    }
    render() {
        if (!this.user) {
            return html `<login-form @login-success=${this.handleLoginSuccess}></login-form>`;
        }
        return html `
      <div>
        <div style="background: #dbeafe; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem; display: flex; justify-content: space-between;">
          <span>Welcome, ${this.user.name}! ✨ Ready to trade?</span>
          <button @click=${this.handleLogout} style="background: #ef4444; color: white; padding: 0.5rem 1rem; border: none; border-radius: 0.5rem; cursor: pointer;">Logout</button>
        </div>
        <items-grid></items-grid>
      </div>
    `;
    }
};
__decorate([
    state()
], MarketplaceApp.prototype, "user", void 0);
MarketplaceApp = __decorate([
    customElement('marketplace-app')
], MarketplaceApp);
export { MarketplaceApp };
