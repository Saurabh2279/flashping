/**
 * Select element by ID shorthand
 */
export const $ = (id) => document.getElementById(id);

/**
 * Escape HTML to prevent XSS
 */
export function esc(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

/**
 * Format timestamp to "time ago" string
 */
export function timeAgo(ts) {
  const d = Date.now() - ts;
  const m = Math.floor(d / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return m + 'm ago';
  const h = Math.floor(m / 60);
  if (h < 24) return h + 'h ago';
  const dy = Math.floor(h / 24);
  if (dy < 7) return dy + 'd ago';
  return new Date(ts).toLocaleDateString();
}

/**
 * Show a toast notification
 * @param {string} msg - The message to display
 * @param {boolean} trusted - If true, msg is rendered as HTML (for internal messages only)
 */
let _toastTimer = null;
let _toastDismissHandler = null;

export function showToast(msg, trusted = false) {
  const toast = $('toast');
  if (_toastTimer) clearTimeout(_toastTimer);
  if (_toastDismissHandler) {
    document.removeEventListener('click', _toastDismissHandler);
    _toastDismissHandler = null;
  }

  // Clean the message by removing duplicate manual warning emojis if any
  let cleanMsg = msg.replace(/^[⚠✅📋💻🖥️\s]+/, '').trim();

  // Determine toast type
  let type = 'info';
  const lower = msg.toLowerCase();
  if (lower.includes('success') || lower.includes('saved') || lower.includes('updated') || lower.includes('imported') || lower.includes('installed')) {
    type = 'success';
  } else if (lower.includes('⚠') || lower.includes('please') || lower.includes('required') || lower.includes('not supported')) {
    type = 'warning';
  } else if (lower.includes('failed') || lower.includes('error')) {
    type = 'error';
  } else if (lower.includes('copied') || lower.includes('copy')) {
    type = 'copy';
  }

  // Icons
  const icons = {
    success: `<svg class="toast-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0"><polyline points="20 6 9 17 4 12"/></svg>`,
    warning: `<svg class="toast-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    error: `<svg class="toast-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    copy: `<svg class="toast-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,
    info: `<svg class="toast-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`
  };

  const iconSvg = icons[type];
  toast.className = `toast show toast-${type}`;

  if (trusted) {
    toast.innerHTML = `${iconSvg}<span class="toast-content">${cleanMsg}</span>`;
  } else {
    const textSpan = document.createElement('span');
    textSpan.className = 'toast-content';
    textSpan.textContent = cleanMsg;
    toast.innerHTML = iconSvg;
    toast.appendChild(textSpan);
  }

  // Dismiss on clicking outside the toast
  const handleOutsideClick = (e) => {
    if (!toast.contains(e.target)) {
      toast.classList.remove('show');
      if (_toastTimer) clearTimeout(_toastTimer);
      _toastTimer = null;
      document.removeEventListener('click', handleOutsideClick);
      _toastDismissHandler = null;
    }
  };

  _toastDismissHandler = handleOutsideClick;
  setTimeout(() => {
    if (toast.classList.contains('show') && _toastDismissHandler === handleOutsideClick) {
      document.addEventListener('click', handleOutsideClick);
    }
  }, 100);

  _toastTimer = setTimeout(() => {
    toast.classList.remove('show');
    document.removeEventListener('click', handleOutsideClick);
    _toastDismissHandler = null;
    _toastTimer = null;
  }, 5000);
}

/**
 * Strip non-numeric characters
 */
export function cleanPhone(v) {
  return v.replace(/[^\d+]/g, '');
}

/**
 * Strip everything except digits (for WhatsApp links)
 */
export function toDigits(v) {
  return v.replace(/\D/g, '');
}

/**
 * Prevent background scrolling
 */
export function lockScroll(lock) {
  document.body.classList.toggle('modal-open', lock);
}

/**
 * Trap focus within an element
 */
export function trapFocus(element) {
  const focusable = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  if (focusable.length === 0) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  element.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === first) {
        last.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === last) {
        first.focus();
        e.preventDefault();
      }
    }
  });
}

/**
 * Capitalize first letter of each word
 */
export function capitalizeName(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Format timestamp to localized Date and Time
 */
export function formatDateTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Show a themed confirmation modal
 * @returns {Promise<boolean>}
 */
export function showConfirm(title, message, okText = 'Confirm', cancelText = 'Cancel', isDanger = true) {
  return new Promise((resolve) => {
    const modal = $('confirmModal');
    const titleEl = $('confirmTitle');
    const msgEl = $('confirmMessage');
    const okBtn = $('confirmOk');
    const cancelBtn = $('confirmCancel');
    const closeBtn = $('confirmClose');

    titleEl.textContent = title;
    msgEl.textContent = message;
    okBtn.textContent = okText;
    cancelBtn.textContent = cancelText;

    if (isDanger) {
      okBtn.style.background = '#ef4444';
      okBtn.style.borderColor = '#ef4444';
    } else {
      okBtn.style.background = 'var(--accent)';
      okBtn.style.borderColor = 'var(--accent)';
    }

    modal.classList.add('show');
    lockScroll(true);

    const cleanup = (result) => {
      modal.classList.remove('show');
      lockScroll(false);
      okBtn.removeEventListener('click', onOk);
      cancelBtn.removeEventListener('click', onCancel);
      closeBtn.removeEventListener('click', onCancel);
      modal.removeEventListener('click', onOverlay);
      resolve(result);
    };

    function onOk() { cleanup(true); }
    function onCancel() { cleanup(false); }
    function onOverlay(e) { if (e.target === modal) cleanup(false); }

    okBtn.addEventListener('click', onOk);
    cancelBtn.addEventListener('click', onCancel);
    closeBtn.addEventListener('click', onCancel);
    modal.addEventListener('click', onOverlay);
  });
}
