import { navigate } from '../utils/router.js';
import { getAppSettings } from '../components/settings.js';

export function isLoggedIn() {
  return !!localStorage.getItem('cineverse_user');
}

export function getUser() {
  try { return JSON.parse(localStorage.getItem('cineverse_user')); }
  catch { return null; }
}

export function logout() {
  localStorage.removeItem('cineverse_user');
  window.location.hash = '#/login';
  window.location.reload();
}

export function renderAuth(container, mode = 'login') {
  const isLogin = mode === 'login';

  container.innerHTML = `
    <div class="auth-page">
      <!-- Background overlay with ambient poster backdrop -->
      <div class="auth-bg">
        <div class="auth-bg-overlay"></div>
        <div class="auth-ambient-glow glow-1"></div>
        <div class="auth-ambient-glow glow-2"></div>
      </div>

      <nav class="auth-nav">
        <a href="#/" class="auth-logo">CINEVERSE</a>
        <div class="auth-nav-right">
          <button class="auth-demo-btn" id="auth-quick-demo">⚡ Instant Demo Login</button>
        </div>
      </nav>

      <div class="auth-wrapper">
        <div class="auth-card">
          
          <!-- Mode Tabs -->
          <div class="auth-tabs">
            <button class="auth-tab ${isLogin ? 'active' : ''}" id="tab-login-btn">Sign In</button>
            <button class="auth-tab ${!isLogin ? 'active' : ''}" id="tab-signup-btn">Create Account</button>
          </div>

          <div class="auth-header-text">
            <h2>${isLogin ? 'Welcome Back' : 'Start Watching Free'}</h2>
            <p>${isLogin ? 'Enter your details or log in directly with Google.' : 'Join CineVerse today. Cancel anytime.'}</p>
          </div>

          <!-- DIRECT GOOGLE LOGIN BUTTON (PRIMARY SOCIAL AUTH) -->
          <div class="auth-google-direct-wrap">
            <button class="auth-google-direct-btn" id="auth-google-direct">
              <svg width="20" height="20" viewBox="0 0 24 24" class="google-icon">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

          <div class="auth-divider">
            <span>OR EMAIL SIGN IN</span>
          </div>

          <form class="auth-form" id="auth-form">
            ${!isLogin ? `
            <div class="auth-field">
              <input type="text" id="auth-name" placeholder=" " required minlength="2" autocomplete="name" />
              <label for="auth-name">Full Name</label>
            </div>` : ''}

            <div class="auth-field">
              <input type="email" id="auth-email" placeholder=" " required autocomplete="email" />
              <label for="auth-email">Email Address</label>
            </div>

            <div class="auth-field">
              <input type="password" id="auth-password" placeholder=" " required minlength="4" autocomplete="${isLogin ? 'current-password' : 'new-password'}" />
              <label for="auth-password">Password</label>
              <button type="button" class="auth-toggle-pass" id="toggle-pass" title="Toggle Password">👁️</button>
            </div>

            ${!isLogin ? `
            <div class="password-strength-container" id="strength-container" style="display:none">
              <div class="strength-bar-bg"><div class="strength-bar-fill" id="strength-bar"></div></div>
              <span class="strength-label" id="strength-text">Password strength</span>
            </div>
            <div class="auth-field">
              <input type="password" id="auth-confirm" placeholder=" " required minlength="4" autocomplete="new-password" />
              <label for="auth-confirm">Confirm Password</label>
            </div>` : ''}

            <div id="auth-error" class="auth-error"></div>

            <button type="submit" class="auth-submit" id="auth-submit">
              <span>${isLogin ? 'Sign In' : 'Create Free Account'}</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>

            ${isLogin ? `
            <div class="auth-remember">
              <label class="auth-checkbox">
                <input type="checkbox" id="remember-me" checked />
                <span class="checkmark"></span>
                Remember me
              </label>
              <a href="#" class="auth-help" id="auth-forgot">Forgot password?</a>
            </div>` : ''}
          </form>

          <div class="auth-switch">
            ${isLogin
              ? `New to CineVerse? <a href="#/signup" class="auth-switch-link">Sign up now</a>`
              : `Already have an account? <a href="#/login" class="auth-switch-link">Sign in</a>`
            }
          </div>

          <div class="auth-social">
            <p class="auth-social-label">Secondary Login Methods</p>
            <div class="auth-social-buttons">
              <button class="auth-social-btn" id="auth-github">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                GitHub
              </button>
              <button class="auth-social-btn" id="auth-guest">
                <span>👤</span> Guest Access
              </button>
            </div>
          </div>

          <p class="auth-disclaimer">
            Protected by Google reCAPTCHA. <a href="#">Privacy Policy</a> and <a href="#">Terms of Service</a> apply.
          </p>
        </div>
      </div>

      <!-- GOOGLE DIRECT SIGN-IN MODAL POPUP -->
      <div id="google-modal-container"></div>
    </div>`;

  attachAuthListeners(container, isLogin);
}

