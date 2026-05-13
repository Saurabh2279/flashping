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

  elements.headerInstallBtn.addEventListener('click', async () => {
    if (deferredPrompt) {
      // Browser supports native install
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        showToast('Installing FlashPing...');
        elements.headerInstallBtn.style.display = 'none';
      }
      deferredPrompt = null;
    } else {
      // Show manual instructions (iOS/Other)
      elements.iosInstallModal.classList.add('show');
      lockScroll(true);
      setTimeout(() => elements.iosClose.focus(), 100);
    }
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
