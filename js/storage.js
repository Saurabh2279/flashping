import { RECENTS_KEY, SAVED_KEY, MAX_RECENTS } from './constants.js';

/**
 * Recents management
 */
export function getRecents() {
  try {
    return JSON.parse(localStorage.getItem(RECENTS_KEY)) || [];
  } catch {
    return [];
  }
}

export function saveRecent(entry) {
  const r = getRecents();
  const i = r.findIndex((x) => x.code === entry.code && x.number === entry.number);
  if (i > -1) r.splice(i, 1);
  r.unshift(entry);
  if (r.length > MAX_RECENTS) r.pop();
  localStorage.setItem(RECENTS_KEY, JSON.stringify(r));
}

export function deleteRecent(index) {
  const r = getRecents();
  r.splice(index, 1);
  localStorage.setItem(RECENTS_KEY, JSON.stringify(r));
}

export function clearAllRecents() {
  localStorage.removeItem(RECENTS_KEY);
}

/**
 * Saved Contacts management
 */
export function getSaved() {
  try {
    return JSON.parse(localStorage.getItem(SAVED_KEY)) || [];
  } catch {
    return [];
  }
}

export function setSaved(list) {
  localStorage.setItem(SAVED_KEY, JSON.stringify(list));
}

export function addSavedContact(contact) {
  const list = getSaved();
  contact.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  list.unshift(contact);
  setSaved(list);
  return contact;
}

export function updateSavedContact(id, data) {
  const list = getSaved();
  const i = list.findIndex((x) => x.id === id);
  if (i > -1) {
    list[i] = { ...list[i], ...data };
    setSaved(list);
  }
}

export function deleteSavedContact(id) {
  const list = getSaved().filter((x) => x.id !== id);
  setSaved(list);
}