function attachAuthListeners(container, isLogin) {
  const form = document.getElementById('auth-form');
  const errorEl = document.getElementById('auth-error');
  const togglePass = document.getElementById('toggle-pass');
  const passInput = document.getElementById('auth-password');

  // Mode Switch Tabs
  document.getElementById('tab-login-btn')?.addEventListener('click', () => {
    if (!isLogin) window.location.hash = '#/login';
  });
  document.getElementById('tab-signup-btn')?.addEventListener('click', () => {
    if (isLogin) window.location.hash = '#/signup';
  });

  // Password strength meter
  if (!isLogin && passInput) {
    const strengthContainer = document.getElementById('strength-container');
    const strengthBar = document.getElementById('strength-bar');
    const strengthText = document.getElementById('strength-text');

    passInput.addEventListener('input', (e) => {
      const val = e.target.value;
      if (!val) {
        strengthContainer.style.display = 'none';
        return;
      }
      strengthContainer.style.display = 'block';

      let score = 0;
      if (val.length >= 6) score++;
      if (val.length >= 10) score++;
      if (/[A-Z]/.test(val)) score++;
      if (/[0-9]/.test(val)) score++;
      if (/[^A-Za-z0-9]/.test(val)) score++;

      if (score <= 2) {
        strengthBar.style.width = '33%';
        strengthBar.style.background = '#e50914';
        strengthText.textContent = 'Password strength: Weak';
        strengthText.style.color = '#e50914';
      } else if (score <= 4) {
        strengthBar.style.width = '66%';
        strengthBar.style.background = '#f5c518';
        strengthText.textContent = 'Password strength: Medium';
        strengthText.style.color = '#f5c518';
      } else {
        strengthBar.style.width = '100%';
        strengthBar.style.background = '#46d369';
        strengthText.textContent = 'Password strength: Strong 💪';
        strengthText.style.color = '#46d369';
      }
    });
  }

  // Toggle password visibility
  togglePass?.addEventListener('click', () => {
    const isHidden = passInput.type === 'password';
    passInput.type = isHidden ? 'text' : 'password';
    togglePass.textContent = isHidden ? '🙈' : '👁️';
  });

  // Direct Google Login Trigger
  document.getElementById('auth-google-direct')?.addEventListener('click', () => {
    openGoogleDirectLoginModal();
  });

  // Quick Demo Login
  document.getElementById('auth-quick-demo')?.addEventListener('click', () => {
    socialLogin('Demo Cinephile', 'demo@cineverse.com', 'demo');
  });

  // Social / Guest buttons
  document.getElementById('auth-github')?.addEventListener('click', () => {
    socialLogin('GitHub User', 'github.user@github.com', 'github');
  });
  document.getElementById('auth-guest')?.addEventListener('click', () => {
    socialLogin('Guest Viewer', 'guest@cineverse.com', 'guest');
  });

  // Forgot password handler
  document.getElementById('auth-forgot')?.addEventListener('click', (e) => {
    e.preventDefault();
    const email = document.getElementById('auth-email').value.trim();
    if (!email) {
      showError(errorEl, 'Please enter your email address above to reset password.');
    } else {
      alert(`Password reset instructions have been sent to ${email}`);
    }
  });

  // Form submit
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    errorEl.textContent = '';
    errorEl.style.display = 'none';

    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;

    if (!email || !password) {
      showError(errorEl, 'Please fill in all fields.');
      return;
    }

    if (isLogin) {
      handleLogin(email, password, errorEl);
    } else {
      const name = document.getElementById('auth-name').value.trim();
      const confirm = document.getElementById('auth-confirm').value;
      if (!name) { showError(errorEl, 'Please enter your full name.'); return; }
      if (password !== confirm) { showError(errorEl, 'Passwords do not match.'); return; }
      if (password.length < 4) { showError(errorEl, 'Password must be at least 4 characters.'); return; }
      handleSignup(name, email, password, errorEl);
    }
  });
}

