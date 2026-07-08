// ============================================================
// LAUNCHLY — script.js
// Vanilla JS: starfield canvas, navbar behavior, mobile menu,
// scroll reveal, multi-step form.
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  initStarfield();
  initNavbar();
  initMobileMenu();
  initScrollReveal();
  initMultiStepForm();
  initBoltyWidget();
});

// ------------------------------------------------------------
// STARFIELD CANVAS
// - 250-320 particles, ~25-30% purple
// - twinkle via sine wave opacity
// - glow halo on larger stars
// - parallax: each star has a random "depth" affecting
//   vertical offset on scroll
// - occasional shooting star
// ------------------------------------------------------------
function initStarfield() {
  const canvas = document.getElementById('stars-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = window.innerWidth;
  let height = window.innerHeight;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);

  const STAR_COLOR_WHITE = [244, 242, 251];
  const STAR_COLOR_PURPLE = [155, 92, 250];

  let stars = [];
  let shootingStars = [];
  let scrollY = window.scrollY || 0;
  let lastFrameTime = performance.now();
  let shootingStarTimer = randomBetween(3000, 7000);

  function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    createStars();
  }

  function createStars() {
    // Scale count a bit with viewport area, clamped to spec range.
    const baseCount = Math.round((width * height) / 4200);
    const count = Math.max(250, Math.min(320, baseCount));

    stars = [];
    for (let i = 0; i < count; i++) {
      const isPurple = Math.random() < 0.28;
      const size = randomBetween(0.6, 2.2);
      stars.push({
        x: Math.random() * width,
        // spread stars across a taller virtual area so parallax
        // scroll reveals new stars instead of running out
        y: Math.random() * height * 3 - height,
        size: size,
        baseOpacity: randomBetween(0.35, 1),
        twinkleSpeed: randomBetween(0.5, 1.8),
        twinklePhase: Math.random() * Math.PI * 2,
        depth: randomBetween(0.15, 1), // 0.15 = far/slow, 1 = near/fast
        color: isPurple ? STAR_COLOR_PURPLE : STAR_COLOR_WHITE,
        glow: size > 1.5
      });
    }
  }

  function maybeSpawnShootingStar(dt) {
    shootingStarTimer -= dt;
    if (shootingStarTimer <= 0) {
      shootingStarTimer = randomBetween(4000, 9000);
      const startX = randomBetween(width * 0.1, width * 0.7);
      const startY = randomBetween(-40, height * 0.3);
      const angle = randomBetween(0.35, 0.55) * Math.PI; // downward diagonal
      const speed = randomBetween(9, 14);
      shootingStars.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: randomBetween(600, 1000),
        length: randomBetween(90, 160)
      });
    }
  }

  function drawStars(time) {
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      const parallaxOffset = scrollY * s.depth * 0.35;
      let y = s.y + parallaxOffset;

      // wrap vertically so stars never permanently scroll away
      const wrapHeight = height * 3;
      let wrappedY = ((y % wrapHeight) + wrapHeight) % wrapHeight - height;

      if (wrappedY < -20 || wrappedY > height + 20) continue;

      const twinkle = Math.sin(time * 0.001 * s.twinkleSpeed + s.twinklePhase);
      const opacity = s.baseOpacity * (0.55 + 0.45 * twinkle);
      const [r, g, b] = s.color;

      if (s.glow) {
        const glowRadius = s.size * 5;
        const gradient = ctx.createRadialGradient(s.x, wrappedY, 0, s.x, wrappedY, glowRadius);
        gradient.addColorStop(0, `rgba(${r},${g},${b},${opacity * 0.35})`);
        gradient.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(s.x, wrappedY, glowRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.beginPath();
      ctx.fillStyle = `rgba(${r},${g},${b},${opacity})`;
      ctx.arc(s.x, wrappedY, s.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawShootingStars(dt) {
    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const st = shootingStars[i];
      st.life += dt;
      st.x += st.vx * (dt / 16.67);
      st.y += st.vy * (dt / 16.67);

      const lifeRatio = st.life / st.maxLife;
      if (lifeRatio >= 1 || st.x > width + 100 || st.y > height + 100) {
        shootingStars.splice(i, 1);
        continue;
      }

      const fadeOpacity = lifeRatio < 0.15
        ? lifeRatio / 0.15
        : 1 - (lifeRatio - 0.15) / 0.85;

      const angle = Math.atan2(st.vy, st.vx);
      const tailX = st.x - Math.cos(angle) * st.length;
      const tailY = st.y - Math.sin(angle) * st.length;

      const gradient = ctx.createLinearGradient(st.x, st.y, tailX, tailY);
      gradient.addColorStop(0, `rgba(244,242,251,${fadeOpacity})`);
      gradient.addColorStop(1, 'rgba(155,92,250,0)');

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(st.x, st.y);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();
    }
  }

  function frame(time) {
    const dt = time - lastFrameTime;
    lastFrameTime = time;

    ctx.clearRect(0, 0, width, height);
    drawStars(time);
    maybeSpawnShootingStar(dt);
    drawShootingStars(dt);

    requestAnimationFrame(frame);
  }

  window.addEventListener('resize', debounce(resize, 150));
  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
  }, { passive: true });

  resize();
  requestAnimationFrame(frame);
}

