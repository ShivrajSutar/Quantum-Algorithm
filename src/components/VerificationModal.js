/**
 * VerificationModal.js - Email Verification Modal Component
 */

export class VerificationModal {
  constructor(authManager) {
    this.authManager = authManager;
    this.modal = null;
    this.userId = null;
    this.email = null;
    this.onSuccess = null;
  }

  show(userId, email, onSuccess = null) {
    this.userId = userId;
    this.email = email;
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
    const existing = document.getElementById('verification-modal');
    if (existing) existing.remove();

    // Create modal structure
    this.modal = document.createElement('div');
    this.modal.id = 'verification-modal';
    this.modal.className = 'auth-modal';
    this.modal.innerHTML = `
      <div class="auth-modal-overlay"></div>
      <div class="auth-modal-content">
        <button class="auth-modal-close">&times;</button>
        <div class="auth-modal-header">
          <h2>Verify Your Email</h2>
          <p>We sent a 6-digit code to <strong>${this.email}</strong></p>
        </div>

        <form id="verification-form" class="auth-form">
          <div class="form-group">
            <label for="verification-code">Verification Code</label>
            <input
              type="text"
              id="verification-code"
              name="code"
              required
              maxlength="6"
              pattern="[0-9]{6}"
              placeholder="Enter 6-digit code"
              autocomplete="off"
              style="text-align: center; font-size: 24px; letter-spacing: 8px; font-weight: bold;">
          </div>

          <div id="verification-error" class="auth-error" style="display: none;"></div>

          <button type="submit" class="btn btn-primary auth-submit">
            Verify Email
          </button>
        </form>

        <div class="auth-toggle">
          Didn't receive the code? <a href='#' id='resend-code'>Resend Code</a>
        </div>

        <div id="resend-message" style="display: none; text-align: center; color: #10b981; font-size: 13px; margin-top: 10px;">
          Verification code resent! Check your email.
        </div>
      </div>
    `;

    document.body.appendChild(this.modal);
    this.attachEventListeners();

    // Auto-focus on code input
    setTimeout(() => {
      const input = this.modal.querySelector('#verification-code');
      if (input) input.focus();
    }, 100);
  }

  attachEventListeners() {
    // Close button
    const closeBtn = this.modal.querySelector('.auth-modal-close');
    closeBtn.addEventListener('click', () => this.hide());

    // Close on overlay click
    const overlay = this.modal.querySelector('.auth-modal-overlay');
    overlay.addEventListener('click', () => this.hide());

    // Form submission
    const form = this.modal.querySelector('#verification-form');
    form.addEventListener('submit', (e) => this.handleSubmit(e));

    // Resend code
    const resendBtn = this.modal.querySelector('#resend-code');
    if (resendBtn) {
      resendBtn.addEventListener('click', (e) => this.handleResend(e));
    }

    // Format code input (digits only)
    const codeInput = this.modal.querySelector('#verification-code');
    codeInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });
  }

  async handleSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const submitBtn = form.querySelector('.auth-submit');
    const errorDiv = form.querySelector('#verification-error');
    const codeInput = form.querySelector('#verification-code');

    const code = codeInput.value.trim();

    if (code.length !== 6) {
      errorDiv.textContent = 'Please enter a 6-digit code';
      errorDiv.style.display = 'block';
      return;
    }

    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Verifying...';
    errorDiv.style.display = 'none';

    try {
      const response = await fetch(`${this.authManager.apiUrl}/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: this.userId, code })
      });

      const data = await response.json();

      if (response.ok) {
        // Store token and user info
        this.authManager.token = data.token;
        this.authManager.user = data.user;
        localStorage.setItem('quantum_auth_token', data.token);
        localStorage.setItem('quantum_user', JSON.stringify(data.user));

        this.authManager.notifyAuthChange(true);
        this.hide();

        if (this.onSuccess) {
          this.onSuccess(data.user);
        }
      } else {
        errorDiv.textContent = data.error || 'Verification failed';
        errorDiv.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Verify Email';
      }
    } catch (error) {
      errorDiv.textContent = 'Network error. Please try again.';
      errorDiv.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Verify Email';
    }
  }

  async handleResend(e) {
    e.preventDefault();

    const resendBtn = e.target;
    const resendMessage = this.modal.querySelector('#resend-message');
    const errorDiv = this.modal.querySelector('#verification-error');

    resendBtn.textContent = 'Sending...';
    errorDiv.style.display = 'none';
    resendMessage.style.display = 'none';

    try {
      const response = await fetch(`${this.authManager.apiUrl}/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: this.userId })
      });

      const data = await response.json();

      if (response.ok) {
        resendMessage.style.display = 'block';
        resendBtn.textContent = 'Resend Code';
      } else {
        errorDiv.textContent = data.error || 'Failed to resend code';
        errorDiv.style.display = 'block';
        resendBtn.textContent = 'Resend Code';
      }
    } catch (error) {
      errorDiv.textContent = 'Network error. Please try again.';
      errorDiv.style.display = 'block';
      resendBtn.textContent = 'Resend Code';
    }
  }
}
