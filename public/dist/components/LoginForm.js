var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { AuthService } from '../services/auth.js';
let LoginForm = class LoginForm extends LitElement {
    constructor() {
        super(...arguments);
        this.isLoginMode = true;
        this.name = '';
        this.password = '';
        this.error = '';
        this.isLoading = false;
    }
    async handleSubmit(e) {
        e.preventDefault();
        this.error = '';
        this.isLoading = true;
        try {
            let user;
            if (this.isLoginMode) {
                user = await AuthService.login(this.name, this.password);
            }
            else {
                user = await AuthService.register(this.name, this.password);
            }
            // Dispatch event to notify parent
            this.dispatchEvent(new CustomEvent('login-success', {
                detail: user,
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
      <form @submit=${this.handleSubmit}>
        <h2>${this.isLoginMode ? 'Login' : 'Register'}</h2>
        
        ${this.error ? html `<div class="error">${this.error}</div>` : ''}
        
        <div class="form-group">
          <label>Username</label>
          <input 
            type="text" 
            .value=${this.name}
            @input=${(e) => this.name = e.target.value}
            required
            ?disabled=${this.isLoading}
          >
        </div>
        
        <div class="form-group">
          <label>Password</label>
          <input 
            type="password" 
            .value=${this.password}
            @input=${(e) => this.password = e.target.value}
            required
            minlength="3"
            ?disabled=${this.isLoading}
          >
        </div>
        
        <button type="submit" ?disabled=${this.isLoading}>
          ${this.isLoading ? 'Please wait...' : (this.isLoginMode ? 'Login' : 'Register')}
        </button>
        
        <div class="toggle-mode" @click=${() => {
            this.isLoginMode = !this.isLoginMode;
            this.error = '';
        }}>
          ${this.isLoginMode ? 'Need an account? Register' : 'Already have an account? Login'}
        </div>
      </form>
    `;
    }
};
LoginForm.styles = css `
    :host {
      display: block;
      max-width: 400px;
      margin: 2rem auto;
      padding: 2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .form-group {
      margin-bottom: 1rem;
    }
    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }
    input {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }
    button {
      width: 100%;
      padding: 0.75rem;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
    }
    button:disabled {
      background: #9ca3af;
      cursor: not-allowed;
    }
    .error {
      color: #ef4444;
      margin-bottom: 1rem;
      padding: 0.5rem;
      background: #fee2e2;
      border-radius: 4px;
    }
    .toggle-mode {
      margin-top: 1rem;
      text-align: center;
      color: #3b82f6;
      cursor: pointer;
    }
    h2 {
      margin-top: 0;
      text-align: center;
    }
  `;
__decorate([
    state()
], LoginForm.prototype, "isLoginMode", void 0);
__decorate([
    state()
], LoginForm.prototype, "name", void 0);
__decorate([
    state()
], LoginForm.prototype, "password", void 0);
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
