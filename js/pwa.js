import { elements } from './ui.js';
import { showToast, lockScroll, trapFocus } from './utils.js';
import { INSTALL_KEY } from './constants.js';

export function setupPWA() {
  let deferredPrompt = null;
  
  // Initialize Focus Trap
  trapFocus(elements.iosInstallModal);

  // Check if already installed
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

  if (!isStandalone) {
    elements.headerInstallBtn.style.display = 'flex';
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });

  window.addEventListener('appinstalled', () => {
    if (window.__flashping_installed_shown) return;
    window.__flashping_installed_shown = true;
    showToast('FlashPing installed successfully! <a href="." target="_blank" style="color: var(--accent); font-weight: 700; text-decoration: underline; margin-left: 8px; display: inline-flex; align-items: center; gap: 4px;">Open App <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="display: inline-block; vertical-align: -1px; opacity: 0.95;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg></a>');
    elements.headerInstallBtn.style.display = 'none';
    deferredPrompt = null;
  });

  elements.headerInstallBtn.addEventListener('click', () => {
    // Dynamic OS detection and section filtering
    const ua = window.navigator.userAgent.toLowerCase();
    const isAndroid = /android/.test(ua);
    const isIOS = /iphone|ipad|ipod/.test(ua);
    const isMac = /macintosh|mac os x/.test(ua) && !isIOS;
    const isWindows = /windows/.test(ua);

    const androidSec = document.getElementById('pwaAndroidSection');
    const windowsSec = document.getElementById('pwaWindowsSection');
    const appleSec = document.getElementById('pwaAppleSection');
    const toggleBtn = document.getElementById('pwaToggleAllBtn');

    // Hide/show the native install buttons based on exact OS
    const androidBtn = androidSec ? androidSec.querySelector('.pwa-install-btn') : null;
    const windowsBtn = windowsSec ? windowsSec.querySelector('.pwa-install-btn') : null;

    if (androidBtn) androidBtn.style.display = isAndroid ? 'flex' : 'none';
    if (windowsBtn) windowsBtn.style.display = isWindows ? 'flex' : 'none';

    // Reset default states
    if (androidSec) androidSec.style.display = 'none';
    if (windowsSec) windowsSec.style.display = 'none';
    if (appleSec) appleSec.style.display = 'none';
    
    if (toggleBtn) {
      toggleBtn.style.display = 'inline-block';
      toggleBtn.textContent = 'Show instructions for other platforms';
      toggleBtn.setAttribute('data-expanded', 'false');
    }

    if (isAndroid) {
      if (androidSec) androidSec.style.display = 'flex';
    } else if (isIOS || isMac) {
      if (appleSec) appleSec.style.display = 'flex';
    } else if (isWindows) {
      if (windowsSec) windowsSec.style.display = 'flex';
    } else {
      // Fallback: if not explicitly detected, show all by default and hide the toggle
      if (androidSec) androidSec.style.display = 'flex';
      if (windowsSec) windowsSec.style.display = 'flex';
      if (appleSec) appleSec.style.display = 'flex';
      if (toggleBtn) toggleBtn.style.display = 'none';
      
      // In fallback, show both install buttons
      if (androidBtn) androidBtn.style.display = 'flex';
      if (windowsBtn) windowsBtn.style.display = 'flex';
    }

    // Always show the unified install instructions modal first
    elements.iosInstallModal.classList.add('show');
    lockScroll(true);
    setTimeout(() => elements.iosClose.focus(), 100);
  });

  const toggleBtn = document.getElementById('pwaToggleAllBtn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const androidSec = document.getElementById('pwaAndroidSection');
      const windowsSec = document.getElementById('pwaWindowsSection');
      const appleSec = document.getElementById('pwaAppleSection');

      const ua = window.navigator.userAgent.toLowerCase();
      const isAndroid = /android/.test(ua);
      const isIOS = /iphone|ipad|ipod/.test(ua);
      const isMac = /macintosh|mac os x/.test(ua) && !isIOS;
      const isWindows = /windows/.test(ua);

      const isExpanded = toggleBtn.getAttribute('data-expanded') === 'true';

      if (isExpanded) {
        // Hide other platforms
        if (androidSec) androidSec.style.display = isAndroid ? 'flex' : 'none';
        if (windowsSec) windowsSec.style.display = isWindows ? 'flex' : 'none';
        if (appleSec) appleSec.style.display = (isIOS || isMac) ? 'flex' : 'none';

        toggleBtn.textContent = 'Show instructions for other platforms';
        toggleBtn.setAttribute('data-expanded', 'false');
      } else {
        // Show other platforms
        if (androidSec) androidSec.style.display = 'flex';
        if (windowsSec) windowsSec.style.display = 'flex';
        if (appleSec) appleSec.style.display = 'flex';

        toggleBtn.textContent = 'Hide instructions for other platforms';
        toggleBtn.setAttribute('data-expanded', 'true');
      }
    });
  }

  document.querySelectorAll('.pwa-install-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (deferredPrompt) {
        // Browser supports native install PWA prompt
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          elements.headerInstallBtn.style.display = 'none';
          closeIos();
        }
        deferredPrompt = null;
      } else {
        // If no native PWA prompt is active/supported
        showToast('Open Google Chrome (Android/Desktop) or Safari (iOS) to install.');
      }
    });
  });

  // iOS Modal Handlers
  const closeIos = () => {
    elements.iosInstallModal.classList.remove('show');
    lockScroll(false);
  };
  elements.iosClose.addEventListener('click', closeIos);
  elements.iosOk.addEventListener('click', closeIos);
  elements.iosInstallModal.addEventListener('click', (e) => {
    if (e.target === elements.iosInstallModal) closeIos();
  });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    });
  }
}
