/**
 * Velour Atelier — app.js
 * Pure vanilla JS. No frameworks, no libraries.
 */

(function () {
  'use strict';

  /* =====================================================
     1. SMOOTH SCROLL — All anchor links
     ===================================================== */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      var headerHeight = document.getElementById('site-header').offsetHeight;
      var targetTop = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 16;
      window.scrollTo({ top: targetTop, behavior: 'smooth' });

      // Close mobile nav if open
      closeMobileNav();
    });
  });

  /* =====================================================
     2. STICKY HEADER — Scroll detection
     ===================================================== */
  var header = document.getElementById('site-header');

  function handleHeaderScroll() {
    if (window.pageYOffset > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleHeaderScroll, { passive: true });
  handleHeaderScroll(); // run once on load

  /* =====================================================
     3. MOBILE MENU TOGGLE
     ===================================================== */
  var mobileToggle = document.querySelector('.mobile-menu-toggle');
  var mobileNav = document.getElementById('mobile-nav');

  function closeMobileNav() {
    if (!mobileNav) return;
    mobileNav.classList.remove('open');
    mobileNav.setAttribute('aria-hidden', 'true');
    if (mobileToggle) {
      mobileToggle.classList.remove('open');
      mobileToggle.setAttribute('aria-expanded', 'false');
    }
  }

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', function () {
      var isOpen = mobileNav.classList.contains('open');
      if (isOpen) {
        closeMobileNav();
      } else {
        mobileNav.classList.add('open');
        mobileNav.setAttribute('aria-hidden', 'false');
        mobileToggle.classList.add('open');
        mobileToggle.setAttribute('aria-expanded', 'true');
      }
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (!header.contains(e.target)) {
        closeMobileNav();
      }
    });
  }

  /* =====================================================
     4. BEFORE / AFTER COMPARISON SLIDER
     ===================================================== */
  var comparison = document.getElementById('comparison');
  var divider = document.getElementById('comparison-divider');

  if (comparison && divider) {
    var isDragging = false;

    function clamp(val, min, max) {
      return Math.max(min, Math.min(max, val));
    }

    function getSplitFromEvent(e) {
      var rect = comparison.getBoundingClientRect();
      var clientX = e.touches ? e.touches[0].clientX : (e.clientX !== undefined ? e.clientX : e.pageX);
      var x = clientX - rect.left;
      var pct = (x / rect.width) * 100;
      return clamp(pct, 5, 95);
    }

    function updateSplit(pct) {
      comparison.style.setProperty('--split', pct);
      divider.setAttribute('aria-valuenow', Math.round(pct));
    }

    // Pointer events (mouse + pen + touch on modern browsers)
    divider.addEventListener('pointerdown', function (e) {
      isDragging = true;
      divider.setPointerCapture(e.pointerId);
      e.preventDefault();
    });

    comparison.addEventListener('pointermove', function (e) {
      if (!isDragging) return;
      updateSplit(getSplitFromEvent(e));
    });

    comparison.addEventListener('pointerup', function () { isDragging = false; });
    comparison.addEventListener('pointercancel', function () { isDragging = false; });

    // Click anywhere on the viewport to jump to that position
    comparison.addEventListener('pointerdown', function (e) {
      if (e.target === divider || divider.contains(e.target)) return;
      updateSplit(getSplitFromEvent(e));
    });

    // Touch fallback
    comparison.addEventListener('touchstart', function (e) {
      isDragging = true;
      e.preventDefault();
    }, { passive: false });

    comparison.addEventListener('touchmove', function (e) {
      if (!isDragging) return;
      updateSplit(getSplitFromEvent(e));
      e.preventDefault();
    }, { passive: false });

    comparison.addEventListener('touchend', function () { isDragging = false; });
    comparison.addEventListener('touchcancel', function () { isDragging = false; });

    // Keyboard accessibility
    divider.addEventListener('keydown', function (e) {
      var current = parseFloat(comparison.style.getPropertyValue('--split')) || 50;
      var step = e.shiftKey ? 10 : 5;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        updateSplit(clamp(current - step, 5, 95));
        e.preventDefault();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        updateSplit(clamp(current + step, 5, 95));
        e.preventDefault();
      }
    });

    // Initial position
    updateSplit(50);
  }

  /* =====================================================
     5. WORKFLOW TABS
     ===================================================== */
  var tabBtns = document.querySelectorAll('.tab-btn');
  var tabPanels = document.querySelectorAll('.tab-panel');

  function activateTab(btn) {
    // Deactivate all
    tabBtns.forEach(function (b) {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    tabPanels.forEach(function (p) {
      p.hidden = true;
      p.classList.remove('active');
      // Reset fade-in state so it animates again
      var fadeEl = p.querySelector('.fade-in');
      if (fadeEl) {
        fadeEl.classList.remove('is-visible');
      }
    });

    // Activate clicked
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');

    var panelId = btn.getAttribute('aria-controls');
    var panel = document.getElementById(panelId);
    if (panel) {
      panel.hidden = false;
      panel.classList.add('active');
      // Trigger fade-in after a short frame delay
      var fadeTarget = panel.querySelector('.fade-in');
      if (fadeTarget) {
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            fadeTarget.classList.add('is-visible');
          });
        });
      }
    }
  }

  tabBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      activateTab(btn);
    });

    // Keyboard nav
    btn.addEventListener('keydown', function (e) {
      var currentIndex = Array.from(tabBtns).indexOf(btn);
      var nextIndex;
      if (e.key === 'ArrowRight') {
        nextIndex = (currentIndex + 1) % tabBtns.length;
        tabBtns[nextIndex].focus();
        activateTab(tabBtns[nextIndex]);
        e.preventDefault();
      } else if (e.key === 'ArrowLeft') {
        nextIndex = (currentIndex - 1 + tabBtns.length) % tabBtns.length;
        tabBtns[nextIndex].focus();
        activateTab(tabBtns[nextIndex]);
        e.preventDefault();
      } else if (e.key === 'Home') {
        tabBtns[0].focus();
        activateTab(tabBtns[0]);
        e.preventDefault();
      } else if (e.key === 'End') {
        tabBtns[tabBtns.length - 1].focus();
        activateTab(tabBtns[tabBtns.length - 1]);
        e.preventDefault();
      }
    });
  });

  // Trigger initial active tab's fade-in
  var initialPanel = document.querySelector('.tab-panel.active');
  if (initialPanel) {
    var initialFade = initialPanel.querySelector('.fade-in');
    if (initialFade) {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          initialFade.classList.add('is-visible');
        });
      });
    }
  }

  /* =====================================================
     6. INTERSECTION OBSERVER — Fade-in on scroll
     ===================================================== */
  var fadeElements = document.querySelectorAll('.fade-in');

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            // Unobserve once visible (one-shot animation)
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '0px 0px -60px 0px',
        threshold: 0.1
      }
    );

    fadeElements.forEach(function (el) {
      // Skip elements inside tab panels that aren't active
      var parentPanel = el.closest('.tab-panel');
      if (parentPanel && parentPanel.hidden) return;
      observer.observe(el);
    });
  } else {
    // Fallback: show all immediately
    fadeElements.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

})();
