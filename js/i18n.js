/* ============================================
   AEON HOME CARE - i18n Engine
   Handles language switching and persistence
   ============================================ */

(function () {
  'use strict';

  const STORAGE_KEY = 'aeon-lang';
  const DEFAULT_LANG = 'en';
  const SUPPORTED = ['en', 'vi', 'es', 'zh'];

  function getLang() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED.indexOf(stored) > -1) return stored;
    // Try browser language as fallback
    const browser = (navigator.language || 'en').toLowerCase().slice(0, 2);
    if (SUPPORTED.indexOf(browser) > -1) return browser;
    return DEFAULT_LANG;
  }

  function setLang(lang) {
    if (SUPPORTED.indexOf(lang) === -1) return;
    const isFirstSet = !localStorage.getItem(STORAGE_KEY);
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;

    // If user explicitly chose a language, reload the page so all dynamic
    // JS (letter-splitting, etc.) reinitializes cleanly with the new strings.
    // If this is first apply (no stored preference), just apply in place.
    if (isFirstSet) {
      applyTranslations(lang);
      updateSwitcherUI(lang);
    } else {
      window.location.reload();
    }
  }

  // Public API for explicit user selection
  function userSelectLang(lang) {
    if (SUPPORTED.indexOf(lang) === -1) return;
    localStorage.setItem(STORAGE_KEY, lang);
    window.location.reload();
  }

  function t(key, lang) {
    const dict = (typeof TRANSLATIONS !== 'undefined' && TRANSLATIONS[lang]) || {};
    return dict[key] || '';
  }

  function applyTranslations(lang) {
    // Translate elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      const key = el.getAttribute('data-i18n');
      const value = t(key, lang);
      if (value) {
        // Preserve child elements that have their own data-i18n
        const hasChildrenWithI18n = el.querySelector('[data-i18n]');
        if (!hasChildrenWithI18n) {
          el.textContent = value;
        }
      }
    });

    // Translate placeholder attributes
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      const key = el.getAttribute('data-i18n-placeholder');
      const value = t(key, lang);
      if (value) el.setAttribute('placeholder', value);
    });

    // Translate aria-label attributes
    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      const key = el.getAttribute('data-i18n-aria');
      const value = t(key, lang);
      if (value) el.setAttribute('aria-label', value);
    });

    // Translate title attributes
    document.querySelectorAll('[data-i18n-title]').forEach(function (el) {
      const key = el.getAttribute('data-i18n-title');
      const value = t(key, lang);
      if (value) el.setAttribute('title', value);
    });
  }

  function updateSwitcherUI(lang) {
    // Update active state on switcher buttons
    document.querySelectorAll('.lang-option').forEach(function (btn) {
      if (btn.getAttribute('data-lang') === lang) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update visible label on the trigger
    const trigger = document.querySelector('.lang-trigger-code');
    if (trigger) {
      trigger.textContent = lang.toUpperCase();
    }
  }

  function initSwitcher() {
    const trigger = document.querySelector('.lang-trigger');
    const dropdown = document.querySelector('.lang-dropdown');
    if (!trigger || !dropdown) return;

    // Toggle dropdown
    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      dropdown.classList.toggle('open');
      trigger.setAttribute('aria-expanded', dropdown.classList.contains('open'));
    });

    // Close when clicking outside
    document.addEventListener('click', function (e) {
      if (!dropdown.contains(e.target) && !trigger.contains(e.target)) {
        dropdown.classList.remove('open');
        trigger.setAttribute('aria-expanded', 'false');
      }
    });

    // Handle language selection
    document.querySelectorAll('.lang-option').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        const lang = btn.getAttribute('data-lang');
        userSelectLang(lang);
      });
    });
  }

  // Apply language on load (before DOMContentLoaded for less flicker)
  function init() {
    const lang = getLang();
    document.documentElement.lang = lang;
    applyTranslations(lang);
    updateSwitcherUI(lang);
    initSwitcher();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
