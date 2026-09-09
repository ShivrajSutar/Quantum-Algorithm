/**
 * AuthModal.js - Login & Registration Modal Component
 */

export class AuthModal {
  constructor(authManager, verificationModal) {
    this.authManager = authManager;
    this.verificationModal = verificationModal;
    this.modal = null;
    this.mode = 'login'; // 'login' or 'register'
    this.onSuccess = null;
  }

  show(mode = 'login', onSuccess = null) {
    this.mode = mode;
    this.onSuccess = onSuccess;
    this.render();
    this.modal.style.display = 'flex';
  }

  hide() {
    if (this.modal) {
      this.modal.style.display = 'none';
    }
  }

  render() {
    // Remove existing modal if present
    const existing = document.getElementById('auth-modal');
    if (existing) existing.remove();

    // Create modal structure
    this.modal = document.createElement('div');
    this.modal.id = 'auth-modal';
    this.modal.className = 'auth-modal';
    this.modal.innerHTML = `
      <div class="auth-modal-overlay"></div>
      <div class="auth-modal-content">
        <button class="auth-modal-close">&times;</button>
        <div class="auth-modal-header">
          <h2>${this.mode === 'login' ? 'Login to QuantumAlgo' : 'Create Account'}</h2>
          <p>Access your quantum learning progress</p>
        </div>

        <form id="auth-form" class="auth-form">
          ${this.mode === 'register' ? `
            <div class="form-group">
              <label for="username">Username</label>
              <input type="text" id="username" name="username" required minlength="3" autocomplete="username">
            </div>
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" name="email" required autocomplete="email">
            </div>
          ` : `
            <div class="form-group">
              <label for="username">Username or Email</label>
              <input type="text" id="username" name="username" required autocomplete="username">
            </div>
          `}

          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" required minlength="6" autocomplete="${this.mode === 'login' ? 'current-password' : 'new-password'}">
          </div>

          <div id="auth-error" class="auth-error" style="display: none;"></div>

          <button type="submit" class="btn btn-primary auth-submit">
            ${this.mode === 'login' ? 'Login' : 'Create Account'}
          </button>
        </form>

        <div class="auth-toggle">
          ${this.mode === 'login'
            ? "Don't have an account? <a href='#' id='switch-to-register'>Sign up</a>"
            : "Already have an account? <a href='#' id='switch-to-login'>Login</a>"
          }
        </div>
      </div>
    `;

    document.body.appendChild(this.modal);
    this.attachEventListeners();
  }

  attachEventListeners() {
    // Close button
    const closeBtn = this.modal.querySelector('.auth-modal-close');
    closeBtn.addEventListener('click', () => this.hide());

    // Close on overlay click
    const overlay = this.modal.querySelector('.auth-modal-overlay');
    overlay.addEventListener('click', () => this.hide());

    // Form submission
    const form = this.modal.querySelector('#auth-form');
    form.addEventListener('submit', (e) => this.handleSubmit(e));

    // Mode switcher
    const switchBtn = this.modal.querySelector(this.mode === 'login' ? '#switch-to-register' : '#switch-to-login');
    if (switchBtn) {
      switchBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.mode = this.mode === 'login' ? 'register' : 'login';
        this.render();
        this.modal.style.display = 'flex';
      });
    }
  }

  async handleSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const submitBtn = form.querySelector('.auth-submit');
    const errorDiv = form.querySelector('#auth-error');

    // Get form values
    const username = form.querySelector('#username').value;
    const password = form.querySelector('#password').value;
    const email = this.mode === 'register' ? form.querySelector('#email').value : null;

    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.textContent = this.mode === 'login' ? 'Logging in...' : 'Creating account...';
    errorDiv.style.display = 'none';

    // Call appropriate auth method
    let result;
    if (this.mode === 'login') {
      result = await this.authManager.login(username, password);
    } else {
      result = await this.authManager.register(username, email, password);
    }

    if (result.success) {
      this.hide();
      if (this.onSuccess) {
        this.onSuccess(result.user);
      }
    } else if (result.requiresVerification) {
      // Show verification modal
      this.hide();

      // Get email from result or form
      const emailToVerify = result.email || (this.mode === 'register' ? email : result.error.includes('@') ? username : null);

      this.verificationModal.show(result.userId, emailToVerify, (user) => {
        if (this.onSuccess) {
          this.onSuccess(user);
        }
      });
    } else {
      // Show error
      errorDiv.textContent = result.error;
      errorDiv.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.textContent = this.mode === 'login' ? 'Login' : 'Create Account';
    }
  }
}
