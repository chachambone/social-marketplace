import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { AuthService } from '../services/auth.js';
import { tailwindCSS } from '../styles.js';

@customElement('login-form')
export class LoginForm extends LitElement {
  static styles = unsafeCSS(tailwindCSS);
  
  @state() private isLoginMode = true;
  @state() private email = '';
  @state() private username = '';
  @state() private password = '';
  @state() private userType: 'buyer' | 'seller' = 'buyer';
  @state() private error = '';
  @state() private isLoading = false;

  private async handleSubmit(e: Event) {
    e.preventDefault();
    this.error = '';
    this.isLoading = true;

    try {
      let response;
      if (this.isLoginMode) {
        response = await AuthService.login(this.email, this.password);
      } else {
        response = await AuthService.register(this.email, this.username, this.password, this.userType);
      }
      
      this.dispatchEvent(new CustomEvent('login-success', { 
        detail: response.user, 
        bubbles: true, 
        composed: true 
      }));
    } catch (err: any) {
      this.error = err.message;
    } finally {
      this.isLoading = false;
    }
  }

  render() {
    return html`
      <div class="max-w-md mx-auto mt-16 p-8 bg-white rounded-lg shadow-lg">
        <h2 class="text-2xl font-bold text-center mb-6 text-gray-800">
          ${this.isLoginMode ? 'Welcome Back!' : 'Create Account'}
        </h2>
        
        <form @submit=${this.handleSubmit} class="space-y-4">
          ${this.error ? html`
            <div class="bg-red-100 text-red-700 p-3 rounded-lg text-sm">
              ${this.error}
            </div>
          ` : ''}
          
          <!-- Email input with flex container -->
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700">Email</label>
            <input 
              type="email" 
              .value=${this.email}
              @input=${(e: Event) => this.email = (e.target as HTMLInputElement).value}
              class="flex-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            >
          </div>
          
          ${!this.isLoginMode ? html`
            <!-- Username input with flex container -->
            <div class="flex flex-col gap-1">
              <label class="text-sm font-medium text-gray-700">Username</label>
              <input 
                type="text" 
                .value=${this.username}
                @input=${(e: Event) => this.username = (e.target as HTMLInputElement).value}
                class="flex-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              >
            </div>
          ` : ''}
          
          <!-- Password input with flex container -->
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700">Password</label>
            <input 
              type="password" 
              .value=${this.password}
              @input=${(e: Event) => this.password = (e.target as HTMLInputElement).value}
              class="flex-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
              minlength="6"
            >
          </div>
          
          ${!this.isLoginMode ? html`
            <!-- User type select with flex container -->
            <div class="flex flex-col gap-1">
              <label class="text-sm font-medium text-gray-700">I want to</label>
              <select 
                .value=${this.userType}
                @change=${(e: Event) => this.userType = (e.target as HTMLSelectElement).value as 'buyer' | 'seller'}
                class="flex-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="buyer">Buy items</option>
                <option value="seller">Sell items</option>
              </select>
            </div>
          ` : ''}
          
          <!-- Button with flex container -->
          <div class="flex">
            <button 
              type="submit" 
              ?disabled=${this.isLoading}
              class="flex-1 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              ${this.isLoading ? 'Please wait...' : (this.isLoginMode ? 'Sign In' : 'Register')}
            </button>
          </div>
        </form>
        
        <!-- Toggle button container with flex -->
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