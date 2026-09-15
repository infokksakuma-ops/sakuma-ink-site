document.addEventListener('DOMContentLoaded', function () {
  // ===== Scroll reveal (fade-up cards/sections) =====
  var targets = document.querySelectorAll('.reveal, .reveal-stagger');
  if (!('IntersectionObserver' in window) || targets.length === 0) {
    targets.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    targets.forEach(function (el) { revealObserver.observe(el); });
  }

  // ===== Hero scrub animation (scroll-position-driven crossfade) =====
  var wrap = document.querySelector('.hero-scrub-wrap');
  var hero = document.querySelector('.hero');
  if (!wrap || !hero) return;

  var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
  if (slides.length < 2) return;

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        slides.forEach(function (s, j) {
          s.style.opacity = j === i ? '1' : '0';
          s.style.pointerEvents = j === i ? 'auto' : 'none';
        });
        dots.forEach(function (d, j) { d.classList.toggle('is-active', j === i); });
      });
    });
    return;
  }

  var STICKY_OFFSET = 74; // matches .hero { top: 74px }
  var ticking = false;

  function render() {
    ticking = false;
    var rect = wrap.getBoundingClientRect();
    var heroH = hero.offsetHeight;
    var scrollable = wrap.offsetHeight - heroH;
    if (scrollable <= 0) return;

    var progress = (STICKY_OFFSET - rect.top) / scrollable;
    progress = Math.max(0, Math.min(1, progress));
    var vIndex = progress * (slides.length - 1);

    slides.forEach(function (slide, i) {
      var offset = vIndex - i;
      var opacity = Math.max(0, 1 - Math.abs(offset));
      slide.style.opacity = String(opacity);
      slide.style.transform = 'translateY(' + (-offset * 46) + 'px)';
      slide.style.pointerEvents = opacity > 0.5 ? 'auto' : 'none';
    });

    var nearest = Math.round(vIndex);
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === nearest);
    });
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(render);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  render();

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      var heroH2 = hero.offsetHeight;
      var scrollable2 = wrap.offsetHeight - heroH2;
      var wrapTop = wrap.getBoundingClientRect().top + window.scrollY;
      var targetY = wrapTop - STICKY_OFFSET + (i / (slides.length - 1)) * scrollable2;
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    });
  });
});
