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
import './components/SellerDashboard.js';
import { tailwindCSS } from './styles.js';
let MarketplaceApp = class MarketplaceApp extends LitElement {
    constructor() {
        super();
        this.user = null;
        this.activeView = 'buyer';
        this.user = AuthService.getCurrentUser();
        if (this.user) {
            this.activeView = this.user.userType === 'seller' ? 'seller' : 'buyer';
        }
    }
    handleLoginSuccess(e) {
        this.user = e.detail;
        this.activeView = this.user.userType === 'seller' ? 'seller' : 'buyer';
        this.requestUpdate();
    }
    handleLogout() {
        AuthService.logout();
        this.user = null;
        this.requestUpdate();
    }
    switchView(view) {
        this.activeView = view;
        this.requestUpdate();
    }
    render() {
        if (!this.user) {
            return html `
        <login-form @login-success=${this.handleLoginSuccess}></login-form>
      `;
        }
        // Seller View
        if (this.user.userType === 'seller') {
            return html `
        <div class="min-h-screen bg-gray-100">
          <!-- Seller Navigation -->
          <div class="bg-white shadow-md sticky top-0 z-50">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div class="flex justify-between items-center py-4">
                <div class="flex items-center space-x-4">
                  <span class="text-2xl">🃏</span>
                  <h1 class="text-xl font-bold text-gray-800">Seller Dashboard</h1>
                  <div class="flex space-x-2 ml-4">
                    <button 
                      @click=${() => this.switchView('seller')}
                      class="${this.activeView === 'seller' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'} px-4 py-2 rounded-lg transition-colors"
                    >
                      📊 Dashboard
                    </button>
                    <button 
                      @click=${() => this.switchView('buyer')}
                      class="${this.activeView === 'buyer' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'} px-4 py-2 rounded-lg transition-colors"
                    >
                      🛒 Browse Items
                    </button>
                  </div>
                </div>
                <div class="flex items-center space-x-4">
                  <span class="text-sm text-gray-600">Welcome, ${this.user.username}!</span>
                  <button 
                    @click=${this.handleLogout}
                    class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Content based on active view -->
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            ${this.activeView === 'seller'
                ? html `<seller-dashboard .sellerId=${this.user.id} .sellerName=${this.user.username}></seller-dashboard>`
                : html `<items-grid></items-grid>`}
          </div>
        </div>
      `;
        }
        // Buyer View
        return html `
      <div class="min-h-screen bg-gray-100">
        <div class="bg-white shadow-md sticky top-0 z-50">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center py-4">
              <div class="flex items-center space-x-2">
                <span class="text-2xl">🃏</span>
                <h1 class="text-xl font-bold text-gray-800">Collectible Trading Post</h1>
              </div>
              <div class="flex items-center space-x-4">
                <span class="text-sm text-gray-600">Welcome, ${this.user.username}!</span>
                <button 
                  @click=${this.handleLogout}
                  class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <items-grid></items-grid>
        </div>
      </div>
    `;
    }
};
MarketplaceApp.styles = unsafeCSS(tailwindCSS);
__decorate([
    state()
], MarketplaceApp.prototype, "user", void 0);
__decorate([
    state()
], MarketplaceApp.prototype, "activeView", void 0);
MarketplaceApp = __decorate([
    customElement('marketplace-app')
], MarketplaceApp);
export { MarketplaceApp };
