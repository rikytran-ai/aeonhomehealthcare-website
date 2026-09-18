/* ============================================
   AEON HOME HEALTH CARE - Main JS
   Nav interactions, scroll reveals, form
   ============================================ */

(function () {
  'use strict';

  /* --- Sticky header on scroll --- */
  const header = document.querySelector('.site-header');
  let lastScroll = 0;

  function handleScroll() {
    const scrollY = window.scrollY;
    if (scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    lastScroll = scrollY;
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  /* --- Mobile menu toggle --- */
  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', function () {
      menuToggle.classList.toggle('open');
      navMenu.classList.toggle('open');
      document.body.style.overflow = navMenu.classList.contains('open') ? 'hidden' : '';
    });

    // Close menu when clicking a link
    navMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        menuToggle.classList.remove('open');
        navMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* --- Split nav link text into letters for hover animation --- */
  function splitNavText() {
    const navLinkTexts = document.querySelectorAll('.nav-link-text');
    navLinkTexts.forEach(function (el) {
      // Skip if already split
      if (el.querySelector('.letter')) return;
      const text = el.textContent;
      el.textContent = '';
      [].forEach.call(text, function (char) {
        const span = document.createElement('span');
        span.className = 'letter';
        span.textContent = char === ' ' ? '\u00A0' : char;
        el.appendChild(span);
      });
    });
  }

  splitNavText();

  // Re-split after i18n language changes (i18n replaces textContent)
  // Watch nav link text changes via MutationObserver on the menu
  const navMenuEl = document.querySelector('.nav-menu');
  if (navMenuEl && 'MutationObserver' in window) {
    const observer = new MutationObserver(function () {
      splitNavText();
    });
    document.querySelectorAll('.nav-link-text').forEach(function (el) {
      observer.observe(el, { childList: true, characterData: true, subtree: true });
    });
  }

  /* --- Scroll reveal animations --- */
  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -60px 0px'
    });

    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // Fallback for older browsers
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* --- Smooth scroll for anchor links --- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId.length < 2) return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

  /* --- Contact form: opens visitor's email client with form data pre-filled --- */
  const contactForm = document.querySelector('#contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      // Read form values
      const data = {};
      const formData = new FormData(contactForm);
      formData.forEach(function (value, key) {
        data[key] = (value || '').toString().trim();
      });

      // Read the human-readable label for each select (not the value attribute)
      function selectedLabel(id) {
        const el = document.getElementById(id);
        if (!el || el.selectedIndex < 0) return '';
        const opt = el.options[el.selectedIndex];
        return opt ? opt.text : '';
      }

      // Build the email body in plain text
      const lines = [
        'New inquiry from aeonhomehealth.com',
        '====================================',
        '',
        'Name: ' + (data.name || '(not provided)'),
        'Phone: ' + (data.phone || '(not provided)'),
        'Email: ' + (data.email || '(not provided)'),
        '',
        'Asking on behalf of: ' + (selectedLabel('relationship') || '(not selected)'),
        'Type of help needed: ' + (selectedLabel('service') || '(not selected)'),
        'Medicaid plan: ' + (selectedLabel('medicaid') || '(not selected)'),
        '',
        'Message:',
        (data.message || '(no message)'),
        '',
        '------------------------------------',
        'Sent from the website contact form.'
      ];
      const body = lines.join('\r\n');

      const subject = 'New inquiry from ' + (data.name || 'website visitor');

      // Build mailto URL
      const mailto = 'mailto:care@aeonhomehealth.com'
        + '?subject=' + encodeURIComponent(subject)
        + '&body=' + encodeURIComponent(body);

      // Open the visitor's email client
      window.location.href = mailto;

      // Show the success message so the visitor knows something happened
      const success = document.querySelector('.form-success');
      if (success) {
        contactForm.style.display = 'none';
        success.classList.add('show');
        setTimeout(function () {
          success.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 200);
      }
    });
  }

  /* --- Active nav link based on current page --- */
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('.nav-link').forEach(function (link) {
    const href = link.getAttribute('href').replace(/\/$/, '') || '/';
    if (href === currentPath || (currentPath === '/' && href.endsWith('index.html'))) {
      link.classList.add('active');
    }
  });

  /* --- Magnetic effect on CTA buttons (subtle) --- */
  document.querySelectorAll('.btn-primary, .nav-cta').forEach(function (btn) {
    btn.addEventListener('mousemove', function (e) {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = 'translate(' + (x * 0.15) + 'px, ' + (y * 0.15 - 2) + 'px)';
    });

    btn.addEventListener('mouseleave', function () {
      btn.style.transform = '';
    });
  });

  /* --- Animated counter for stats (if any on page) --- */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.getAttribute('data-count'), 10);
          const duration = 1500;
          const start = performance.now();

          function tick(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(eased * target);
            if (progress < 1) requestAnimationFrame(tick);
          }

          requestAnimationFrame(tick);
          counterObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(function (c) { counterObserver.observe(c); });
  }

  /* --- Year in footer --- */
  const yearEl = document.querySelector('#current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();