function debounce(fn, delay) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// ------------------------------------------------------------
// NAVBAR — hide on scroll down, elastic bounce back on scroll up
// ------------------------------------------------------------
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  let lastScrollY = window.scrollY;
  let ticking = false;
  const revealThreshold = 80; // near-top always shows navbar

  function onScroll() {
    const currentScrollY = window.scrollY;

    if (currentScrollY <= revealThreshold) {
      navbar.classList.remove('nav-hidden');
    } else if (currentScrollY > lastScrollY) {
      // scrolling down
      navbar.classList.add('nav-hidden');
    } else {
      // scrolling up -> elastic bounce handled by CSS transition
      navbar.classList.remove('nav-hidden');
    }

    lastScrollY = currentScrollY;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });
}

// ------------------------------------------------------------
// MOBILE MENU TOGGLE
// ------------------------------------------------------------
function initMobileMenu() {
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  links.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// ------------------------------------------------------------
// SCROLL REVEAL — fade/slide in sections as they enter viewport
// ------------------------------------------------------------
function initScrollReveal() {
  const targets = document.querySelectorAll(
    '.card, .step, .benefit-card, .garantia-item, .section-head, .form-card'
  );

  targets.forEach(el => el.classList.add('reveal'));

  if (!('IntersectionObserver' in window)) {
    targets.forEach(el => el.classList.add('in-view'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(el => observer.observe(el));
}

// ------------------------------------------------------------
// MULTI-STEP FORM
// ------------------------------------------------------------
function initMultiStepForm() {
  const form = document.getElementById('multiForm');
  if (!form) return;

  const steps = Array.from(form.querySelectorAll('.form-step'));
  const progressSteps = Array.from(document.querySelectorAll('.progress-step'));
  const successScreen = document.getElementById('formSuccess');
  const formCard = document.querySelector('.form-card');

  const state = {
    tipoNegocio: null,
    necesidad: null
  };

  function goToStep(stepNumber) {
    steps.forEach(step => {
      step.classList.toggle('active', Number(step.dataset.step) === stepNumber);
    });
    progressSteps.forEach(p => {
      const n = Number(p.dataset.step);
      p.classList.toggle('active', n === stepNumber);
      p.classList.toggle('done', n < stepNumber);
    });
  }

  // Option card selection (steps 1 & 2)
  form.querySelectorAll('.option-grid').forEach(grid => {
    const groupName = grid.dataset.group;
    const cards = Array.from(grid.querySelectorAll('.option-card'));
    const nextBtn = grid.closest('.form-step').querySelector('.btn-next');

    cards.forEach(card => {
      card.addEventListener('click', () => {
        cards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        state[groupName] = card.dataset.value;
        if (nextBtn) nextBtn.disabled = false;
      });
    });
  });

  // Next / Prev navigation
  form.querySelectorAll('.btn-next').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = Number(btn.dataset.next);
      goToStep(target);
    });
  });

  form.querySelectorAll('.btn-prev').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = Number(btn.dataset.prev);
      goToStep(target);
    });
  });

  // Submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value.trim();
    const negocio = document.getElementById('negocio').value.trim();
    const whatsapp = document.getElementById('whatsapp').value.trim();

    if (!nombre || !negocio || !whatsapp) {
      const firstEmpty = [
        ['nombre', nombre],
        ['negocio', negocio],
        ['whatsapp', whatsapp]
      ].find(([, val]) => !val);
      if (firstEmpty) {
        document.getElementById(firstEmpty[0]).focus();
      }
      return;
    }

    // PENDIENTE: conectar con webhook de Make.com para enviar estos datos a Notion CRM
    const successName = document.getElementById('successName');
    if (successName) successName.textContent = nombre;

    form.style.display = 'none';
    document.querySelector('.progress').style.display = 'none';
    successScreen.classList.add('active');
  });
}

// ------------------------------------------------------------
// BOLTY FLOATING WIDGET
// Hidden during the hero, fades in once the user scrolls past
// 60% of the hero's height, and links to the contact form.
// ------------------------------------------------------------
function initBoltyWidget() {
  const widget = document.getElementById('boltyWidget');
  const hero = document.querySelector('.hero');
  if (!widget || !hero) return;

  let revealThreshold = hero.offsetHeight * 0.6;
  let ticking = false;

  function updateThreshold() {
    revealThreshold = hero.offsetHeight * 0.6;
  }

  function onScroll() {
    widget.classList.toggle('visible', window.scrollY > revealThreshold);
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });

  window.addEventListener('resize', debounce(updateThreshold, 150));

  onScroll();
}
