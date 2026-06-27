/*
  Royal Wedding Invitation
  Vanilla JavaScript interactions and animations
*/

"use strict";

const SELECTORS = {
  body: document.body,
  loader: document.getElementById("loader"),
  navToggle: document.getElementById("navToggle"),
  navLinks: document.getElementById("navLinks"),
  openInvitation: document.getElementById("openInvitation"),
  invitationEnvelope: document.getElementById("invitationEnvelope"),
  heroContent: document.querySelector(".hero__content"),
  music: document.getElementById("weddingMusic"),
  musicToggle: document.getElementById("musicToggle"),
  countdown: document.getElementById("countdownTimer"),
  days: document.getElementById("days"),
  hours: document.getElementById("hours"),
  minutes: document.getElementById("minutes"),
  seconds: document.getElementById("seconds"),
  gallerySlides: document.querySelectorAll(".gallery__slide"),
  galleryPrev: document.getElementById("galleryPrev"),
  galleryNext: document.getElementById("galleryNext"),
  rsvpForm: document.getElementById("rsvpForm"),
  formSuccess: document.getElementById("formSuccess"),
  canvas: document.getElementById("celebrationCanvas"),
  particles: document.querySelector(".particles"),
  petals: document.querySelector(".petals"),
  hearts: document.querySelector(".hearts"),
  reveals: document.querySelectorAll(".reveal")
};

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let galleryIndex = 0;
let galleryIntervalId = null;
let countdownIntervalId = null;
let celebrationStarted = false;

document.addEventListener("DOMContentLoaded", initApp);

function initApp() {
  SELECTORS.body.classList.add("is-loading");
  initLoader();
  initNavigation();
  initInvitationReveal();
  initMusic();
  initCountdown();
  initGallery();
  initScrollReveal();
  initRsvpForm();
  initAmbientElements();
  initCelebrationCanvas();
}

/* -------------------------
   Loading Screen
   ------------------------- */
function initLoader() {
  window.addEventListener("load", hideLoader);
  window.setTimeout(hideLoader, 1800);
}

function hideLoader() {
  if (!SELECTORS.loader || SELECTORS.loader.classList.contains("is-hidden")) {
    return;
  }

  SELECTORS.loader.classList.add("is-hidden");
  SELECTORS.body.classList.remove("is-loading");
}

/* -------------------------
   Navigation
   ------------------------- */
function initNavigation() {
  if (!SELECTORS.navToggle || !SELECTORS.navLinks) {
    return;
  }

  SELECTORS.navToggle.addEventListener("click", toggleNavigation);

  SELECTORS.navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      closeNavigation();
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeNavigation();
    }
  });
}

function toggleNavigation() {
  const isOpen = SELECTORS.navLinks.classList.toggle("is-open");
  SELECTORS.navToggle.setAttribute("aria-expanded", String(isOpen));
  SELECTORS.navToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
}

function closeNavigation() {
  SELECTORS.navLinks.classList.remove("is-open");
  SELECTORS.navToggle.setAttribute("aria-expanded", "false");
  SELECTORS.navToggle.setAttribute("aria-label", "Open navigation menu");
}

/* -------------------------
   Invitation Opening
   ------------------------- */
function initInvitationReveal() {
  if (!SELECTORS.openInvitation) {
    return;
  }

  SELECTORS.openInvitation.addEventListener("click", () => {
    SELECTORS.invitationEnvelope?.classList.add("is-open");
    SELECTORS.heroContent?.classList.add("is-open");
    SELECTORS.openInvitation.textContent = "Invitation Opened";
    SELECTORS.openInvitation.disabled = true;
    launchConfetti(90);
    playMusicFromUserGesture();
  });
}

/* -------------------------
   Music Controls
   ------------------------- */
function initMusic() {
  if (!SELECTORS.music || !SELECTORS.musicToggle) {
    return;
  }

  SELECTORS.music.volume = 0.35;
  SELECTORS.musicToggle.classList.add("is-muted");

  document.addEventListener("click", handleFirstMusicGesture, { once: true });
  SELECTORS.musicToggle.addEventListener("click", toggleMusic);
}

function handleFirstMusicGesture() {
  playMusicFromUserGesture();
}

