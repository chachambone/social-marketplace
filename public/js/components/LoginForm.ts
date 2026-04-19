import { LitElement, css, html, unsafeCSS } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { AuthService } from '../services/auth.js';
import { tailwindCSS } from '../styles.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

@customElement('login-form')
export class LoginForm extends LitElement {
  static styles = [unsafeCSS(tailwindCSS), css`
    /* Custom animations and styles */
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    .animate-spin {
      animation: spin 1s linear infinite;
    }
    
    .role-card {
      transition: all 0.2s ease;
      cursor: pointer;
    }
    
    .role-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .role-card.active {
      border-color: #F3A712;
      background-color: #FEF3D7;
      box-shadow: 0 4px 12px rgba(243, 167, 18, 0.15);
    }
    
    .role-card svg {
      transition: transform 0.2s ease;
    }
    
    .role-card:hover svg {
      transform: scale(1.05);
    }
    
    input:focus {
      outline: none;
      ring-color: #F3A712;
    }
  `];
  
  @state() private isLoginMode = true;
  @state() private email = '';
  @state() private fullName = '';
  @state() private password = '';
  @state() private userType: 'buyer' | 'seller' = 'buyer';
  @state() private error = '';
  @state() private isLoading = false;

  // Lucide Icons as SVG strings
  private userIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
  private mailIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`;
  private loader2Icon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>`;
  private shoppingBagIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`;
  private tagIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2H2v10l9.17 9.17a2 2 0 0 0 2.83 0l7-7a2 2 0 0 0 0-2.83z"/><circle cx="7" cy="7" r="2"/></svg>`;

  private icon(svg: string, size: number = 20, className: string = "") {
    return html`<span class="inline-flex items-center justify-center ${className}" style="width:${size}px;height:${size}px">${unsafeHTML(svg)}</span>`;
  }

  private get generatedUsername(): string {
    if (!this.fullName) return '';
    return this.fullName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '.');
  }

private async handleSubmit(e: Event) {
  e.preventDefault();
  this.error = '';
  this.isLoading = true;

  try {
    let response;
    if (this.isLoginMode) {
      response = await AuthService.login(this.email, this.password);
    } else {
      response = await AuthService.register(this.email, this.fullName, this.userType);
    }
    
    // Make sure user data is properly stored
    if (response.user) {
      // The AuthService should have stored it, but let's ensure
      if (!localStorage.getItem('user')) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }
    }
    
    // Dispatch success event
    this.dispatchEvent(new CustomEvent('login-success', { 
      detail: response.user, 
      bubbles: true, 
      composed: true 
    }));
    
    // Redirect based on user type
    if (response.user?.userType === 'seller') {
      window.location.href = '/seller/dashboard';
    } else {
      window.location.href = '/';
    }
    
  } catch (err: any) {
    this.error = err.message;
    this.isLoading = false;
  }
}

  render() {
    return html`
      <div class="max-w-md mx-auto mt-16 p-8 bg-white rounded-lg shadow-lg">
        <div class="text-2xl font-bold text-center mb-6 text-gray-800">

        <div class="text-4xl mb-2">🐝</div>            
        <h2>
          ${this.isLoginMode ? html `Welcome Back to <span style="color:#F3A712">BidHive</span> ` : 'Create Account'}
        </h2>

                <p class="text-gray-500 text-sm mt-1">${this.isLoginMode ? html `Sign in to continue` : 'Sign up to get started'}</p>


        </div>

        

        
        <form @submit=${this.handleSubmit} class="space-y-4">
          ${this.error ? html`
            <div class="bg-red-100 text-red-700 p-3 rounded-lg text-sm">
              ${this.error}
            </div>
          ` : ''}

          <!-- Role Selection Cards (Register Mode Only) -->
          ${!this.isLoginMode ? html`
            <div class="grid grid-cols-2 gap-3 mb-6">
              <div 
                @click=${() => { this.userType = 'buyer'; this.requestUpdate(); }}
                class="role-card p-4 rounded-xl border-2 ${this.userType === 'buyer' ? 'active' : 'border-gray-200'}"
              >
                <div class="text-center">
                  <div class="flex justify-center mb-2" style="color: ${this.userType === 'buyer' ? '#F3A712' : '#9CA3AF'}">
                    ${this.icon(this.shoppingBagIcon, 28)}
                  </div>
                  <div class="font-semibold text-gray-900">Buyer</div>
                  <div class="text-xs text-gray-500 mt-1">Browse & make offers</div>
                </div>
              </div>
              <div 
                @click=${() => { this.userType = 'seller'; this.requestUpdate(); }}
                class="role-card p-4 rounded-xl border-2 ${this.userType === 'seller' ? 'active' : 'border-gray-200'}"
              >
                <div class="text-center">
                  <div class="flex justify-center mb-2" style="color: ${this.userType === 'seller' ? '#F3A712' : '#9CA3AF'}">
                    ${this.icon(this.tagIcon, 28)}
                  </div>
                  <div class="font-semibold text-gray-900">Seller</div>
                  <div class="text-xs text-gray-500 mt-1">List & sell items</div>
                </div>
              </div>
            </div>
          ` : ''}
          
          <!-- Email input -->
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700">Email</label>
            <input 
              type="email" 
              .value=${this.email}
              @input=${(e: Event) => this.email = (e.target as HTMLInputElement).value}
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            >
          </div>
          
          ${!this.isLoginMode ? html`

              <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700">Full Name</label>
            <input 
              placeholder="MaryCharity"
              type="text" 
              .value=${this.fullName}
                  @input=${(e: Event) => {
                    this.fullName = (e.target as HTMLInputElement).value;
                    this.requestUpdate();
                  }}              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            >
          </div>

             ${this.fullName ? html`
                <p class="text-xs text-gray-500 mt-1">
                  Username will be: <span class="font-mono text-[#F3A712]">${this.generatedUsername}</span>
                </p>
              ` : ''}

            
          ` : ''}
          
          <!-- Password input -->
          
          ${this.isLoginMode ? html`

          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700">Password</label>
            <input 
              type="password" 
              .value=${this.password}
              @input=${(e: Event) => this.password = (e.target as HTMLInputElement).value}
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
              minlength="6"
            >
          </div> ` : html``}
          
    
          
          <!-- Submit Button -->
          <div class="flex">
            <button 
              type="submit" 
              ?disabled=${this.isLoading}
              class="flex-1 w-full py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed" 
              style="background-color: var(--primary); color: var(--on-primary);"
            >
              ${this.isLoading ? 'Please wait...' : (this.isLoginMode ? 'Sign In' : 'Register')}
            </button>
          </div>
        </form>
        
        <!-- Toggle button -->
        <div class="mt-4 flex justify-center">
          <button 
            @click=${() => { this.isLoginMode = !this.isLoginMode; this.error = ''; }}
            class="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            ${this.isLoginMode ? 'Need an account? Register' : 'Already have an account? Sign In'}
          </button>
        </div>
      </div>
    `;
  }
}