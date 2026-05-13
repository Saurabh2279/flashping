import { elements } from './ui.js';
import { setupHandlers } from './handlers.js';
import { setupPWA } from './pwa.js';
import { renderRecents, renderSaved, renderCountries } from './renderers.js';
import { THEME_KEY } from './constants.js';

function initTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
}

function init() {
  // Ensure we start at the top on every load
  window.scrollTo(0, 0);

  // 1. Initial Styles
  initTheme();

  // 2. Initial Data Rendering
  renderCountries();
  renderRecents();
  renderSaved();

  // 3. Clear initial fields (prevent browser cache)
  elements.phoneInput.value = '';
  elements.nameInput.value = '';
  elements.messageInput.value = '';
  elements.charCount.textContent = '0 / 1000';

  // 4. Setup Logic
  setupHandlers();
  setupPWA();
}

// Run app
document.addEventListener('DOMContentLoaded', init);
