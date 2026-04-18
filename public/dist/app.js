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
import './components/navbar.js';
import './components/ItemsGrid.js';
import './components/SellerDashboard.js';
import { tailwindCSS } from './styles.js';
import { lightThemeColors, darkThemeColors } from './colors.js';
let MarketplaceApp = class MarketplaceApp extends LitElement {
    constructor() {
        super();
        this.user = null;
        this.activeView = 'buyer';
        this.isDarkMode = false;
        this.user = AuthService.getCurrentUser();
        if (this.user) {
            this.activeView = this.user.userType === 'seller' ? 'seller' : 'buyer';
        }
        this.initTheme();
    }
    initTheme() {
        // Check localStorage for theme preference
        const savedTheme = localStorage.getItem('theme');
        this.isDarkMode = savedTheme === 'dark';
        console.log("Saved theme is ", savedTheme, " so isDarkMode is ", this.isDarkMode);
        this.applyTheme();
    }
    applyTheme() {
        const colors = this.isDarkMode ? darkThemeColors : lightThemeColors;
        const root = document.documentElement;
        console.log("colors is ", colors);
        // Set CSS variables for all theme colors
        Object.entries(colors).forEach(([key, value]) => {
            root.style.setProperty(`--${this.camelToKebab(key)}`, value);
        });
        // Also set a data attribute for body class
        document.body.setAttribute('data-theme', this.isDarkMode ? 'dark' : 'light');
    }
    camelToKebab(str) {
        return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
    }
    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
        this.applyTheme();
        this.requestUpdate();
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
        <div>
          <login-form @login-success=${this.handleLoginSuccess}></login-form>
        </div>
      `;
        }
        // Seller View - removed sticky/shadow classes from inner nav, now using bid-navbar only
        if (this.user.userType === 'seller') {
            return html `
        <bid-navbar .isDarkMode=${this.isDarkMode} @toggle-theme=${this.toggleTheme} @logout=${this.handleLogout}></bid-navbar>

        <div class="min-h-screen" style="background-color: var(--background); color: var(--on-background);">
          <!-- Seller Navigation - REMOVED sticky shadow classes, now delegated to bid-navbar -->
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div class="flex justify-between items-center mb-6">
              <div class="flex space-x-2">
                <button 
                  @click=${() => this.switchView('seller')}
                  class="px-4 py-2 rounded-lg transition-colors"
                  style="${this.activeView === 'seller' ? `background-color: var(--primary); color: var(--on-primary);` : `background-color: var(--surface-variant); color: var(--on-surface-variant);`}"
                >
                  📊 Dashboard
                </button>
                <button 
                  @click=${() => this.switchView('buyer')}
                  class="px-4 py-2 rounded-lg transition-colors"
                  style="${this.activeView === 'buyer' ? `background-color: var(--primary); color: var(--on-primary);` : `background-color: var(--surface-variant); color: var(--on-surface-variant);`}"
                >
                  🛒 Browse Items
                </button>
              </div>
            </div>

            <!-- Content based on active view -->
            ${this.activeView === 'seller'
                ? html `<seller-dashboard .sellerId=${this.user.id} .sellerName=${this.user.username}></seller-dashboard>`
                : html `<items-grid></items-grid>`}
          </div>
        </div>
      `;
        }
        // Buyer View - removed sticky/shadow classes from inner nav
        return html `
      <bid-navbar .isDarkMode=${this.isDarkMode} @toggle-theme=${this.toggleTheme} @logout=${this.handleLogout}></bid-navbar>

      <div class="min-h-screen" style="background-color: var(--background); color: var(--on-background);">
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
__decorate([
    state()
], MarketplaceApp.prototype, "isDarkMode", void 0);
MarketplaceApp = __decorate([
    customElement('marketplace-app')
], MarketplaceApp);
export { MarketplaceApp };
