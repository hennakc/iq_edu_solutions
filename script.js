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
  initServiceCardCarousel(); // Interactive 3D Card Carousel with left & right navigation arrows
  initFaqAccordion();
  initScrollReveal();
  initStatCounter();        // Animated 15+ years counter on scroll
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
 * Interactive Arrow-Navigated 3D Card Carousel
 * Handles card navigation via Left/Right arrows, pagination dots, touch swiping, and keyboard shortcuts.
 */
function initServiceCardCarousel() {
  const cards = document.querySelectorAll('.brochure-card');
  const prevBtn = document.getElementById('card-prev');
  const nextBtn = document.getElementById('card-next');
  const dots = document.querySelectorAll('#carousel-dots .dot');
  const currentBadge = document.getElementById('carousel-current');
  const totalBadge = document.getElementById('carousel-total');
  const stage = document.querySelector('.services-cards-col');

  if (cards.length === 0 || !prevBtn || !nextBtn) return;

  let currentIndex = 0;
  const totalCards = cards.length;

  if (totalBadge) totalBadge.textContent = totalCards;

  function updateCarousel(newIndex) {
    currentIndex = (newIndex + totalCards) % totalCards;

    const prevIndex = (currentIndex - 1 + totalCards) % totalCards;
    const nextIndex = (currentIndex + 1) % totalCards;

    cards.forEach((card, idx) => {
      card.classList.remove('active', 'prev', 'next', 'hidden');

      if (idx === currentIndex) {
        card.classList.add('active');
      } else if (idx === prevIndex) {
        card.classList.add('prev');
      } else if (idx === nextIndex) {
        card.classList.add('next');
      } else {
        card.classList.add('hidden');
      }
    });

    // Update pagination dots
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentIndex);
    });

    // Update numerical counter badge
    if (currentBadge) {
      currentBadge.textContent = currentIndex + 1;
    }
  }

  // Event Listeners for Arrow Buttons
  prevBtn.addEventListener('click', (e) => {
    e.preventDefault();
    updateCarousel(currentIndex - 1);
  });

  nextBtn.addEventListener('click', (e) => {
    e.preventDefault();
    updateCarousel(currentIndex + 1);
  });

  // Event Listeners for Pagination Dots
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.getAttribute('data-index'), 10);
      if (!isNaN(idx)) updateCarousel(idx);
    });
  });

  // Keyboard Navigation when hovering or focusing the carousel area
  document.addEventListener('keydown', (e) => {
    const servicesSection = document.getElementById('services');
    if (!servicesSection) return;

    const rect = servicesSection.getBoundingClientRect();
    const isVisible = (rect.top < window.innerHeight && rect.bottom > 0);

    if (isVisible) {
      if (e.key === 'ArrowLeft') {
        updateCarousel(currentIndex - 1);
      } else if (e.key === 'ArrowRight') {
        updateCarousel(currentIndex + 1);
      }
    }
  });

  // Touch Swipe Support for Mobile Devices
  let touchStartX = 0;
  let touchEndX = 0;

  if (stage) {
    stage.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    stage.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });
  }

  function handleSwipe() {
    const swipeDistance = touchEndX - touchStartX;
    if (Math.abs(swipeDistance) > 40) {
      if (swipeDistance < 0) {
        updateCarousel(currentIndex + 1); // Swipe Left -> Next
      } else {
        updateCarousel(currentIndex - 1); // Swipe Right -> Prev
      }
    }
  }

  // Initialize first slide view
  updateCarousel(0);
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
 * Animated stat counter — numerates from 0 to target value when scrolled into view
 */
function initStatCounter() {
  const counter = document.getElementById('years-counter');
  if (!counter) return;

  const target = parseInt(counter.getAttribute('data-target'), 10);
  let hasAnimated = false;

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !hasAnimated) {
        hasAnimated = true;
        animateCounter(counter, 0, target, 1200);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counterObserver.observe(counter);
}

function animateCounter(el, start, end, duration) {
  const totalSteps = end - start;
  const stepDelay = duration / totalSteps; // time per tick
  let current = start;

  function tick() {
    current++;
    el.textContent = current;

    if (current < end) {
      setTimeout(tick, stepDelay);
    }
  }

  tick();
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
