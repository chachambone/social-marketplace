var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { AuthService } from '../services/auth.js';
import { tailwindCSS } from '../styles.js';
let LoginForm = class LoginForm extends LitElement {
    constructor() {
        super(...arguments);
        this.isLoginMode = true;
        this.email = '';
        this.username = '';
        this.password = '';
        this.userType = 'buyer';
        this.error = '';
        this.isLoading = false;
    }
    async handleSubmit(e) {
        e.preventDefault();
        this.error = '';
        this.isLoading = true;
        try {
            let response;
            if (this.isLoginMode) {
                response = await AuthService.login(this.email, this.password);
            }
            else {
                response = await AuthService.register(this.email, this.username, this.password, this.userType);
            }
            this.dispatchEvent(new CustomEvent('login-success', {
                detail: response.user,
                bubbles: true,
                composed: true
            }));
        }
        catch (err) {
            this.error = err.message;
        }
        finally {
            this.isLoading = false;
        }
    }
    render() {
        return html `
      <div class="max-w-md mx-auto mt-16 p-8 bg-white rounded-lg shadow-lg">
        <h2 class="text-2xl font-bold text-center mb-6 text-gray-800">
          ${this.isLoginMode ? 'Welcome Back!' : 'Create Account'}
        </h2>
        
        <form @submit=${this.handleSubmit} class="space-y-4">
          ${this.error ? html `
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
              @input=${(e) => this.email = e.target.value}
              class="flex-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            >
          </div>
          
          ${!this.isLoginMode ? html `
            <!-- Username input with flex container -->
            <div class="flex flex-col gap-1">
              <label class="text-sm font-medium text-gray-700">Username</label>
              <input 
                type="text" 
                .value=${this.username}
                @input=${(e) => this.username = e.target.value}
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
              @input=${(e) => this.password = e.target.value}
              class="flex-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
              minlength="6"
            >
          </div>
          
          ${!this.isLoginMode ? html `
            <!-- User type select with flex container -->
            <div class="flex flex-col gap-1">
              <label class="text-sm font-medium text-gray-700">I want to</label>
              <select 
                .value=${this.userType}
                @change=${(e) => this.userType = e.target.value}
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
};
LoginForm.styles = unsafeCSS(tailwindCSS);
__decorate([
    state()
], LoginForm.prototype, "isLoginMode", void 0);
__decorate([
    state()
], LoginForm.prototype, "email", void 0);
__decorate([
    state()
], LoginForm.prototype, "username", void 0);
__decorate([
    state()
], LoginForm.prototype, "password", void 0);
__decorate([
    state()
], LoginForm.prototype, "userType", void 0);
__decorate([
    state()
], LoginForm.prototype, "error", void 0);
__decorate([
    state()
], LoginForm.prototype, "isLoading", void 0);
LoginForm = __decorate([
    customElement('login-form')
], LoginForm);
export { LoginForm };
