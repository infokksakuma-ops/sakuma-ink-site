document.addEventListener('DOMContentLoaded', function () {
  var targets = document.querySelectorAll('.reveal, .reveal-stagger');
  if (!('IntersectionObserver' in window) || targets.length === 0) {
    targets.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    targets.forEach(function (el) { observer.observe(el); });
  }

  // ===== Hero slider =====
  var hero = document.querySelector('.hero');
  if (!hero) return;
  var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
  if (slides.length < 2) return;

  var current = 0;
  var locked = false;
  var LOCK_MS = 800;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function goTo(index) {
    if (index === current || index < 0 || index >= slides.length) return;
    slides[current].classList.remove('is-active');
    dots[current] && dots[current].classList.remove('is-active');
    current = index;
    slides[current].classList.add('is-active');
    dots[current] && dots[current].classList.add('is-active');
    if (!reduceMotion) {
      locked = true;
      setTimeout(function () { locked = false; }, LOCK_MS);
    }
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () { goTo(i); });
  });

  if (reduceMotion) return; // no scroll-hijack, dots still work

  var heroInView = false;
  var heroObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      heroInView = entry.intersectionRatio > 0.6;
    });
  }, { threshold: [0, 0.6, 1] });
  heroObserver.observe(hero);

  hero.addEventListener('wheel', function (e) {
    if (!heroInView || locked) return;
    var goingDown = e.deltaY > 8;
    var goingUp = e.deltaY < -8;
    if (goingDown && current < slides.length - 1) {
      e.preventDefault();
      goTo(current + 1);
    } else if (goingUp && current > 0) {
      e.preventDefault();
      goTo(current - 1);
    }
    // otherwise: let the page scroll normally (boundary reached)
  }, { passive: false });

  var touchStartY = null;
  hero.addEventListener('touchstart', function (e) {
    if (!e.touches || !e.touches.length) return;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  hero.addEventListener('touchmove', function (e) {
    if (!heroInView || locked || touchStartY === null || !e.touches || !e.touches.length) return;
    var diff = touchStartY - e.touches[0].clientY;
    if (Math.abs(diff) < 40) return;
    var goingDown = diff > 0;
    if (goingDown && current < slides.length - 1) {
      e.preventDefault();
      goTo(current + 1);
      touchStartY = null;
    } else if (!goingDown && current > 0) {
      e.preventDefault();
      goTo(current - 1);
      touchStartY = null;
    }
  }, { passive: false });
});

