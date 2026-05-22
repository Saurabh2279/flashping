import { elements } from './ui.js';
import { esc, formatDateTime } from './utils.js';
import { getRecents, getSaved } from './storage.js';
import { COUNTRIES } from './constants.js';

export function renderCountries(filter = '') {
  const q = filter.toLowerCase();
  const f = COUNTRIES.filter(
    (c) => c.name.toLowerCase().includes(q) || c.code.includes(q)
  );
  elements.countryList.innerHTML = f.length
    ? f
        .map(
          (c) => `
    <li class="country-item" data-iso="${c.iso}">
      <span class="country-item-flag">${c.flag}</span>
      <span class="country-item-name">${esc(c.name)}</span>
      <span class="country-item-code">${esc(c.code)}</span>
    </li>`
        )
        .join('')
    : '<li class="country-item" style="justify-content:center;color:var(--text-muted);cursor:default">No results</li>';
}

export function renderRecents() {
  const r = getRecents();
  if (!r.length) {
    elements.recentsList.style.display = 'none';
    elements.recentsEmpty.style.display = 'flex';
    elements.clearRecents.style.display = 'none';
    elements.recentsCount.textContent = '0';
    elements.recentsCount.style.display = 'none';
    return;
  }
  elements.recentsList.style.display = 'flex';
  elements.recentsEmpty.style.display = 'none';
  elements.clearRecents.style.display = 'flex';
  elements.recentsCount.textContent = r.length;
  elements.recentsCount.style.display = 'flex';
  elements.recentsList.innerHTML = r
    .map(
      (x, i) => `
    <div class="recent-item" data-index="${i}" style="animation-delay:${i * 0.05}s">
      <span class="recent-item-flag">${x.flag}</span>
      <div class="recent-item-info">
        ${x.name ? `<div class="recent-name">${esc(x.name)}</div>` : ''}
        <div class="recent-item-number">${x.code} ${x.number}</div>
      </div>
      <span class="recent-item-time">${formatDateTime(x.timestamp)}</span>
      <div class="recent-actions">
        <button class="recent-item-action recent-item-chat" data-chat="${i}" title="Chat">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </button>
        <button class="recent-item-action recent-item-save" data-save="${i}" title="Save">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
          </svg>
        </button>
        <button class="recent-item-action recent-item-delete" data-del="${i}" title="Remove">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>`
    )
    .join('');
}

export function renderSaved(activeTagFilter = 'all', selectionMode = false, selectedIds = new Set()) {
  const all = getSaved();
  const q = elements.savedSearch.value.toLowerCase();
  let list = all;

  if (q) {
    list = list.filter(
      (c) =>
        (c.name || '').toLowerCase().includes(q) ||
        (c.phone || '').includes(q) ||
        (c.tag || '').toLowerCase().includes(q)
    );
  }

  if (activeTagFilter !== 'all') {
    list = list.filter((c) => (c.tag || '').toLowerCase() === activeTagFilter.toLowerCase());
  }

  renderTagFilters(all, activeTagFilter);
  
  const count = all.length;
  elements.savedCount.textContent = count;
  elements.savedCount.style.display = count > 0 ? 'flex' : 'none';

  if (elements.exportContactsBtn) {
    elements.exportContactsBtn.disabled = (count === 0);
  }

  if (!list.length) {
    elements.savedList.style.display = 'none';
    elements.savedEmpty.style.display = 'flex';
    return;
  }

  elements.savedList.style.display = 'flex';
  elements.savedEmpty.style.display = 'none';
  elements.savedList.innerHTML = list
    .map((c, i) => {
      // Find matching country for the flag
      const country = COUNTRIES.find(cnt => c.phone && c.phone.startsWith(cnt.code));
      const avatarHTML = country 
        ? `<div class="recent-item-flag">${country.flag}</div>` 
        : `<div class="recent-item-flag" style="display:grid; place-items:center; width:34px; height:34px; background:var(--bg-hover); border-radius:50%; margin: 0 4px;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" stroke-width="2" style="display:block"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>`;
      const isSelected = selectedIds.has(c.id);

      return `
    <div class="saved-item${isSelected ? ' selected' : ''}" data-id="${c.id}" style="animation-delay:${i * 0.04}s">
      ${selectionMode ? `
        <div class="saved-item-checkbox ${isSelected ? 'checked' : ''}" data-sel="${c.id}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
      ` : avatarHTML}
      <div class="saved-item-info">
        <div class="saved-item-name">${esc(c.name || 'Unknown')}</div>
        <div class="saved-item-number">${c.phone || ''}</div>
        ${c.tag ? `<span class="saved-item-tag">${esc(c.tag)}</span>` : ''}
      </div>
      <div class="saved-item-actions">
        ${selectionMode ? '' : `
        <button class="recent-item-action recent-item-chat" data-schat="${c.id}" title="Chat">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </button>
        <button class="recent-item-action recent-item-edit" data-sedit="${c.id}" title="Edit">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
        <button class="recent-item-action recent-item-delete" data-sdel="${c.id}" title="Delete">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>`}
      </div>
    </div>`;
    })
    .join('');
}

function renderTagFilters(all, activeTagFilter) {
  if (!all.length) {
    elements.tagFilters.innerHTML = '';
    return;
  }
  const tags = [...new Set(all.map((c) => c.tag).filter(Boolean))];
  elements.tagFilters.innerHTML =
    `<button class="tag-filter${activeTagFilter === 'all' ? ' active' : ''}" data-filter="all">All</button>` +
    tags
      .map(
        (t) =>
          `<button class="tag-filter${activeTagFilter === t ? ' active' : ''}" data-filter="${esc(
            t
          )}">${esc(t)}</button>`
      )
      .join('');
}