// DIRECT GOOGLE ACCOUNT LOGIN MODAL & FLOW
function openGoogleDirectLoginModal() {
  const modalContainer = document.getElementById('google-modal-container');
  if (!modalContainer) return;

  const googleAccounts = [
    { name: 'Alex Morgan', email: 'alex.morgan@gmail.com', avatarBg: '#4285F4', initials: 'AM' },
    { name: 'Sarah Connor', email: 'sarah.connor@gmail.com', avatarBg: '#EA4335', initials: 'SC' },
    { name: 'David Miller', email: 'david.miller@gmail.com', avatarBg: '#34A853', initials: 'DM' },
  ];

  modalContainer.innerHTML = `
    <div class="google-backdrop" id="google-backdrop">
      <div class="google-popup">
        <div class="google-popup-header">
          <svg width="24" height="24" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          <div>
            <h3>Sign in with Google</h3>
            <p>Choose an account to continue to <strong>CineVerse</strong></p>
          </div>
          <button class="google-close" id="google-close">✕</button>
        </div>

        <div class="google-account-list" id="google-account-list">
          ${googleAccounts.map(acc => `
            <div class="google-account-item" data-email="${acc.email}" data-name="${acc.name}">
              <div class="google-account-avatar" style="background:${acc.avatarBg}">${acc.initials}</div>
              <div class="google-account-details">
                <div class="account-name">${acc.name}</div>
                <div class="account-email">${acc.email}</div>
              </div>
              <span class="account-arrow">→</span>
            </div>
          `).join('')}

          <div class="google-account-item custom" id="google-custom-account">
            <div class="google-account-avatar custom">+</div>
            <div class="google-account-details">
              <div class="account-name">Use another Google account</div>
              <div class="account-email">Enter custom Google address</div>
            </div>
          </div>
        </div>

        <div class="google-custom-form" id="google-custom-form" style="display:none">
          <input type="email" id="google-custom-email" placeholder="Enter your Google email..." autofocus />
          <input type="text" id="google-custom-name" placeholder="Enter your name..." />
          <div class="google-custom-btns">
            <button class="btn btn-secondary btn-sm" id="google-custom-back">Back</button>
            <button class="btn btn-red btn-sm" id="google-custom-submit">Continue</button>
          </div>
        </div>

        <div class="google-loading" id="google-loading" style="display:none">
          <div class="google-spinner"></div>
          <p id="google-loading-text">Authenticating with Google Accounts...</p>
        </div>

        <div class="google-popup-footer">
          To continue, Google will share your name, email address, and language preference with CineVerse.
        </div>
      </div>
    </div>
  `;

  // Handlers
  document.getElementById('google-close')?.addEventListener('click', closeGoogleModal);
  document.getElementById('google-backdrop')?.addEventListener('click', (e) => {
    if (e.target.id === 'google-backdrop') closeGoogleModal();
  });

  // Account item clicks
  document.querySelectorAll('.google-account-item[data-email]').forEach(item => {
    item.addEventListener('click', () => {
      const email = item.dataset.email;
      const name = item.dataset.name;
      executeGoogleAuthFlow(name, email);
    });
  });

  // Custom account click
  document.getElementById('google-custom-account')?.addEventListener('click', () => {
    document.getElementById('google-account-list').style.display = 'none';
    document.getElementById('google-custom-form').style.display = 'flex';
  });

  document.getElementById('google-custom-back')?.addEventListener('click', () => {
    document.getElementById('google-custom-form').style.display = 'none';
    document.getElementById('google-account-list').style.display = 'flex';
  });

  document.getElementById('google-custom-submit')?.addEventListener('click', () => {
    const email = document.getElementById('google-custom-email').value.trim();
    const name = document.getElementById('google-custom-name').value.trim() || 'Google User';
    if (!email) return;
    executeGoogleAuthFlow(name, email);
  });
}

