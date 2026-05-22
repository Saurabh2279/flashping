import { elements } from './ui.js';
import { cleanPhone, showToast, toDigits, lockScroll, trapFocus, capitalizeName, showConfirm } from './utils.js';
import { COUNTRIES, THEME_KEY } from './constants.js';
import {
  saveRecent,
  getRecents,
  deleteRecent,
  addSavedContact,
  updateSavedContact,
  deleteSavedContact,
  getSaved,
  clearAllRecents,
} from './storage.js';
import { renderRecents, renderSaved, renderCountries } from './renderers.js';

let currentCountry = COUNTRIES.find((c) => c.iso === 'IN');
let editingContactId = null;
let activeTagFilter = 'all';
let selectionMode = false;
let selectedIds = new Set();

export function setupHandlers() {
  // Initialize Focus Traps
  trapFocus(elements.contactModal);
  trapFocus(elements.legalModal);
  trapFocus(elements.feedbackModal);
  trapFocus(elements.tipModal);
  trapFocus(elements.confirmModal);

  // Theme Toggle
  elements.themeToggle.addEventListener('click', () => {
    const c = document.documentElement.getAttribute('data-theme');
    const n = c === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', n);
    localStorage.setItem(THEME_KEY, n);
  });

  // Country Picker logic
  elements.countryPickerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    elements.countryPicker.classList.toggle('open');
    if (elements.countryPicker.classList.contains('open')) {
      elements.countrySearch.value = '';
      renderCountries();
    }
  });

  elements.countrySearch.addEventListener('input', () =>
    renderCountries(elements.countrySearch.value)
  );

  elements.countryList.addEventListener('click', (e) => {
    const item = e.target.closest('.country-item');
    if (item && item.dataset.iso) {
      const c = COUNTRIES.find((x) => x.iso === item.dataset.iso);
      if (c) {
        currentCountry = c;
        elements.selectedFlag.textContent = c.flag;
        elements.selectedCode.textContent = c.code;
        elements.countryPicker.classList.remove('open');
        elements.phoneInput.focus();
      }
    }
  });

  document.addEventListener('click', (e) => {
    if (!elements.countryPicker.contains(e.target)) {
      elements.countryPicker.classList.remove('open');
    }
  });

  // Phone Cleaning
  elements.phoneInput.addEventListener('input', () => {
    elements.phoneInput.value = cleanPhone(elements.phoneInput.value);
  });

  // Message Auto-expand & Char Count
  elements.messageInput.addEventListener('input', () => {
    // Auto-expand
    elements.messageInput.style.height = '56px';
    elements.messageInput.style.height = elements.messageInput.scrollHeight + 'px';

    const l = elements.messageInput.value.length;
    elements.charCount.textContent = `${l} / 1000`;
    if (l > 1000) {
      elements.messageInput.value = elements.messageInput.value.slice(0, 1000);
      elements.charCount.textContent = '1000 / 1000';
    }
  });

  // Send Logic
  elements.sendBtn.addEventListener('click', () => {
    const raw = cleanPhone(elements.phoneInput.value);
    if (!raw) {
      showToast('Please enter a phone number');
      elements.phoneInput.focus();
      return;
    }
    const dc = toDigits(currentCountry.code);
    let url = `https://wa.me/${dc}${toDigits(raw)}`;
    const msg = elements.messageInput.value.trim();
    if (msg) url += `?text=${encodeURIComponent(msg)}`;

    saveRecent({
      flag: currentCountry.flag,
      code: currentCountry.code,
      number: raw,
      name: capitalizeName(elements.nameInput.value.trim()),
      timestamp: Date.now(),
    });

    renderRecents();
    window.open(url, '_blank');
    showToast('Opening WhatsApp...');

    // Clear input fields
    elements.phoneInput.value = '';
    elements.nameInput.value = '';
    elements.messageInput.value = '';
    elements.messageInput.style.height = '56px';
    elements.charCount.textContent = '0 / 1000';
    elements.validationMsg.textContent = '';
  });


  // Clear Logic
  elements.clearBtn.addEventListener('click', () => {
    elements.phoneInput.value = '';
    elements.nameInput.value = '';
    elements.messageInput.value = '';
    elements.messageInput.style.height = '56px';
    elements.charCount.textContent = '0 / 1000';
    elements.validationMsg.textContent = '';
    showToast('Fields cleared');
  });

  // Share App
  elements.shareAppBtn.addEventListener('click', async () => {
    const d = {
      title: 'FlashPing',
      text: 'Send WhatsApp messages instantly without saving contacts. 100% private.',
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(d);
      } catch { }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        showToast('Link copied!');
      } catch {
        showToast('Sharing not supported');
      }
    }
  });

  // View Switching (Header Nav)
  elements.headerNav.addEventListener('click', (e) => {
    const link = e.target.closest('.nav-link');
    if (!link) return;
    const viewName = link.dataset.view; // 'chat', 'recents', or 'saved'
    switchView(viewName);
  });

  // --- Smart Back Button Logic ---
  window.addEventListener('popstate', (e) => {
    if (elements.contactModal.classList.contains('show')) {
      closeModal(false);
      return;
    }
    if (elements.legalModal.classList.contains('show')) {
      elements.legalModal.classList.remove('show');
      return;
    }
    if (elements.feedbackModal.classList.contains('show')) {
      elements.feedbackModal.classList.remove('show');
      return;
    }


    if (e.state && e.state.view) {
      switchView(e.state.view, true, false);
    } else {
      switchView('chat', true, false);
    }
  });

  function switchView(viewName, save = true, push = true) {
    const panels = { chat: 'chatPanel', recents: 'recentsPanel', saved: 'savedPanel' };
    const panelId = panels[viewName];
    if (!panelId) return;

    if (save) localStorage.setItem('dc-active-view', viewName);
    if (push && viewName !== 'chat') {
      history.pushState({ view: viewName }, '');
    }

    document.querySelectorAll('.nav-link').forEach((l) => l.classList.remove('active'));
    const activeLink = document.querySelector(`.nav-link[data-view="${viewName}"]`);
    if (activeLink) activeLink.classList.add('active');

    document.querySelectorAll('.view-panel').forEach((p) => p.classList.remove('active'));
    const panel = document.getElementById(panelId);
    if (panel) panel.classList.add('active');

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Restore Last View on Load
  const savedView = localStorage.getItem('dc-active-view');
  if (savedView && savedView !== 'chat') {
    switchView(savedView, false, false);
  }

  // Recents Actions
  elements.recentsList.addEventListener('click', async (e) => {
    const del = e.target.closest('[data-del]');
    if (del) {
      const ok = await showConfirm('Delete Contact', 'Are you sure you want to delete this contact? This action cannot be undone.', 'Delete', 'Cancel');
      if (!ok) return;
      deleteRecent(+del.dataset.del);
      renderRecents();
      showToast('Contact deleted');
      return;
    }
    const chat = e.target.closest('[data-chat]');
    if (chat) {
      const r = getRecents()[+chat.dataset.chat];
      if (r) {
        const fullNumber = toDigits(r.code + r.number);
        window.open(`https://wa.me/${fullNumber}`, '_blank');
      }
      return;
    }
    const save = e.target.closest('[data-save]');
    if (save) {
      const r = getRecents()[+save.dataset.save];
      if (r) {
        const fullPhone = r.code.startsWith('+') ? r.code + r.number : '+' + r.code + r.number;
        openModal({ name: r.name || '', phone: fullPhone });
      }
      return;
    }
    const item = e.target.closest('.recent-item');
    if (item) {
      const r = getRecents()[+item.dataset.index];
      if (r) {
        const c = COUNTRIES.find((x) => x.code === r.code);
        if (c) {
          currentCountry = c;
          elements.selectedFlag.textContent = c.flag;
          elements.selectedCode.textContent = c.code;
        }
        elements.phoneInput.value = r.number;
        elements.nameInput.value = r.name || '';
        elements.phoneInput.focus();
        showToast('Number loaded');
      }
    }
  });

  elements.clearRecents.addEventListener('click', async () => {
    const ok = await showConfirm('Clear Recents', 'Are you sure you want to clear all recent numbers? This action cannot be undone.', 'Clear All', 'Cancel');
    if (!ok) return;
    clearAllRecents();
    renderRecents();
    showToast('Recents cleared');
  });

  // Saved Contacts Toolbar
  elements.savedSearch.addEventListener('input', () => renderSaved(activeTagFilter, selectionMode, selectedIds));

  elements.tagFilters.addEventListener('click', (e) => {
    const btn = e.target.closest('.tag-filter');
    if (btn) {
      activeTagFilter = btn.dataset.filter;
      renderSaved(activeTagFilter, selectionMode, selectedIds);
    }
  });

  // Selection Mode Logic
  function enterSelectionMode() {
    selectionMode = true;
    elements.bulkActions.style.display = 'flex';
    updateExportLabel();
    renderSaved(activeTagFilter, selectionMode, selectedIds);
  }

  function exitSelectionMode() {
    selectionMode = false;
    selectedIds.clear();
    elements.bulkActions.style.display = 'none';
    updateExportLabel();
    renderSaved(activeTagFilter, selectionMode, selectedIds);
  }

  elements.selectAllBtn.addEventListener('click', () => {
    const list = getSaved();
    list.forEach(c => selectedIds.add(c.id));
    updateExportLabel();
    renderSaved(activeTagFilter, selectionMode, selectedIds);
  });

  elements.clearAllSelectedBtn.addEventListener('click', () => {
    selectedIds.clear();
    updateExportLabel();
    renderSaved(activeTagFilter, selectionMode, selectedIds);
  });

  elements.cancelSelectionBtn.addEventListener('click', exitSelectionMode);

  function updateExportLabel() {
    const btn = elements.exportContactsBtn;
    const span = btn.querySelector('span');
    const countText = elements.selectedCountText;

    if (selectionMode) {
      countText.textContent = `${selectedIds.size} selected`;
      if (selectedIds.size > 0) {
        span.textContent = `Export (${selectedIds.size}) Contacts`;
        btn.classList.add('highlight');
      } else {
        span.textContent = 'Select Contacts';
        btn.classList.remove('highlight');
      }
    } else {
      span.textContent = 'Export Contacts';
      btn.classList.remove('highlight');
    }
  }

  // Saved List Actions
  elements.savedList.addEventListener('click', async (e) => {
    const chat = e.target.closest('[data-schat]');
    if (chat) {
      const c = getSaved().find((x) => x.id === chat.dataset.schat);
      if (c) window.open(`https://wa.me/${toDigits(c.phone)}`, '_blank');
      return;
    }
    const edit = e.target.closest('[data-sedit]');
    if (edit) {
      const c = getSaved().find((x) => x.id === edit.dataset.sedit);
      if (c) openModal(c, c.id);
      return;
    }
    const del = e.target.closest('[data-sdel]');
    if (del) {
      const ok = await showConfirm('Delete Contact', 'Are you sure you want to delete this contact? This action cannot be undone.', 'Delete', 'Cancel');
      if (!ok) return;
      deleteSavedContact(del.dataset.sdel);
      renderSaved(activeTagFilter, selectionMode, selectedIds);
      showToast('Contact deleted');
      return;
    }
    const sel = e.target.closest('[data-sel]') || (selectionMode ? e.target.closest('.saved-item') : null);
    if (selectionMode && sel) {
      const id = sel.dataset.id || sel.dataset.sel;
      if (selectedIds.has(id)) selectedIds.delete(id);
      else selectedIds.add(id);
      updateExportLabel();
      renderSaved(activeTagFilter, selectionMode, selectedIds);
    }
  });

  // Modal actions
  const openModal = (data = null) => {
    editingContactId = data?.id || null;
    elements.modalTitle.textContent = editingContactId ? 'Edit Contact' : 'Add Contact';
    elements.modalName.value = data?.name || '';
    elements.modalPhone.value = data?.phone || '';
    elements.modalTag.value = data?.tag || '';
    elements.contactModal.classList.add('show');
    lockScroll(true);
    history.pushState({ modal: true }, '');
    setTimeout(() => elements.modalClose.focus(), 100);
  };

  const closeModal = (back = true) => {
    elements.contactModal.classList.remove('show');
    lockScroll(false);
    elements.modalName.value = '';
    elements.modalPhone.value = '';
    elements.modalTag.value = '';
    editingContactId = null;
    if (back && window.history.state?.modal) history.back();
  };

  elements.addContactBtn.addEventListener('click', () => openModal());
  elements.modalClose.addEventListener('click', closeModal);
  elements.modalCancel.addEventListener('click', closeModal);
  elements.contactModal.addEventListener('click', (e) => {
    if (e.target === elements.contactModal) closeModal();
  });
  elements.tagSuggestions.addEventListener('click', (e) => {
    const btn = e.target.closest('.tag-sug');
    if (btn) elements.modalTag.value = btn.dataset.tag;
  });

  elements.modalPhone.addEventListener('input', () => {
    elements.modalPhone.value = cleanPhone(elements.modalPhone.value);
  });

  elements.modalSave.addEventListener('click', () => {
    const name = capitalizeName(elements.modalName.value.trim());
    const phone = cleanPhone(elements.modalPhone.value);
    if (!name || !phone) {
      showToast('Name and phone required');
      return;
    }
    const data = {
      name,
      phone,
      tag: elements.modalTag.value.trim(),
    };
    if (editingContactId) {
      updateSavedContact(editingContactId, data);
      showToast('Contact updated');
    } else {
      addSavedContact(data);
      showToast('Contact saved');
    }
    closeModal();
    renderSaved(activeTagFilter);
  });


  // Export
  elements.exportContactsBtn.addEventListener('click', () => {
    const all = getSaved();
    if (!all.length) {
      showToast('No contacts to export');
      return;
    }

    if (!selectionMode) {
      enterSelectionMode();
      return;
    }

    let list = getSaved();
    if (selectedIds.size > 0) {
      list = list.filter(c => selectedIds.has(c.id));
    } else {
      showToast('Please select at least one contact');
      return;
    }

    let vcf = list
      .map(
        (c) =>
          `BEGIN:VCARD\nVERSION:3.0\nFN:${c.name}\nTEL;TYPE=CELL:${c.phone}${c.tag ? `\nCATEGORIES:${c.tag}` : ''}\nEND:VCARD`
      )
      .join('\n');
    const blob = new Blob([vcf], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flashping-contacts.vcf';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Contacts exported');
    exitSelectionMode();
  });

  // Import Contacts (vCard)
  const importInput = document.getElementById('importFileInput');
  const importBtn = document.getElementById('importContactsBtn');
  if (importBtn && importInput) {
    importBtn.addEventListener('click', () => importInput.click());
    importInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target.result;
        const cards = text.split('BEGIN:VCARD').filter(Boolean);
        let imported = 0;
        cards.forEach(card => {
          const fnMatch = card.match(/FN[^:]*:(.*)/i);
          const telMatch = card.match(/TEL[^:]*:(.*)/i);
          const catMatch = card.match(/CATEGORIES[^:]*:(.*)/i);
          if (fnMatch && telMatch) {
            const name = fnMatch[1].trim();
            const phone = telMatch[1].trim();
            const tag = catMatch ? catMatch[1].trim() : '';
            if (name && phone) {
              addSavedContact({ name, phone, tag });
              imported++;
            }
          }
        });
        renderSaved(activeTagFilter);
        showToast(`${imported} contact${imported !== 1 ? 's' : ''} imported`);
      };
      reader.readAsText(file);
      importInput.value = ''; // Reset for re-import
    });
  }

  // Legal Modal Handlers
  const openLegal = () => {
    elements.legalModal.classList.add('show');
    lockScroll(true);
    setTimeout(() => elements.legalClose.focus(), 100);
  };
  const closeLegal = () => {
    elements.legalModal.classList.remove('show');
    lockScroll(false);
  };

  elements.legalBtn.addEventListener('click', openLegal);
  elements.legalClose.addEventListener('click', closeLegal);
  elements.legalOk.addEventListener('click', closeLegal);
  elements.legalModal.addEventListener('click', (e) => {
    if (e.target === elements.legalModal) closeLegal();
  });

  // Feedback Modal Handlers
  const openFeedback = () => {
    elements.feedbackModal.classList.add('show');
    lockScroll(true);
    setTimeout(() => elements.feedbackClose.focus(), 100);
  };
  const closeFeedback = () => {
    elements.feedbackModal.classList.remove('show');
    lockScroll(false);
    elements.feedbackName.value = '';
    elements.feedbackText.value = '';
    elements.feedbackText.style.height = '56px';
  };

  elements.feedbackBtn.addEventListener('click', openFeedback);
  elements.feedbackClose.addEventListener('click', closeFeedback);
  elements.feedbackCancel.addEventListener('click', closeFeedback);
  elements.feedbackModal.addEventListener('click', (e) => {
    if (e.target === elements.feedbackModal) closeFeedback();
  });

  elements.feedbackSubmit.addEventListener('click', () => {
    const name = elements.feedbackName.value.trim() || 'Anonymous';
    const text = elements.feedbackText.value.trim();
    if (!text) {
      showToast('Please enter your feedback');
      return;
    }
    // Replace with your email
    const email = 'devsunny2297@gmail.com';
    const subject = `FlashPing Feedback from ${name}`;
    const body = encodeURIComponent(text);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    showToast('Opening email app...');
    closeFeedback();
  });

  // Feedback Auto-expand
  elements.feedbackText.addEventListener('input', () => {
    elements.feedbackText.style.height = '56px';
    elements.feedbackText.style.height = elements.feedbackText.scrollHeight + 'px';
  });

  // Tip Modal Handlers
  const openTip = () => {
    elements.tipModal.classList.add('show');
    lockScroll(true);
    setTimeout(() => elements.tipClose.focus(), 100);
  };
  const closeTip = () => {
    elements.tipModal.classList.remove('show');
    lockScroll(false);
  };

  elements.tipBtn.addEventListener('click', openTip);
  elements.tipClose.addEventListener('click', closeTip);
  elements.tipModal.addEventListener('click', (e) => {
    if (e.target === elements.tipModal) closeTip();
  });

  // Handle UPI Link clicks on Desktop/Windows
  const upiLink = document.querySelector('.promo-btn.support-btn[href^="upi://"]');
  if (upiLink) {
    upiLink.addEventListener('click', async (e) => {
      const ua = window.navigator.userAgent.toLowerCase();
      const isMobile = /android|iphone|ipad|ipod/.test(ua);
      if (!isMobile) {
        e.preventDefault();
        try {
          await navigator.clipboard.writeText('saurabhrjkmr22@okicici');
          showToast('UPI app not found');
        } catch {
          showToast('UPI app not found');
        }
      }
    });
  }
}
