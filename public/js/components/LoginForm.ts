import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { AuthService } from '../services/auth.js';

@customElement('login-form')
export class LoginForm extends LitElement {
  @state() private isLoginMode = true;
  @state() private name = '';
  @state() private password = '';
  @state() private error = '';
  @state() private isLoading = false;

  private async handleSubmit(e: Event) {
    e.preventDefault();
    this.error = '';
    this.isLoading = true;

    try {
      let user;
      if (this.isLoginMode) {
        user = await AuthService.login(this.name, this.password);
      } else {
        user = await AuthService.register(this.name, this.password);
      }
      
      this.dispatchEvent(new CustomEvent('login-success', { 
        detail: user, 
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
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input 
              type="text" 
              .value=${this.name}
              @input=${(e: Event) => this.name = (e.target as HTMLInputElement).value}
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              .value=${this.password}
              @input=${(e: Event) => this.password = (e.target as HTMLInputElement).value}
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              minlength="3"
            >
          </div>
          
          <button 
            type="submit" 
            ?disabled=${this.isLoading}
            class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
          >
            ${this.isLoading ? 'Please wait...' : (this.isLoginMode ? 'Sign In' : 'Register')}
          </button>
        </form>
        
        <div class="mt-4 text-center">
          <button 
            @click=${() => { this.isLoginMode = !this.isLoginMode; this.error = ''; }}
            class="text-blue-600 hover:text-blue-700 text-sm"
          >
            ${this.isLoginMode ? 'Need an account? Register' : 'Already have an account? Sign In'}
          </button>
        </div>
      </div>
    `;
  }
}