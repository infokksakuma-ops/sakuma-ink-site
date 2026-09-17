document.addEventListener('DOMContentLoaded', function () {
  // ===== Scroll reveal (fade-up cards/sections) =====
  var revealTargets = document.querySelectorAll('.reveal, .reveal-stagger');
  if (!('IntersectionObserver' in window) || revealTargets.length === 0) {
    revealTargets.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    revealTargets.forEach(function (el) { revealObserver.observe(el); });
  }

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var STICKY_OFFSET = 74;

  // ===== Generic scroll-scrub group =====
  // config: { wrap, sticky, primarySlides, syncedSlides(optional), dots, tabs(optional, matched by data-tab-for) }
  function initScrub(config) {
    var wrap = document.querySelector(config.wrap);
    var sticky = document.querySelector(config.sticky);
    if (!wrap || !sticky) return;

    var primary = Array.prototype.slice.call(document.querySelectorAll(config.primarySlides));
    var synced = config.syncedSlides ? Array.prototype.slice.call(document.querySelectorAll(config.syncedSlides)) : [];
    var dots = config.dots ? Array.prototype.slice.call(document.querySelectorAll(config.dots)) : [];
    var tabs = config.tabs ? Array.prototype.slice.call(document.querySelectorAll(config.tabs)) : [];
    if (primary.length < 2) return;

    if (reduceMotion) {
      // Static fallback: clear inline styles so CSS reduced-motion rules apply, dots switch instantly.
      primary.concat(synced).forEach(function (el) { el.style.opacity = ''; el.style.transform = ''; });
      function setActive(i) {
        primary.forEach(function (el, j) { if (el.dataset.step == j) {} });
        [primary, synced].forEach(function (group) {
          group.forEach(function (el) {
            var step = Number(el.getAttribute('data-step'));
            el.style.opacity = step === i ? '1' : '0';
          });
        });
        tabs.forEach(function (t) {
          t.classList.toggle('is-active', Number(t.getAttribute('data-tab-for')) === i);
        });
        dots.forEach(function (d, j) { d.classList.toggle('is-active', j === i); });
      }
      setActive(0);
      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () { setActive(i); });
      });
      return;
    }

    var ticking = false;

    function render() {
      ticking = false;
      var rect = wrap.getBoundingClientRect();
      var stickyH = sticky.offsetHeight;
      var scrollable = wrap.offsetHeight - stickyH;
      if (scrollable <= 0) return;

      var progress = (STICKY_OFFSET - rect.top) / scrollable;
      progress = Math.max(0, Math.min(1, progress));
      var vIndex = progress * (primary.length - 1);

      [primary, synced].forEach(function (group) {
        group.forEach(function (el) {
          var i = Number(el.getAttribute('data-step'));
          var offset = vIndex - i;
          var opacity = Math.max(0, 1 - Math.abs(offset));
          el.style.opacity = String(opacity);
          if (group === primary) {
            el.style.transform = 'translateY(' + (-offset * 36) + 'px)';
          }
        });
      });

      var nearest = Math.round(vIndex);
      dots.forEach(function (dot, i) { dot.classList.toggle('is-active', i === nearest); });
      tabs.forEach(function (t) {
        t.classList.toggle('is-active', Number(t.getAttribute('data-tab-for')) === nearest);
      });
    }

    function onScroll() {
      if (!ticking) { ticking = true; requestAnimationFrame(render); }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    render();

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        var stickyH = sticky.offsetHeight;
        var scrollable = wrap.offsetHeight - stickyH;
        var wrapTop = wrap.getBoundingClientRect().top + window.scrollY;
        var targetY = wrapTop - STICKY_OFFSET + (i / (primary.length - 1)) * scrollable;
        window.scrollTo({ top: targetY, behavior: 'smooth' });
      });
    });
  }

  initScrub({
    wrap: '.hero-scrub-wrap',
    sticky: '.hero',
    primarySlides: '.hero-slide',
    dots: '.hero .hero-dot'
  });

  initScrub({
    wrap: '.line-scrub-track',
    sticky: '.line-scrub',
    primarySlides: '.line-step',
    syncedSlides: '.phone-slide',
    dots: '.line-dots .hero-dot',
    tabs: '.p-tab'
  });
});