function executeGoogleAuthFlow(name, email) {
  const accountList = document.getElementById('google-account-list');
  const customForm = document.getElementById('google-custom-form');
  const loading = document.getElementById('google-loading');
  const loadingText = document.getElementById('google-loading-text');

  if (accountList) accountList.style.display = 'none';
  if (customForm) customForm.style.display = 'none';
  if (loading) loading.style.display = 'flex';

  setTimeout(() => {
    if (loadingText) loadingText.textContent = `Connecting to Google account: ${email}...`;
  }, 500);

  setTimeout(() => {
    socialLogin(name, email, 'google');
  }, 1200);
}

function closeGoogleModal() {
  const container = document.getElementById('google-modal-container');
  if (container) container.innerHTML = '';
}

function handleLogin(email, password, errorEl) {
  const submitBtn = document.getElementById('auth-submit');
  submitBtn.innerHTML = '<span class="auth-spinner"></span> Authenticating...';
  submitBtn.disabled = true;

  setTimeout(() => {
    const users = JSON.parse(localStorage.getItem('cineverse_users') || '[]');
    const user = users.find(u => u.email === email);

    if (!user) {
      showError(errorEl, 'No account found with this email. Please sign up or use Google Login.');
      submitBtn.innerHTML = 'Sign In';
      submitBtn.disabled = false;
      return;
    }

    if (user.password !== btoa(password)) {
      showError(errorEl, 'Incorrect password. Please try again.');
      submitBtn.innerHTML = 'Sign In';
      submitBtn.disabled = false;
      return;
    }

    // Success login
    localStorage.setItem('cineverse_user', JSON.stringify({
      name: user.name,
      email: user.email,
      provider: user.provider || 'email',
      avatar: user.name.charAt(0).toUpperCase(),
      loginTime: Date.now()
    }));

    submitBtn.innerHTML = '✓ Access Granted! Redirecting...';
    setTimeout(() => {
      window.location.hash = '#/';
      window.location.reload();
    }, 600);
  }, 700);
}

function handleSignup(name, email, password, errorEl) {
  const submitBtn = document.getElementById('auth-submit');
  submitBtn.innerHTML = '<span class="auth-spinner"></span> Creating profile...';
  submitBtn.disabled = true;

  setTimeout(() => {
    const users = JSON.parse(localStorage.getItem('cineverse_users') || '[]');
    
    if (users.find(u => u.email === email)) {
      showError(errorEl, 'An account with this email already exists. Try signing in.');
      submitBtn.innerHTML = 'Create Free Account';
      submitBtn.disabled = false;
      return;
    }

    // Save new user
    users.push({ name, email, password: btoa(password), provider: 'email', createdAt: Date.now() });
    localStorage.setItem('cineverse_users', JSON.stringify(users));

    // Auto login
    localStorage.setItem('cineverse_user', JSON.stringify({
      name,
      email,
      provider: 'email',
      avatar: name.charAt(0).toUpperCase(),
      loginTime: Date.now()
    }));

    submitBtn.innerHTML = '✓ Account Created! Opening CineVerse...';
    setTimeout(() => {
      window.location.hash = '#/';
      window.location.reload();
    }, 600);
  }, 800);
}

function socialLogin(name, email, provider = 'google') {
  localStorage.setItem('cineverse_user', JSON.stringify({
    name,
    email,
    provider,
    avatar: name.charAt(0).toUpperCase(),
    loginTime: Date.now()
  }));

  // Create initial profile if no profiles exist
  const profilesKey = 'cineverse_profiles';
  const profiles = JSON.parse(localStorage.getItem(profilesKey) || '[]');
  if (profiles.length === 0) {
    const defaultProf = {
      id: 'prof_' + Date.now().toString(36),
      name: name.split(' ')[0] || 'User',
      avatarIndex: 0,
      isKids: false,
      createdAt: Date.now()
    };
    localStorage.setItem(profilesKey, JSON.stringify([defaultProf]));
    localStorage.setItem('cineverse_active_profile', JSON.stringify(defaultProf));
  }

  window.location.hash = '#/';
  window.location.reload();
}

function showError(el, msg) {
  el.textContent = msg;
  el.style.display = 'block';
  el.classList.add('shake');
  setTimeout(() => el.classList.remove('shake'), 500);
}
