import { LitElement, html } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";

// SVG icons as raw strings
const menuIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>`;
const xIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>`;
const shoppingBagIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`;
const userIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
const logOutIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>`;
const settingsIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>`;
const heartIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`;
const bellIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>`;
const tagIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2H2v10l9.17 9.17a2 2 0 0 0 2.83 0l7-7a2 2 0 0 0 0-2.83z"/><circle cx="7" cy="7" r="2"/></svg>`;
const starIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
const messageCircleIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
const walletIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></svg>`;
const helpCircleIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>`;
const homeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;
const gridIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`;
const awardIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>`;
const chevronDownIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`;
const moonIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`;
const sunIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`;

class BidNavbar extends LitElement {
  isMenuOpen: boolean;
  isBeeAnimating: boolean;
  showNotifications: boolean;
  showUserMenu: boolean;
  isDarkMode: boolean;
  scrolled: boolean;
  beeTimeout: null;
  isLoggedIn: boolean;
  currentUser: any;
  notifications: { id: number; type: string; title: string; time: string; icon: string; read: boolean; }[];
  navItems: { path: string; label: string; icon: string; active: boolean; }[];
  createRenderRoot() { return this }

  static properties = {
    isMenuOpen: { type: Boolean },
    isBeeAnimating: { type: Boolean },
    showNotifications: { type: Boolean },
    showUserMenu: { type: Boolean },
    isDarkMode: { type: Boolean },
    scrolled: { type: Boolean },
    isLoggedIn: { type: Boolean },
    currentUser: { type: Object },
    notifications: { type: Array },
    navItems: { type: Array },
  };

  constructor() {
    super();
    this.isMenuOpen = false;
    this.isBeeAnimating = false;
    this.showNotifications = false;
    this.showUserMenu = false;
    
    // Check saved dark mode preference
    const savedDarkMode = localStorage.getItem('bidnest_darkMode');
    this.isDarkMode = savedDarkMode === 'true';
    this.scrolled = false;
    this.beeTimeout = null;
    
    // Get auth state from localStorage or window
    this.isLoggedIn = this.checkLoginStatus();
    this.currentUser = this.getCurrentUser();

    this.notifications = [
      { id: 1, type: "message", title: "New message from Alex", time: "2 min ago", icon: messageCircleIcon, read: false },
      { id: 2, type: "offer", title: "Offer on your item", time: "1 hour ago", icon: tagIcon, read: false },
      { id: 3, type: "sale", title: "Item sold! 🎉", time: "3 hours ago", icon: shoppingBagIcon, read: true },
      { id: 4, type: "achievement", title: "You're a top seller!", time: "1 day ago", icon: awardIcon, read: true },
    ];

    this.navItems = [
      { path: "/", label: "Home", icon: homeIcon, active: false },
      { path: "/browse", label: "Browse", icon: gridIcon, active: false },
      { path: "/sell", label: "Sell", icon: tagIcon, active: false },
      { path: "/messages", label: "Messages", icon: messageCircleIcon, active: false },
    ];
  }

  checkLoginStatus() {
    // Check if user is logged in via localStorage or global auth service
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('current_user');
    return !!(token && user);
  }

  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('current_user');
      if (userStr) {
        return JSON.parse(userStr);
      }
    } catch (e) {
      console.error('Error parsing user data', e);
    }
    return { name: 'Guest', role: 'buyer' };
  }

  icon(svg, size = 18, className = "") {
    return html`<span class="inline-flex items-center justify-center ${className}" style="width:${size}px;height:${size}px">${unsafeHTML(svg)}</span>`;
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener("scroll", this.handleScroll.bind(this));
    document.addEventListener("click", this.handleClickOutside.bind(this));
    this.updateActiveTab();
    this.initDarkMode();
    
    // Listen for auth changes
    window.addEventListener('auth-changed', () => {
      this.isLoggedIn = this.checkLoginStatus();
      this.currentUser = this.getCurrentUser();
      this.requestUpdate();
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("scroll", this.handleScroll.bind(this));
    document.removeEventListener("click", this.handleClickOutside.bind(this));
    if (this.beeTimeout) clearTimeout(this.beeTimeout);
  }

  initDarkMode() {
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark-mode');
    }
    this.requestUpdate();
  }

  handleScroll() {
    const scrolled = window.scrollY > 20;
    if (this.scrolled !== scrolled) {
      this.scrolled = scrolled;
      this.requestUpdate();
    }
  }

  handleClickOutside(event) {
    const target = event.target;
    if (!target.closest(".user-menu") && !target.closest(".notifications-menu")) {
      let needsUpdate = false;
      if (this.showUserMenu) { 
        this.showUserMenu = false; 
        needsUpdate = true;
      }
      if (this.showNotifications) { 
        this.showNotifications = false; 
        needsUpdate = true;
      }
      if (needsUpdate) {
        this.requestUpdate();
      }
    }
  }

  updateActiveTab() {
    const path = window.location.pathname;
    this.navItems = this.navItems.map(item => ({ ...item, active: path === item.path }));
    this.requestUpdate();
  }

  animateBee() {
    if (this.isBeeAnimating) return;
    this.isBeeAnimating = true;
    if (this.beeTimeout) clearTimeout(this.beeTimeout);
    this.beeTimeout = setTimeout(() => { 
      this.isBeeAnimating = false; 
      this.requestUpdate();
    }, 500);
    this.requestUpdate();
  }

  handleLogout() {
    // Clear auth data
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
    this.isLoggedIn = false;
    this.currentUser = null;
    this.requestUpdate();
    
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('auth-changed', { detail: { isLoggedIn: false } }));
    
    // Also dispatch to parent marketplace-app
    this.dispatchEvent(new CustomEvent('logout', { bubbles: true, composed: true }));
    
    // Redirect to home
    window.location.href = '/';
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark-mode');
      localStorage.setItem('bidnest_darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark-mode');
      localStorage.setItem('bidnest_darkMode', 'false');
    }
    
    this.requestUpdate();
    
    // Dispatch event so parent marketplace-app can sync
    this.dispatchEvent(new CustomEvent('toggle-theme', { 
      bubbles: true, 
      composed: true,
      detail: { isDarkMode: this.isDarkMode }
    }));
    
    // Dispatch global event for other components
    window.dispatchEvent(new CustomEvent('darkmode-changed', { 
      detail: { isDarkMode: this.isDarkMode } 
    }));
  }

  renderLogo() {
    return html`
      <div class="flex items-center gap-2 cursor-pointer" @click=${() => { this.animateBee(); window.location.href = '/'; }}>
        <div class="text-3xl transition-all duration-300 ${this.isBeeAnimating ? 'scale-110 rotate-12' : 'hover:scale-110 hover:rotate-6'}">
          🐝
        </div>
        <span class="font-black text-2xl tracking-tight hover:opacity-90 transition text-white">
          Bid<span class="text-gray-900">Nest</span>
        </span>
      </div>
    `;
  }

  render() {
    const unreadCount = this.notifications.filter(n => !n.read).length;
    const userName = this.currentUser?.name || 'Guest';
    const userRole = this.currentUser?.role || 'buyer';

    return html`
      <!-- STICKY SHADOW NAVBAR - now all sticky/shadow classes are here -->
      <nav class="fixed top-0 w-full z-50 transition-all duration-300 shadow-md ${this.scrolled ? 'shadow-xl' : ''}" style="background-color: #F3A712;">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">

            <!-- Logo Section -->
            ${this.renderLogo()}

            <!-- Desktop Navigation -->
            <div class="hidden md:flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-2 py-1">
              ${this.navItems.map(item => html`
                <a href=${item.path}
                  class="px-4 py-2 rounded-full transition-all duration-300 flex items-center gap-2 text-sm font-medium ${item.active ? 'bg-white text-[#F3A712] shadow-lg scale-105' : 'text-white hover:bg-white/20'}">
                  ${this.icon(item.icon, 16)} ${item.label}
                </a>
              `)}
            </div>

            <!-- Right Section -->
            <div class="flex items-center gap-2">

              <!-- Dark Mode Toggle -->
              <button @click=${this.toggleDarkMode}
                class="p-2 rounded-full hover:bg-white/20 transition text-white" 
                aria-label="Toggle dark mode">
                ${this.isDarkMode ? this.icon(sunIcon, 18) : this.icon(moonIcon, 18)}
              </button>

              <!-- NOT LOGGED IN: Show Sign In + Register -->
              ${!this.isLoggedIn ? html`
                <a href="/login"
                  class="text-sm font-semibold text-[#F3A712] bg-white px-4 py-2 rounded-full hover:bg-white/90 transition hidden sm:block">
                  Sign In
                </a>
                <a href="/register"
                  class="text-sm font-semibold text-white bg-white/20 px-4 py-2 rounded-full hover:bg-white/30 transition hidden sm:block">
                  Register
                </a>
              ` : html`

                <!-- LOGGED IN: Notifications -->
                <div class="relative notifications-menu">
                  <button @click=${() => { this.showNotifications = !this.showNotifications; this.showUserMenu = false; this.requestUpdate(); }}
                    class="relative p-2 rounded-full hover:bg-white/20 transition text-white" aria-label="Notifications">
                    ${this.icon(bellIcon, 20)}
                    ${unreadCount > 0 ? html`
                      <span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                        ${unreadCount}
                      </span>
                    ` : ''}
                  </button>

                  ${this.showNotifications ? html`
                    <div class="absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-2xl overflow-hidden z-50 animate-slideDown">
                      <div class="p-4 bg-[#FEF3C7] border-b">
                        <div class="flex justify-between items-center">
                          <h3 class="font-bold text-gray-900">Notifications</h3>
                          <button class="text-xs text-[#F3A712] hover:text-[#F97316]">Mark all read</button>
                        </div>
                      </div>
                      <div class="max-h-96 overflow-y-auto">
                        ${this.notifications.map(notif => html`
                          <div class="p-4 hover:bg-gray-50 cursor-pointer transition border-b last:border-0 ${!notif.read ? 'bg-[#FEF3C7]/50' : ''}">
                            <div class="flex gap-3">
                              <div class="p-2 rounded-full ${!notif.read ? 'bg-[#FEF3C7]' : 'bg-gray-100'}">
                                ${this.icon(notif.icon, 14)}
                              </div>
                              <div class="flex-1">
                                <p class="text-sm font-medium text-gray-900">${notif.title}</p>
                                <p class="text-xs text-gray-500 mt-1">${notif.time}</p>
                              </div>
                              ${!notif.read ? html`<div class="w-2 h-2 bg-[#F3A712] rounded-full mt-1"></div>` : ''}
                            </div>
                          </div>
                        `)}
                      </div>
                      <div class="p-3 bg-gray-50 border-t text-center">
                        <button class="text-sm text-[#F3A712] hover:text-[#F97316] font-medium">View all notifications</button>
                      </div>
                    </div>
                  ` : ''}
                </div>

                <!-- LOGGED IN: User Menu -->
                <div class="relative user-menu">
                  <button @click=${() => { this.showUserMenu = !this.showUserMenu; this.showNotifications = false; this.requestUpdate(); }}
                    class="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-2 rounded-full transition group text-white"
                    aria-label="User menu">
                    <div class="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#F3A712] text-sm font-bold shadow-md group-hover:scale-110 transition">
                      ${userName[0]?.toUpperCase()}
                    </div>
                    <span class="text-sm font-medium hidden sm:inline">${userName}</span>
                    ${this.icon(chevronDownIcon, 14, "hidden sm:block")}
                  </button>

                  ${this.showUserMenu ? html`
                    <div class="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl overflow-hidden z-50 animate-slideDown">
                      <div class="p-4 bg-[#FEF3C7]">
                        <div class="flex items-center gap-3">
                          <div class="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md" style="background-color:#F3A712">
                            ${userName[0]?.toUpperCase()}
                          </div>
                          <div class="flex-1">
                            <p class="font-bold text-gray-900">${userName}</p>
                            <span class="text-xs capitalize px-2 py-0.5 rounded-full font-medium ${userRole === 'seller' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}">
                              ${userRole}
                            </span>
                          </div>
                          <div class="flex gap-1 items-center">
                            ${this.icon(starIcon, 14, "fill-[#F3A712] text-[#F3A712]")}
                            <span class="text-xs font-semibold">4.9</span>
                          </div>
                        </div>
                      </div>

                      <div class="py-2">
                        <a href="/profile" class="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition group">
                          ${this.icon(userIcon, 18, "text-gray-500 group-hover:text-[#F3A712]")}
                          <div class="flex-1">
                            <span class="text-sm text-gray-700 group-hover:text-gray-900">My Profile</span>
                            <p class="text-xs text-gray-400">View and edit your profile</p>
                          </div>
                        </a>
                        ${userRole === 'seller' ? html`
                          <a href="/sell" class="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition group">
                            ${this.icon(tagIcon, 18, "text-gray-500 group-hover:text-[#F3A712]")}
                            <div class="flex-1">
                              <span class="text-sm text-gray-700 group-hover:text-gray-900">List an Item</span>
                              <p class="text-xs text-gray-400">Create a new listing</p>
                            </div>
                          </a>
                        ` : ''}
                        <a href="/my-listings" class="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition group">
                          ${this.icon(shoppingBagIcon, 18, "text-gray-500 group-hover:text-[#F3A712]")}
                          <div class="flex-1">
                            <span class="text-sm text-gray-700 group-hover:text-gray-900">My Listings</span>
                            <p class="text-xs text-gray-400">Manage your items</p>
                          </div>
                        </a>
                        <a href="/favorites" class="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition group">
                          ${this.icon(heartIcon, 18, "text-gray-500 group-hover:text-red-500")}
                          <div class="flex-1">
                            <span class="text-sm text-gray-700 group-hover:text-gray-900">Favorites</span>
                            <p class="text-xs text-gray-400">Saved items</p>
                          </div>
                        </a>
                        <a href="/wallet" class="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition group">
                          ${this.icon(walletIcon, 18, "text-gray-500 group-hover:text-green-600")}
                          <div class="flex-1">
                            <span class="text-sm text-gray-700 group-hover:text-gray-900">Wallet</span>
                            <p class="text-xs text-gray-400">KSh 0.00</p>
                          </div>
                        </a>
                        <a href="/settings" class="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition group">
                          ${this.icon(settingsIcon, 18, "text-gray-500 group-hover:text-gray-700")}
                          <div class="flex-1">
                            <span class="text-sm text-gray-700 group-hover:text-gray-900">Settings</span>
                            <p class="text-xs text-gray-400">Preferences and privacy</p>
                          </div>
                        </a>
                        <a href="/help" class="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition group">
                          ${this.icon(helpCircleIcon, 18, "text-gray-500 group-hover:text-blue-600")}
                          <div class="flex-1">
                            <span class="text-sm text-gray-700 group-hover:text-gray-900">Help & Support</span>
                            <p class="text-xs text-gray-400">Get assistance</p>
                          </div>
                        </a>
                      </div>

                      <div class="border-t my-1"></div>

                      <div class="py-2">
                        <button @click=${this.handleLogout}
                          class="flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition w-full text-left group">
                          ${this.icon(logOutIcon, 18, "text-red-500 group-hover:text-red-600")}
                          <div class="flex-1">
                            <span class="text-sm text-red-600 group-hover:text-red-700">Logout</span>
                            <p class="text-xs text-gray-400">Sign out of your account</p>
                          </div>
                        </button>
                      </div>
                    </div>
                  ` : ''}
                </div>
              `}

              <!-- Mobile menu button -->
              <div class="md:hidden">
                <button @click=${() => { this.isMenuOpen = !this.isMenuOpen; this.requestUpdate(); }}
                  class="p-2 rounded-lg hover:bg-white/20 transition text-white" aria-label="Toggle menu">
                  ${this.isMenuOpen ? this.icon(xIcon, 24) : this.icon(menuIcon, 24)}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Mobile Navigation -->
        ${this.isMenuOpen ? html`
          <div class="md:hidden py-4 border-t border-white/20 animate-slideDown bg-[#F3A712]">
            <div class="flex flex-col gap-2 px-4">
              ${this.navItems.map(item => html`
                <a href=${item.path}
                  class="px-4 py-3 rounded-xl transition flex items-center gap-3 text-white ${item.active ? 'bg-white/20 font-semibold' : 'hover:bg-white/10'}"
                  @click=${() => { this.isMenuOpen = false; this.requestUpdate(); }}>
                  ${this.icon(item.icon, 18)} ${item.label}
                </a>
              `)}
              <div class="border-t border-white/20 my-2"></div>
              ${!this.isLoggedIn ? html`
                <a href="/login" class="px-4 py-3 rounded-xl bg-white text-[#F3A712] font-semibold text-center">Sign In</a>
                <a href="/register" class="px-4 py-3 rounded-xl bg-white/20 text-white font-semibold text-center">Register</a>
              ` : html`
                <a href="/profile" class="px-4 py-3 rounded-xl hover:bg-white/10 transition flex items-center gap-3 text-white">
                  ${this.icon(userIcon, 18)} My Profile
                </a>
                <a href="/my-listings" class="px-4 py-3 rounded-xl hover:bg-white/10 transition flex items-center gap-3 text-white">
                  ${this.icon(shoppingBagIcon, 18)} My Listings
                </a>
                <button @click=${this.handleLogout}
                  class="px-4 py-3 text-left rounded-xl hover:bg-white/10 transition flex items-center gap-3 text-red-100">
                  ${this.icon(logOutIcon, 18)} Logout
                </button>
              `}
            </div>
          </div>
        ` : ''}
      </nav>

      <!-- Spacer to prevent content from hiding under fixed navbar -->
      <div class="h-16"></div>
    `;
  }
}

// Register the component
if (!customElements.get("bid-navbar")) {
  customElements.define("bid-navbar", BidNavbar);
}

export default BidNavbar;