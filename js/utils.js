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
 */
export function showToast(msg) {
  const toast = $('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
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
