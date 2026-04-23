'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initVideoPlayer();
  initChartBars();
  initJourneyReveal();
  initPresencePulse();
  initCTAButtons();
});

/* ========================================
   Adds navbar scroll shadow and highlights
   active section via IntersectionObserver.
   Smooth scrolls to nav link targets.
   ======================================== */
function initNavbar() {
  const navbar = document.querySelector('#navbar');
  const navLinks = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('[id]');

  // Add scroll shadow
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // IntersectionObserver for active nav link highlighting
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((link) => link.classList.remove('nav-active'));
          const activeLink = document.querySelector(
            `.nav-links a[href="#${entry.target.id}"]`
          );
          if (activeLink) {
            activeLink.classList.add('nav-active');
          }
        }
      });
    },
    { threshold: 0.4 }
  );

  sections.forEach((section) => {
    observer.observe(section);
  });

  // Smooth scroll on nav link click
  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const href = link.getAttribute('href');
      if (href.startsWith('#')) {
        const target = document.querySelector(href);
        if (target) {
          const targetPosition = target.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      }
    });
  });
}

/* ========================================
   Toggles mobile menu visibility.
   Closes menu on link click or outside click.
   Updates aria-expanded attribute.
   ======================================== */
function initMobileMenu() {
  const hamburger = document.querySelector('.nav-hamburger');
  const mobileMenu = document.querySelector('.nav-mobile-menu');
  const navbar = document.querySelector('#navbar');

  if (!hamburger || !mobileMenu) return;

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', hamburger.classList.contains('open'));
  });

  // Close menu on link click
  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  // Close menu on outside click
  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target) && mobileMenu.classList.contains('open')) {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ========================================
   Loads YouTube video on play button click.
   Hides thumbnail, shows player with autoplay.
   Uses fade-in transition via CSS.
   ======================================== */
function initVideoPlayer() {
  const playBtn = document.querySelector('#play-btn');
  const videoThumbnail = document.querySelector('#video-thumbnail');
  const videoPlayer = document.querySelector('#video-player');
  const ytIframe = document.querySelector('#yt-iframe');

  if (!playBtn || !videoThumbnail || !videoPlayer || !ytIframe) return;

  const videoId = 'dQw4w9WgXcQ';

  playBtn.addEventListener('click', () => {
    ytIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    videoThumbnail.classList.add('hidden');
    videoPlayer.classList.remove('hidden');
  });
}

/* ========================================
   Animates chart bars when in viewport.
   Bars fill with staggered delay (index * 80ms).
   Unobserves after first trigger.
   ======================================== */
function initChartBars() {
  const chartMockup = document.querySelector('#chart-mockup');
  const bars = document.querySelectorAll('.chart-bar');

  if (!chartMockup || bars.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          bars.forEach((bar, index) => {
            setTimeout(() => {
              const heightValue = bar.dataset.height || 0;
              bar.style.height = heightValue + '%';
              bar.style.opacity = '1';
            }, index * 80);
          });
          observer.unobserve(chartMockup);
        }
      });
    },
    { threshold: 0.5 }
  );

  observer.observe(chartMockup);
}

/* ========================================
   Reveals journey cards on scroll.
   Adds "visible" class with staggered delay.
   Each card has initial opacity:0, translateY(24px).
   ======================================== */
function initJourneyReveal() {
  const cards = document.querySelectorAll('.journey-card');

  if (cards.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = entry.target.dataset.index * 150;
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, delay);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.25, rootMargin: '0px 0px -40px 0px' }
  );

  cards.forEach((card) => {
    observer.observe(card);
  });
}

/* ========================================
   Pulses random presence dots every 3000ms.
   Adds "pulse" class, triggers animation,
   then removes class after 600ms.
   ======================================== */
function initPresencePulse() {
  const dots = document.querySelectorAll('.presence-dot');

  if (dots.length === 0) return;

  setInterval(() => {
    const randomDot = dots[Math.floor(Math.random() * dots.length)];
    randomDot.classList.add('pulse');
    setTimeout(() => {
      randomDot.classList.remove('pulse');
    }, 600);
  }, 3000);
}

/* ========================================
   Handles CTA button interactions.
   "Start Free Trial" scrolls to hero.
   "Contact Sales" opens mailto link.
   ======================================== */
function initCTAButtons() {
  const btnWhite = document.querySelector('.cta-section .btn-white');
  const btnGhostWhite = document.querySelector('.cta-section .btn-ghost-white');

  if (btnWhite) {
    btnWhite.addEventListener('click', (e) => {
      e.preventDefault();
      const hero = document.querySelector('#hero');
      if (hero) {
        const targetPosition = hero.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  }

  if (btnGhostWhite) {
    btnGhostWhite.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = 'mailto:sales@masterbuild.io';
    });
  }
}