function playMusicFromUserGesture() {
  if (!SELECTORS.music || !SELECTORS.musicToggle) {
    return;
  }

  SELECTORS.music.play()
    .then(() => {
      SELECTORS.musicToggle.classList.remove("is-muted");
      SELECTORS.musicToggle.setAttribute("aria-pressed", "true");
    })
    .catch(() => {
      SELECTORS.musicToggle.classList.add("is-muted");
      SELECTORS.musicToggle.setAttribute("aria-pressed", "false");
    });
}

function toggleMusic(event) {
  event.stopPropagation();

  if (SELECTORS.music.paused) {
    playMusicFromUserGesture();
    return;
  }

  SELECTORS.music.pause();
  SELECTORS.musicToggle.classList.add("is-muted");
  SELECTORS.musicToggle.setAttribute("aria-pressed", "false");
}

/* -------------------------
   Countdown and Celebration
   ------------------------- */
function initCountdown() {
  if (!SELECTORS.countdown) {
    return;
  }

  updateCountdown();
  countdownIntervalId = window.setInterval(updateCountdown, 1000);
}

function updateCountdown() {
  const weddingDate = new Date(SELECTORS.countdown.dataset.weddingDate).getTime();
  const now = Date.now();
  const remaining = Math.max(weddingDate - now, 0);

  const days = Math.floor(remaining / 86400000);
  const hours = Math.floor((remaining % 86400000) / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);

  updateCountdownText(days, hours, minutes, seconds);

  if (remaining <= 0) {
    window.clearInterval(countdownIntervalId);
    startWeddingCelebration();
  }
}

function updateCountdownText(days, hours, minutes, seconds) {
  SELECTORS.days.textContent = formatTime(days);
  SELECTORS.hours.textContent = formatTime(hours);
  SELECTORS.minutes.textContent = formatTime(minutes);
  SELECTORS.seconds.textContent = formatTime(seconds);
}

function formatTime(value) {
  return String(value).padStart(2, "0");
}

function startWeddingCelebration() {
  if (celebrationStarted) {
    return;
  }

  celebrationStarted = true;
  launchConfetti(180);

  if (!prefersReducedMotion) {
    launchFireworks(5500);
  }
}

/* -------------------------
   Gallery Slideshow
   ------------------------- */
function initGallery() {
  if (!SELECTORS.gallerySlides.length) {
    return;
  }

  SELECTORS.galleryPrev?.addEventListener("click", () => {
    showGallerySlide(galleryIndex - 1);
    restartGalleryAutoplay();
  });

  SELECTORS.galleryNext?.addEventListener("click", () => {
    showGallerySlide(galleryIndex + 1);
    restartGalleryAutoplay();
  });

  startGalleryAutoplay();
}

function startGalleryAutoplay() {
  if (prefersReducedMotion) {
    return;
  }

  galleryIntervalId = window.setInterval(() => {
    showGallerySlide(galleryIndex + 1);
  }, 4500);
}

function restartGalleryAutoplay() {
  window.clearInterval(galleryIntervalId);
  startGalleryAutoplay();
}

function showGallerySlide(index) {
  SELECTORS.gallerySlides[galleryIndex].classList.remove("is-active");
  galleryIndex = (index + SELECTORS.gallerySlides.length) % SELECTORS.gallerySlides.length;
  SELECTORS.gallerySlides[galleryIndex].classList.add("is-active");
}

/* -------------------------
   Scroll Reveal
   ------------------------- */
function initScrollReveal() {
  if (!SELECTORS.reveals.length) {
    return;
  }

  if (!("IntersectionObserver" in window) || prefersReducedMotion) {
    SELECTORS.reveals.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.16,
    rootMargin: "0px 0px -60px 0px"
  });

  SELECTORS.reveals.forEach((element) => observer.observe(element));
}

/* -------------------------
   RSVP Validation
   ------------------------- */
function initRsvpForm() {
  if (!SELECTORS.rsvpForm) {
    return;
  }

  SELECTORS.rsvpForm.addEventListener("submit", handleRsvpSubmit);

  SELECTORS.rsvpForm.querySelectorAll("input, select, textarea").forEach((field) => {
    field.addEventListener("input", () => {
      validateField(field);
      SELECTORS.formSuccess.textContent = "";
    });
  });
}

