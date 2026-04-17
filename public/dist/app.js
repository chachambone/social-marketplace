var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { AuthService } from './services/auth.js';
import './components/LoginForm.js';
import './components/ItemsGrid.js';
import { tailwindCSS } from './styles.js';
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
            return html `
        <login-form @login-success=${this.handleLoginSuccess}></login-form>
      `;
        }
        return html `
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
};
MarketplaceApp.styles = unsafeCSS(tailwindCSS);
__decorate([
    state()
], MarketplaceApp.prototype, "user", void 0);
MarketplaceApp = __decorate([
    customElement('marketplace-app')
], MarketplaceApp);
export { MarketplaceApp };
