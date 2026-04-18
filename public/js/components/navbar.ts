import { LitElement, html, css } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";

// SVG icons as raw strings (keeping your existing icons)
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
    navItems: { type: Array }
  };
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

  constructor() {
    super();
    this.isMenuOpen = false;
    this.isBeeAnimating = false;
    this.showNotifications = false;
    this.showUserMenu = false;
    
    const savedDarkMode = localStorage.getItem('bidnest_darkMode');
    this.isDarkMode = savedDarkMode === 'true';
    this.scrolled = false;
    this.beeTimeout = null;
    
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

  static styles = css`
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    .navbar {
      position: fixed;
      top: 0;
      width: 100%;
      z-index: 50;
      transition: all 0.3s ease;
      background-color: #F3A712;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .navbar.scrolled {
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }

    .nav-container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 1.5rem;
    }

    @media (min-width: 640px) {
      .nav-container {
        padding: 0 2rem;
      }
    }

    .nav-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 64px;
    }

    /* Logo */
    .logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
    }

    .bee-icon {
      font-size: 1.75rem;
      transition: all 0.3s ease;
    }

    .bee-icon.animate {
      transform: scale(1.1) rotate(12deg);
    }

    .logo:hover .bee-icon {
      transform: scale(1.1) rotate(6deg);
    }

    .logo-text {
      font-weight: 900;
      font-size: 1.25rem;
      letter-spacing: -0.025em;
      transition: opacity 0.2s;
      color: white;
    }

    .logo-text span {
      color: #1F2937;
    }

    @media (min-width: 640px) {
      .logo-text {
        font-size: 1.5rem;
      }
    }

    /* Desktop Navigation */
    .desktop-nav {
      display: none;
      align-items: center;
      gap: 0.25rem;
      background-color: rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(4px);
      border-radius: 9999px;
      padding: 0.25rem 0.5rem;
    }

    @media (min-width: 768px) {
      .desktop-nav {
        display: flex;
      }
    }

    .nav-link {
      padding: 0.5rem 1rem;
      border-radius: 9999px;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: white;
      text-decoration: none;
    }

    .nav-link:hover {
      background-color: rgba(255, 255, 255, 0.2);
    }

    .nav-link.active {
      background-color: white;
      color: #F3A712;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transform: scale(1.05);
    }

    /* Right Section */
    .right-section {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .icon-btn {
      padding: 0.5rem;
      border-radius: 9999px;
      transition: all 0.2s;
      background: none;
      border: none;
      cursor: pointer;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .icon-btn:hover {
      background-color: rgba(0, 0, 0, 0.1);
    }

    .btn-primary {
      font-size: 0.875rem;
      font-weight: 600;
      background-color: white;
      color: #F3A712;
      padding: 0.5rem 1.25rem;
      border-radius: 9999px;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .btn-primary:hover {
      background-color: #f9fafb;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    }

    .btn-secondary {
      font-size: 0.875rem;
      font-weight: 600;
      background-color: rgba(0, 0, 0, 0.2);
      color: white;
      padding: 0.5rem 1.25rem;
      border-radius: 9999px;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-secondary:hover {
      background-color: rgba(0, 0, 0, 0.3);
    }

    /* Notification Badge */
    .notification-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      background-color: #EF4444;
      color: white;
      font-size: 0.7rem;
      border-radius: 9999px;
      width: 1.25rem;
      height: 1.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    /* User Menu Button */
    .user-menu-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background-color: rgba(0, 0, 0, 0.1);
      padding: 0.5rem 0.75rem;
      border-radius: 9999px;
      transition: all 0.2s;
      border: none;
      cursor: pointer;
      color: white;
    }

    .user-menu-btn:hover {
      background-color: rgba(0, 0, 0, 0.2);
    }

    .user-avatar {
      width: 2rem;
      height: 2rem;
      background-color: white;
      border-radius: 9999px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #F3A712;
      font-size: 0.875rem;
      font-weight: bold;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s;
    }

    .user-menu-btn:hover .user-avatar {
      transform: scale(1.1);
    }

    /* Dropdown Menus */
    .dropdown {
      position: absolute;
      right: 0;
      margin-top: 0.75rem;
      width: 20rem;
      background-color: white;
      border-radius: 1rem;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
      overflow: hidden;
      z-index: 50;
      animation: slideDown 0.2s ease-out;
    }

    @media (min-width: 640px) {
      .dropdown {
        width: 24rem;
      }
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .dropdown-header {
      padding: 1rem;
      background: linear-gradient(135deg, #F3A712 0%, #E8950A 100%);
    }

    .dropdown-header-content {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .dropdown-avatar {
      width: 3rem;
      height: 3rem;
      background-color: white;
      border-radius: 9999px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #F3A712;
      font-weight: bold;
      font-size: 1.125rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .dropdown-user-info {
      flex: 1;
    }

    .dropdown-user-name {
      font-weight: bold;
      color: white;
    }

    .dropdown-user-email {
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.8);
    }

    .role-badge {
      display: inline-block;
      margin-top: 0.25rem;
      padding: 0.125rem 0.5rem;
      border-radius: 9999px;
      font-size: 0.7rem;
      background-color: rgba(255, 255, 255, 0.2);
      color: white;
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      transition: background-color 0.2s;
      cursor: pointer;
      text-decoration: none;
      background: none;
      border: none;
      width: 100%;
      text-align: left;
    }

    .dropdown-item:hover {
      background-color: #F9FAFB;
    }

    .dropdown-item-icon {
      color: #6B7280;
      transition: color 0.2s;
    }

    .dropdown-item:hover .dropdown-item-icon {
      color: #F3A712;
    }

    .dropdown-item-text {
      flex: 1;
    }

    .dropdown-item-title {
      font-size: 0.875rem;
      color: #374151;
    }

    .dropdown-item-subtitle {
      font-size: 0.7rem;
      color: #9CA3AF;
    }

    .dropdown-divider {
      border-top: 1px solid #F3F4F6;
      margin: 0.25rem 0;
    }

    .logout-item {
      color: #DC2626;
    }

    .logout-item:hover {
      background-color: #FEF2F2;
    }

    .logout-item:hover .dropdown-item-icon {
      color: #DC2626;
    }

    /* Notification Item */
    .notification-item {
      padding: 1rem;
      transition: background-color 0.2s;
      cursor: pointer;
      border-bottom: 1px solid #F3F4F6;
    }

    .notification-item.unread {
      background-color: #FEF3C7;
    }

    .notification-item:last-child {
      border-bottom: none;
    }

    .notification-item:hover {
      background-color: #F9FAFB;
    }

    .notification-content {
      display: flex;
      gap: 0.75rem;
    }

    .notification-icon {
      padding: 0.5rem;
      border-radius: 9999px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .notification-icon.unread {
      background-color: #FEF3C7;
    }

    .notification-icon.read {
      background-color: #F3F4F6;
    }

    .notification-text {
      flex: 1;
    }

    .notification-title {
      font-size: 0.875rem;
      font-weight: 500;
      color: #1F2937;
    }

    .notification-time {
      font-size: 0.7rem;
      color: #6B7280;
      margin-top: 0.25rem;
    }

    .notification-dot {
      width: 0.5rem;
      height: 0.5rem;
      background-color: #F3A712;
      border-radius: 9999px;
      margin-top: 0.25rem;
    }

    /* Mobile Menu */
    .mobile-menu {
      display: block;
      padding: 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.2);
      animation: slideDown 0.2s ease-out;
      background-color: #F3A712;
    }

    @media (min-width: 768px) {
      .mobile-menu {
        display: none;
      }
    }

    .mobile-nav-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border-radius: 0.75rem;
      transition: background-color 0.2s;
      color: white;
      text-decoration: none;
    }

    .mobile-nav-link.active {
      background-color: rgba(255, 255, 255, 0.2);
      font-weight: 600;
    }

    .mobile-nav-link:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .mobile-divider {
      border-top: 1px solid rgba(255, 255, 255, 0.2);
      margin: 0.5rem 0;
    }

    .spacer {
      height: 64px;
    }

    .relative {
      position: relative;
    }

    .hidden-sm {
      display: none;
    }

    @media (min-width: 640px) {
      .hidden-sm {
        display: inline;
      }
    }

    .hidden-md {
      display: block;
    }

    @media (min-width: 768px) {
      .hidden-md {
        display: none;
      }
    }
  `;

  checkLoginStatus() {
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');
    return !!(token && user);
  }

  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        return JSON.parse(userStr);
      }
    } catch (e) {
      console.error('Error parsing user data', e);
    }
    return { name: 'Guest', role: 'buyer', email: 'guest@example.com' };
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
    // Don't close if clicking inside user menu or notifications
    if (!target.closest('.user-menu') && !target.closest('.notifications-menu')) {
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

  handleLogout(e) {
    // Prevent event from bubbling up
    e.stopPropagation();
    
    // Clear localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    
    // Update state
    this.isLoggedIn = false;
    this.currentUser = null;
    this.showUserMenu = false; // Close the dropdown
    this.requestUpdate();
    
    // Dispatch events
    window.dispatchEvent(new CustomEvent('auth-changed', { detail: { isLoggedIn: false } }));
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
    
    this.dispatchEvent(new CustomEvent('toggle-theme', { 
      bubbles: true, 
      composed: true,
      detail: { isDarkMode: this.isDarkMode }
    }));
    
    window.dispatchEvent(new CustomEvent('darkmode-changed', { 
      detail: { isDarkMode: this.isDarkMode } 
    }));
  }

  toggleUserMenu(e) {
    e.stopPropagation();
    this.showUserMenu = !this.showUserMenu;
    this.showNotifications = false;
    this.requestUpdate();
  }

  toggleNotifications(e) {
    e.stopPropagation();
    this.showNotifications = !this.showNotifications;
    this.showUserMenu = false;
    this.requestUpdate();
  }

  renderLogo() {
    return html`
      <div class="logo" @click=${() => { this.animateBee(); window.location.href = '/'; }}>
        <div class="bee-icon ${this.isBeeAnimating ? 'animate' : ''}">
          🐝
        </div>
        <span class="logo-text">
          Bid<span>Nest</span>
        </span>
      </div>
    `;
  }

  render() {
    const unreadCount = this.notifications.filter(n => !n.read).length;
    const userName = this.currentUser?.name || 'Guest';
    const userEmail = this.currentUser?.email || 'guest@example.com';
    const userRole = this.currentUser?.role || 'buyer';

    return html`
      <nav class="navbar ${this.scrolled ? 'scrolled' : ''}">
        <div class="nav-container">
          <div class="nav-inner">

            <!-- Logo -->
            ${this.renderLogo()}

            <!-- Desktop Navigation -->
            <div class="desktop-nav">
              ${this.navItems.map(item => html`
                <a href=${item.path} class="nav-link ${item.active ? 'active' : ''}">
                  ${this.icon(item.icon, 16)} ${item.label}
                </a>
              `)}
            </div>

            <!-- Right Section -->
            <div class="right-section">
              <!-- Dark Mode Toggle -->
              <button class="icon-btn" @click=${this.toggleDarkMode} aria-label="Toggle dark mode">
                ${this.isDarkMode ? this.icon(sunIcon, 18) : this.icon(moonIcon, 18)}
              </button>

              <!-- NOT LOGGED IN -->
              ${!this.isLoggedIn ? html`
                <a href="/login" class="btn-primary">Sign In</a>
                <a href="/register" class="btn-secondary hidden-sm">Register</a>
              ` : html`
                <!-- LOGGED IN: Notifications -->
                <div class="relative notifications-menu">
                  <button class="icon-btn" @click=${this.toggleNotifications} aria-label="Notifications">
                    ${this.icon(bellIcon, 20)}
                    ${unreadCount > 0 ? html`
                      <span class="notification-badge">
                        ${unreadCount}
                      </span>
                    ` : ''}
                  </button>

                  ${this.showNotifications ? html`
                    <div class="dropdown">
                      <div class="dropdown-header" style="background: linear-gradient(135deg, #F3A712, #E8950A);">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                          <h3 style="font-weight: bold; color: white;">Notifications</h3>
                          <button style="font-size: 0.7rem; color: rgba(255,255,255,0.8); background: none; border: none; cursor: pointer;">Mark all read</button>
                        </div>
                      </div>
                      <div style="max-height: 24rem; overflow-y: auto;">
                        ${this.notifications.map(notif => html`
                          <div class="notification-item ${!notif.read ? 'unread' : ''}">
                            <div class="notification-content">
                              <div class="notification-icon ${!notif.read ? 'unread' : 'read'}">
                                ${this.icon(notif.icon, 14)}
                              </div>
                              <div class="notification-text">
                                <p class="notification-title">${notif.title}</p>
                                <p class="notification-time">${notif.time}</p>
                              </div>
                              ${!notif.read ? html`<div class="notification-dot"></div>` : ''}
                            </div>
                          </div>
                        `)}
                      </div>
                      <div style="padding: 0.75rem; background-color: #F9FAFB; border-top: 1px solid #F3F4F6; text-align: center;">
                        <button style="font-size: 0.875rem; color: #F3A712; font-weight: 500; background: none; border: none; cursor: pointer;">View all notifications</button>
                      </div>
                    </div>
                  ` : ''}
                </div>

                <!-- LOGGED IN: User Menu -->
                <div class="relative user-menu">
                  <button class="user-menu-btn" @click=${this.toggleUserMenu} aria-label="User menu">
                    <div class="user-avatar">
                      ${userName[0]?.toUpperCase()}
                    </div>
                    <span class="hidden-sm">${userName}</span>
                    ${this.icon(chevronDownIcon, 14, "hidden-sm")}
                  </button>

                  ${this.showUserMenu ? html`
                    <div class="dropdown">
                      <div class="dropdown-header">
                        <div class="dropdown-header-content">
                          <div class="dropdown-avatar">
                            ${userName[0]?.toUpperCase()}
                          </div>
                          <div class="dropdown-user-info">
                            <p class="dropdown-user-name">${userName}</p>
                            <p class="dropdown-user-email">${userEmail}</p>
                            <span class="role-badge">
                              ${userRole === 'seller' ? 'Seller Account' : 'Buyer Account'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div style="padding: 0.5rem 0;">
                        <a href="/profile" class="dropdown-item">
                          ${this.icon(userIcon, 18, "dropdown-item-icon")}
                          <div class="dropdown-item-text">
                            <div class="dropdown-item-title">My Profile</div>
                            <div class="dropdown-item-subtitle">View and edit your profile</div>
                          </div>
                        </a>
                        ${userRole === 'seller' ? html`
                          <a href="/sell" class="dropdown-item">
                            ${this.icon(tagIcon, 18, "dropdown-item-icon")}
                            <div class="dropdown-item-text">
                              <div class="dropdown-item-title">List an Item</div>
                              <div class="dropdown-item-subtitle">Create a new listing</div>
                            </div>
                          </a>
                        ` : ''}
                        <a href="/my-listings" class="dropdown-item">
                          ${this.icon(shoppingBagIcon, 18, "dropdown-item-icon")}
                          <div class="dropdown-item-text">
                            <div class="dropdown-item-title">My Listings</div>
                            <div class="dropdown-item-subtitle">Manage your items</div>
                          </div>
                        </a>
                        <a href="/favorites" class="dropdown-item">
                          ${this.icon(heartIcon, 18, "dropdown-item-icon")}
                          <div class="dropdown-item-text">
                            <div class="dropdown-item-title">Favorites</div>
                            <div class="dropdown-item-subtitle">Saved items</div>
                          </div>
                        </a>
                        <a href="/wallet" class="dropdown-item">
                          ${this.icon(walletIcon, 18, "dropdown-item-icon")}
                          <div class="dropdown-item-text">
                            <div class="dropdown-item-title">Wallet</div>
                            <div class="dropdown-item-subtitle">KSh 0.00</div>
                          </div>
                        </a>
                        <a href="/settings" class="dropdown-item">
                          ${this.icon(settingsIcon, 18, "dropdown-item-icon")}
                          <div class="dropdown-item-text">
                            <div class="dropdown-item-title">Settings</div>
                            <div class="dropdown-item-subtitle">Preferences and privacy</div>
                          </div>
                        </a>
                        <a href="/help" class="dropdown-item">
                          ${this.icon(helpCircleIcon, 18, "dropdown-item-icon")}
                          <div class="dropdown-item-text">
                            <div class="dropdown-item-title">Help & Support</div>
                            <div class="dropdown-item-subtitle">Get assistance</div>
                          </div>
                        </a>
                      </div>

                      <div class="dropdown-divider"></div>

                      <div style="padding: 0.5rem 0;">
                        <button class="dropdown-item logout-item" @click=${this.handleLogout}>
                          ${this.icon(logOutIcon, 18, "dropdown-item-icon")}
                          <div class="dropdown-item-text">
                            <div class="dropdown-item-title" style="color: #DC2626;">Logout</div>
                            <div class="dropdown-item-subtitle">Sign out of your account</div>
                          </div>
                        </button>
                      </div>
                    </div>
                  ` : ''}
                </div>
              `}

              <!-- Mobile menu button -->
              <div class="hidden-md">
                <button class="icon-btn" @click=${() => { this.isMenuOpen = !this.isMenuOpen; this.requestUpdate(); }} aria-label="Toggle menu">
                  ${this.isMenuOpen ? this.icon(xIcon, 24) : this.icon(menuIcon, 24)}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Mobile Navigation -->
        ${this.isMenuOpen ? html`
          <div class="mobile-menu">
            ${this.navItems.map(item => html`
              <a href=${item.path} class="mobile-nav-link ${item.active ? 'active' : ''}" @click=${() => { this.isMenuOpen = false; this.requestUpdate(); }}>
                ${this.icon(item.icon, 18)} ${item.label}
              </a>
            `)}
            <div class="mobile-divider"></div>
            ${!this.isLoggedIn ? html`
              <a href="/login" class="mobile-nav-link" style="background-color: white; color: #F3A712; font-weight: 600; justify-content: center;">Sign In</a>
              <a href="/register" class="mobile-nav-link" style="background-color: rgba(0,0,0,0.2); justify-content: center;">Register</a>
            ` : html`
              <a href="/profile" class="mobile-nav-link">
                ${this.icon(userIcon, 18)} My Profile
              </a>
              <a href="/my-listings" class="mobile-nav-link">
                ${this.icon(shoppingBagIcon, 18)} My Listings
              </a>
              <button class="mobile-nav-link" @click=${this.handleLogout} style="width: 100%; text-align: left;">
                ${this.icon(logOutIcon, 18)} Logout
              </button>
            `}
          </div>
        ` : ''}
      </nav>

      <!-- Spacer -->
      <div class="spacer"></div>
    `;
  }
}

if (!customElements.get("bid-navbar")) {
  customElements.define("bid-navbar", BidNavbar);
}

export default BidNavbar;