function handleRsvpSubmit(event) {
  event.preventDefault();

  const fields = Array.from(SELECTORS.rsvpForm.querySelectorAll("input, select"));
  const validationResults = fields.map((field) => validateField(field));
  const isValid = validationResults.every(Boolean);

  if (!isValid) {
    SELECTORS.formSuccess.textContent = "";
    return;
  }

  SELECTORS.formSuccess.textContent = "Thank you. Your RSVP has been received with love.";
  SELECTORS.rsvpForm.reset();
  launchConfetti(70);
}

function validateField(field) {
  const errorElement = document.getElementById(`${field.id}Error`);

  if (!errorElement) {
    return true;
  }

  const message = getFieldError(field);
  errorElement.textContent = message;
  field.setAttribute("aria-invalid", String(Boolean(message)));

  return !message;
}

function getFieldError(field) {
  const value = field.value.trim();

  if (field.required && !value) {
    return "This field is required.";
  }

  if (field.type === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return "Please enter a valid email address.";
  }

  if (field.type === "tel" && value && !/^[+()\-\s\d]{8,18}$/.test(value)) {
    return "Please enter a valid phone number.";
  }

  if (field.type === "number") {
    const number = Number(value);
    const min = Number(field.min);
    const max = Number(field.max);

    if (Number.isNaN(number) || number < min || number > max) {
      return `Please enter a number from ${min} to ${max}.`;
    }
  }

  if (field.minLength > 0 && value.length < field.minLength) {
    return `Please enter at least ${field.minLength} characters.`;
  }

  return "";
}

/* -------------------------
   Ambient Element Generation
   ------------------------- */
function initAmbientElements() {
  if (prefersReducedMotion) {
    return;
  }

  createFallingElements(SELECTORS.particles, 46, {
    minSize: 2,
    maxSize: 6,
    minDuration: 9,
    maxDuration: 18,
    minDrift: -80,
    maxDrift: 80
  });

  createFallingElements(SELECTORS.petals, 28, {
    minSize: 8,
    maxSize: 16,
    minDuration: 10,
    maxDuration: 20,
    minDrift: -140,
    maxDrift: 140
  });

  createFallingElements(SELECTORS.hearts, 16, {
    minSize: 8,
    maxSize: 18,
    minDuration: 12,
    maxDuration: 22,
    minDrift: -90,
    maxDrift: 90
  });
}

function createFallingElements(container, count, options) {
  if (!container) {
    return;
  }

  const fragment = document.createDocumentFragment();

  for (let index = 0; index < count; index += 1) {
    const element = document.createElement("span");
    element.style.setProperty("--x", `${randomNumber(0, 100)}vw`);
    element.style.setProperty("--size", `${randomNumber(options.minSize, options.maxSize)}px`);
    element.style.setProperty("--duration", `${randomNumber(options.minDuration, options.maxDuration)}s`);
    element.style.setProperty("--delay", `${randomNumber(-options.maxDuration, 0)}s`);
    element.style.setProperty("--drift", `${randomNumber(options.minDrift, options.maxDrift)}px`);
    fragment.appendChild(element);
  }

  container.appendChild(fragment);
}

/* -------------------------
   Confetti and Fireworks
   ------------------------- */
