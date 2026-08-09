/**
 * IQ Edu Solutions - Main Javascript
 * Handles responsive navigation, scroll animations, 
 * GSAP ScrollTrigger center card stack carousel (hiired-inspired path),
 * standard FAQ accordion toggles, and WhatsApp form submission.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Force browser scroll position to top on load/reload
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);

  initHeaderScroll();
  initMobileMenu();
  initDirectRedirections(); // All internal link redirections jump directly without lag
  initLogoModal();          // Clickable logo lightbox modal (centered on desktop & mobile)
  initServiceCardStack();
  initFaqAccordion();
  initScrollReveal();
  initContactForm();        // Form submission generates automated WhatsApp pre-filled text
});

/**
 * Changes header background when user scrolls down
 */
function initHeaderScroll() {
  const header = document.getElementById('header');
  const scrollThreshold = 50;

  window.addEventListener('scroll', () => {
    if (window.scrollY > scrollThreshold) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

/**
 * Direct, instant redirections for ALL anchor links (#hero, #services, #why-choose-us, #contact, #faqs).
 * Eliminates backward/forward scrolling lag over sticky sections.
 */
function initDirectRedirections() {
  const allLinks = document.querySelectorAll('a[href^="#"]');

  allLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      // Don't intercept logo click (handled by lightbox modal)
      if (link.classList.contains('logo-link') || link.classList.contains('footer-logo')) {
        return;
      }

      const targetId = link.getAttribute('href').slice(1);
      if (!targetId) return;

      const target = document.getElementById(targetId);
      if (!target) return;

      e.preventDefault();

      // Close mobile menu if open
      const mobileToggle = document.getElementById('mobile-toggle');
      const navMenu = document.getElementById('nav-menu');
      if (mobileToggle && navMenu) {
        mobileToggle.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
      }

      // Jump directly to section — no backward scrolling lag
      target.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
  });
}

/**
 * Clickable logo lightbox modal: opens enlarged logo image in a centered popup
 * on both desktop and mobile viewports.
 */
function initLogoModal() {
  const logoLinks = document.querySelectorAll('.logo-link, .footer-logo');
  const modal = document.getElementById('logo-modal');
  const closeBtn = document.getElementById('logo-modal-close');
  const backdrop = modal ? modal.querySelector('.logo-modal-backdrop') : null;

  if (!modal) return;

  function openModal(e) {
    e.preventDefault();
    e.stopPropagation();
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  logoLinks.forEach(link => {
    link.addEventListener('click', openModal);
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (backdrop) backdrop.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
}

/**
 * Handles mobile hamburger menu toggle and page links click events
 */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-item a');

  // Toggle menu when clicking hamburger
  toggleBtn.addEventListener('click', () => {
    toggleBtn.classList.toggle('active');
    navMenu.classList.toggle('active');
    
    // Prevent scrolling behind mobile menu when open
    if (navMenu.classList.contains('active')) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  });

  // Close menu when clicking a navigation link
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      toggleBtn.classList.remove('active');
      navMenu.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
}

/**
 * GSAP + ScrollTrigger Card Stacking Scroll Animation (hiired-inspired)
 * Handles center aligned square cards with flight paths (lift up, fly over, land behind)
 */
function initServiceCardStack() {
  const container = document.querySelector('.services-sticky-container');
  const cards     = document.querySelectorAll('.stack-card');

  if (!container || cards.length === 0) return;

  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.warn('GSAP or ScrollTrigger not loaded.');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const totalCards = cards.length; // 7

  /* ── Initial state: ALL cards hidden, stacked bottom-right ── */
  gsap.set(cards, {
    x: 40, y: 40,
    scale: 0.82,
    opacity: 0,
    zIndex: 10,
    rotation: 0,
    transformOrigin: 'center center'
  });

  /* ── Prime first 3 visible shingle slots ── */
  gsap.set(cards[0], { x: 0,  y: 0,  scale: 1,    opacity: 1,    zIndex: 100 });
  gsap.set(cards[1], { x: 12, y: 12, scale: 0.94, opacity: 0.97, zIndex: 90  });
  gsap.set(cards[2], { x: 24, y: 24, scale: 0.88, opacity: 0.90, zIndex: 80  });

  /*
   * Timeline layout — 4 units per card swap:
   *   [base+0   … base+1.5] → HOLD  (front card fully readable, no motion)
   *   [base+1.5 … base+2.7] → LIFT  (card A arcs up and left)
   *   [base+2.7 … base+3.5] → LAND  (card A drops behind stack)
   *   [base+1.5 … base+3.5] → B/C/D slide forward simultaneously
   *
   * 7 cards = 6 swaps × 4 units + 1.5 final hold = 25.5 total units
   * The sticky container height = SCROLL_PER_UNIT × totalUnits
   * SCROLL_PER_UNIT is set in CSS as --scroll-unit (150px)
   */
  const SWAP        = 4;    // timeline units per card swap
  const CARD_UNITS  = (totalCards - 1) * SWAP + 1.5; // 25.5 (6 swaps + final hold)
  const SLIDE_UNITS = window.innerWidth < 1024 ? 8.0 : 0; // mobile panel slide (1.5) + extended reading hold (6.5)
  const TOTAL_UNITS = CARD_UNITS + SLIDE_UNITS;       // 33.5 on mobile, 25.5 on desktop
  const PX_PER_UNIT = 150;
  const totalPx     = TOTAL_UNITS * PX_PER_UNIT;      // 5025px mobile, 3825px desktop

  // Set container height exactly — no blank leftover, no cut-off slide
  container.style.height = totalPx + 'px';

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '.services-sticky-container',
      start:   () => 'top top+=' + (document.getElementById('header').offsetHeight || 72),
      end:     () => '+=' + totalPx,
      scrub:   1.5,
      invalidateOnRefresh: true
    }
  });

  for (let i = 0; i < totalCards - 1; i++) {
    const base  = i * SWAP;
    const cardA = cards[i];       // exits — lifts and lands behind
    const cardB = cards[i + 1];  // becomes new front
    const cardC = cards[i + 2];  // moves to shingle pos 1
    const cardD = cards[i + 3];  // moves to shingle pos 2

    /* HOLD — keep front card fully still so it is readable */
    tl.to(cardA, { opacity: 1, duration: 1.5, ease: 'none' }, base);

    /* CARD A — Phase 1: Lift and arc left */
    tl.to(cardA, {
      y: -250, x: -65,
      scale: 1.04, rotation: -10, opacity: 0.85,
      duration: 1.2, ease: 'power2.out'
    }, base + 1.5);

    /* CARD A — Phase 2: Drop behind the stack */
    tl.to(cardA, {
      y: 40, x: 40,
      scale: 0.82, rotation: 0, opacity: 0,
      duration: 0.8, ease: 'power2.in',
      onStart:           () => gsap.set(cardA, { zIndex: 10  }),
      onReverseComplete: () => gsap.set(cardA, { zIndex: 100 })
    }, base + 2.7);

    /* CARD B — Slide to front */
    tl.to(cardB, {
      x: 0, y: 0, scale: 1, opacity: 1,
      duration: 2.0, ease: 'power2.inOut',
      onStart:           () => gsap.set(cardB, { zIndex: 100 }),
      onReverseComplete: () => gsap.set(cardB, { zIndex: 90  })
    }, base + 1.5);

    /* CARD C — Move to shingle pos 1 */
    if (cardC) {
      tl.to(cardC, {
        x: 12, y: 12, scale: 0.94, opacity: 0.97,
        duration: 2.0, ease: 'power2.inOut',
        onStart:           () => gsap.set(cardC, { zIndex: 90 }),
        onReverseComplete: () => gsap.set(cardC, { zIndex: 80 })
      }, base + 1.5);
    }

    /* CARD D — Fade into shingle pos 2 */
    if (cardD) {
      tl.to(cardD, {
        x: 24, y: 24, scale: 0.88, opacity: 0.90,
        duration: 2.0, ease: 'power2.inOut',
        onStart:           () => gsap.set(cardD, { zIndex: 80 }),
        onReverseComplete: () => gsap.set(cardD, { zIndex: 10 })
      }, base + 1.5);
    }
  }

  /* ── Final hold: card 7 stays fully visible at the front ── */
  const lastBase = (totalCards - 1) * SWAP;
  tl.to(cards[totalCards - 1], { opacity: 1, duration: 1.5, ease: 'none' }, lastBase);

  /* ── Mobile only: after ALL 7 cards finish, slide the entire track up
     yPercent:-50 moves the 200%-tall track up by one full viewport screen,
     perfectly revealing the blue text panel beneath the card panel ── */
  if (window.innerWidth < 1024) {
    const slideAt = lastBase + 1.5;
    tl.to('.services-panels-track', {
      yPercent: -50,          // 50% of 200% height = one full viewport screen
      duration: 1.5,
      ease: 'power2.inOut'
    }, slideAt);

    // Extended hold on blue text panel so mobile user has ample time to read
    tl.to({}, { duration: 6.5 }, slideAt + 1.5);
  }
}

