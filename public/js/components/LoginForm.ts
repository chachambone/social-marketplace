import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { AuthService } from '../services/auth.js';

@customElement('login-form')
export class LoginForm extends LitElement {
  @state() private isLoginMode = true;
  @state() private name = '';
  @state() private password = '';
  @state() private error = '';
  @state() private isLoading = false;

  static styles = css`
    :host {
      display: block;
      max-width: 400px;
      margin: 2rem auto;
      padding: 2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .form-group { margin-bottom: 1rem; }
    label { display: block; margin-bottom: 0.5rem; font-weight: 500; }
    input { width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; }
    button { width: 100%; padding: 0.75rem; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer; }
    button:disabled { background: #9ca3af; }
    .error { color: #ef4444; margin-bottom: 1rem; padding: 0.5rem; background: #fee2e2; border-radius: 4px; }
    .toggle-mode { margin-top: 1rem; text-align: center; color: #3b82f6; cursor: pointer; }
    h2 { margin-top: 0; text-align: center; }
  `;

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
      <form @submit=${this.handleSubmit}>
        <h2>${this.isLoginMode ? 'Login' : 'Register'}</h2>
        ${this.error ? html`<div class="error">${this.error}</div>` : ''}
        <div class="form-group">
          <label>Username</label>
          <input type="text" .value=${this.name} @input=${(e: Event) => this.name = (e.target as HTMLInputElement).value} required>
        </div>
        <div class="form-group">
          <label>Password</label>
          <input type="password" .value=${this.password} @input=${(e: Event) => this.password = (e.target as HTMLInputElement).value} required>
        </div>
        <button type="submit" ?disabled=${this.isLoading}>${this.isLoading ? 'Please wait...' : (this.isLoginMode ? 'Login' : 'Register')}</button>
        <div class="toggle-mode" @click=${() => { this.isLoginMode = !this.isLoginMode; this.error = ''; }}>
          ${this.isLoginMode ? 'Need an account? Register' : 'Already have an account? Login'}
        </div>
      </form>
    `;
  }
}