function initCelebrationCanvas() {
  if (!SELECTORS.canvas) {
    return;
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
}

function resizeCanvas() {
  const pixelRatio = window.devicePixelRatio || 1;
  SELECTORS.canvas.width = Math.floor(window.innerWidth * pixelRatio);
  SELECTORS.canvas.height = Math.floor(window.innerHeight * pixelRatio);
  SELECTORS.canvas.style.width = `${window.innerWidth}px`;
  SELECTORS.canvas.style.height = `${window.innerHeight}px`;
}

function launchConfetti(amount) {
  if (!SELECTORS.canvas || prefersReducedMotion) {
    return;
  }

  const context = SELECTORS.canvas.getContext("2d");
  const pixelRatio = window.devicePixelRatio || 1;
  const pieces = Array.from({ length: amount }, () => createConfettiPiece(pixelRatio));
  const start = performance.now();
  const duration = 4200;

  function animateConfetti(time) {
    const elapsed = time - start;
    context.clearRect(0, 0, SELECTORS.canvas.width, SELECTORS.canvas.height);

    pieces.forEach((piece) => {
      piece.x += piece.vx;
      piece.y += piece.vy;
      piece.rotation += piece.spin;
      piece.vy += 0.045 * pixelRatio;
      drawConfettiPiece(context, piece);
    });

    if (elapsed < duration) {
      requestAnimationFrame(animateConfetti);
    } else {
      context.clearRect(0, 0, SELECTORS.canvas.width, SELECTORS.canvas.height);
    }
  }

  requestAnimationFrame(animateConfetti);
}

function createConfettiPiece(pixelRatio) {
  const colors = ["#ffe6a3", "#d9a441", "#fff7e8", "#c84f61", "#9b1e31"];

  return {
    x: randomNumber(0, window.innerWidth) * pixelRatio,
    y: randomNumber(-120, -20) * pixelRatio,
    w: randomNumber(6, 12) * pixelRatio,
    h: randomNumber(10, 18) * pixelRatio,
    vx: randomNumber(-2.2, 2.2) * pixelRatio,
    vy: randomNumber(2, 5) * pixelRatio,
    rotation: randomNumber(0, Math.PI * 2),
    spin: randomNumber(-0.16, 0.16),
    color: colors[Math.floor(randomNumber(0, colors.length))]
  };
}

function drawConfettiPiece(context, piece) {
  context.save();
  context.translate(piece.x, piece.y);
  context.rotate(piece.rotation);
  context.fillStyle = piece.color;
  context.fillRect(-piece.w / 2, -piece.h / 2, piece.w, piece.h);
  context.restore();
}

function launchFireworks(duration) {
  if (!SELECTORS.canvas) {
    return;
  }

  const context = SELECTORS.canvas.getContext("2d");
  const pixelRatio = window.devicePixelRatio || 1;
  const fireworks = [];
  const start = performance.now();

  function animateFireworks(time) {
    context.clearRect(0, 0, SELECTORS.canvas.width, SELECTORS.canvas.height);

    if (Math.random() < 0.08) {
      fireworks.push(...createFireworkBurst(pixelRatio));
    }

    for (let index = fireworks.length - 1; index >= 0; index -= 1) {
      const spark = fireworks[index];
      spark.x += spark.vx;
      spark.y += spark.vy;
      spark.vy += 0.025 * pixelRatio;
      spark.life -= 0.018;

      context.globalAlpha = Math.max(spark.life, 0);
      context.beginPath();
      context.arc(spark.x, spark.y, spark.radius, 0, Math.PI * 2);
      context.fillStyle = spark.color;
      context.fill();
      context.globalAlpha = 1;

      if (spark.life <= 0) {
        fireworks.splice(index, 1);
      }
    }

    if (time - start < duration || fireworks.length) {
      requestAnimationFrame(animateFireworks);
    } else {
      context.clearRect(0, 0, SELECTORS.canvas.width, SELECTORS.canvas.height);
    }
  }

  requestAnimationFrame(animateFireworks);
}

function createFireworkBurst(pixelRatio) {
  const colors = ["#ffe6a3", "#d9a441", "#ffffff", "#ffced6"];
  const centerX = randomNumber(window.innerWidth * 0.15, window.innerWidth * 0.85) * pixelRatio;
  const centerY = randomNumber(window.innerHeight * 0.12, window.innerHeight * 0.48) * pixelRatio;
  const sparks = [];

  for (let index = 0; index < 42; index += 1) {
    const angle = (Math.PI * 2 * index) / 42;
    const speed = randomNumber(1.6, 5.2) * pixelRatio;

    sparks.push({
      x: centerX,
      y: centerY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: randomNumber(1.5, 3.4) * pixelRatio,
      life: 1,
      color: colors[Math.floor(randomNumber(0, colors.length))]
    });
  }

  return sparks;
}

/* -------------------------
   Utilities
   ------------------------- */
function randomNumber(min, max) {
  return Math.random() * (max - min) + min;
}