/**
 * Handles standard accordion expansion for the FAQ section.
 * Triggers toggling of the active class. Transitions are CSS-driven.
 */
function initFaqAccordion() {
  const faqTriggers = document.querySelectorAll('.faq-trigger');

  faqTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.faq-item');
      const isAlreadyActive = item.classList.contains('active');

      // Close all other active FAQ items to maintain page height
      document.querySelectorAll('.faq-item').forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
        }
      });

      // Toggle active state on current item
      if (isAlreadyActive) {
        item.classList.remove('active');
      } else {
        item.classList.add('active');
      }
    });
  });
}

/**
 * Uses IntersectionObserver to trigger premium fade-in animations on scroll
 */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal');
  
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(element => {
    revealObserver.observe(element);
  });
}

/**
 * Formats user input and redirects to WhatsApp (wa.me/919746105151)
 */
function initContactForm() {
  const form = document.getElementById('admission-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Fetch user inputs
    const studentName = document.getElementById('student-name').value.trim();
    const contactPhone = document.getElementById('contact-phone').value.trim();
    const studentGrade = document.getElementById('student-grade').value;
    const programInterest = document.getElementById('program-interest').value;
    const studentMessage = document.getElementById('student-message').value.trim();

    // Validate inputs
    if (!studentName || !contactPhone || !studentGrade || !programInterest) {
      alert('Please fill out all required fields.');
      return;
    }

    // Construct the formatted message for WhatsApp
    let waMessage = `*New Admission Inquiry - IQ Edu Solutions*\n\n`;
    waMessage += `• *Name:* ${studentName}\n`;
    waMessage += `• *Phone:* ${contactPhone}\n`;
    waMessage += `• *Grade/Class:* ${studentGrade}\n`;
    waMessage += `• *Program:* ${programInterest}\n`;
    
    if (studentMessage) {
      waMessage += `• *Message:* ${studentMessage}\n`;
    }

    // Target WhatsApp configuration
    const targetPhoneNumber = '919746105151';
    const encodedMessage = encodeURIComponent(waMessage);
    const whatsappUrl = `https://wa.me/${targetPhoneNumber}?text=${encodedMessage}`;

    // Reset the form
    form.reset();

    // Redirect user to WhatsApp chat link in a new tab
    window.open(whatsappUrl, '_blank');
  });
}
