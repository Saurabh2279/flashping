import { $ } from './utils.js';

/**
 * DOM Elements
 */
export const elements = {
  // Main Inputs
  phoneInput: $('phoneInput'),
  nameInput: $('nameInput'),
  messageInput: $('messageInput'),
  charCount: $('charCount'),
  sendBtn: $('sendBtn'),
  clearBtn: $('clearBtn'),
  shareAppBtn: $('shareAppBtn'),
  validationMsg: $('validationMsg'),
  themeToggle: $('themeToggle'),

  // Header Nav
  headerNav: document.querySelector('.header-nav'),
  headerInstallBtn: $('headerInstallBtn'),

  // Country Picker
  countryPicker: $('countryPicker'),
  countryPickerBtn: $('countryPickerBtn'),
  countrySearch: $('countrySearch'),
  countryList: $('countryList'),
  selectedFlag: $('selectedFlag'),
  selectedCode: $('selectedCode'),

  // Recents
  recentsList: $('recentsList'),
  recentsEmpty: $('recentsEmpty'),
  recentsCount: $('recentsCount'),
  clearRecents: $('clearRecents'),

  // Saved Contacts
  savedList: $('savedList'),
  savedEmpty: $('savedEmpty'),
  savedCount: $('savedCount'),
  savedSearch: $('savedSearch'),
  bulkActions: $('bulkActions'),
  selectAllBtn: $('selectAllBtn'),
  clearAllSelectedBtn: $('clearAllSelectedBtn'),
  cancelSelectionBtn: $('cancelSelectionBtn'),
  selectedCountText: $('selectedCountText'),
  addContactBtn: $('addContactBtn'),
  exportContactsBtn: $('exportContactsBtn'),
  tagFilters: $('tagFilters'),

  // Modal
  contactModal: $('contactModal'),
  modalTitle: $('modalTitle'),
  modalName: $('modalName'),
  modalPhone: $('modalPhone'),
  modalTag: $('modalTag'),
  modalSave: $('modalSave'),
  modalCancel: $('modalCancel'),
  modalClose: $('modalClose'),
  tagSuggestions: $('tagSuggestions'),
  
  // Legal Modal
  legalBtn: $('legalBtn'),
  legalModal: $('legalModal'),
  legalClose: $('legalClose'),
  legalOk: $('legalOk'),

  // iOS/Unified Install Modal
  iosInstallModal: $('iosInstallModal'),
  iosClose: $('iosClose'),
  iosOk: $('iosOk'),
  pwaInstallPromptBtn: $('pwaInstallPromptBtn'),

  // Feedback Modal
  feedbackBtn: $('feedbackBtn'),
  feedbackModal: $('feedbackModal'),
  feedbackClose: $('feedbackClose'),
  feedbackCancel: $('feedbackCancel'),
  feedbackSubmit: $('feedbackSubmit'),
  feedbackName: $('feedbackName'),
  feedbackText: $('feedbackText'),

  // Tip Modal
  tipBtn: $('tipBtn'),
  tipModal: $('tipModal'),
  tipClose: $('tipClose'),
  copyUpiBtn: $('copyUpiBtn'),
  upiIdField: $('upiIdField'),

  // Custom Confirm Modal
  confirmModal: $('confirmModal'),
  confirmTitle: $('confirmTitle'),
  confirmMessage: $('confirmMessage'),
  confirmOk: $('confirmOk'),
  confirmCancel: $('confirmCancel'),
  confirmClose: $('confirmClose'),
};
