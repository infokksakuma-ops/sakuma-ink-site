// Prevent iOS in-app browsers / bfcache from keeping a previous page's scroll position.
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
if (!location.hash) {
  window.scrollTo(0, 0);
}

document.addEventListener('DOMContentLoaded', function () {
  if (!location.hash) {
    window.scrollTo(0, 0);
  }

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
  // config: { wrap, sticky, primarySlides, syncedSlides(optional), dots, tabs(optional), steepness(optional), travel(optional) }
  function initScrub(config) {
    var wrap = document.querySelector(config.wrap);
    var sticky = document.querySelector(config.sticky);
    if (!wrap || !sticky) return;

    var primary = Array.prototype.slice.call(document.querySelectorAll(config.primarySlides));
    var synced = config.syncedSlides ? Array.prototype.slice.call(document.querySelectorAll(config.syncedSlides)) : [];
    var dots = config.dots ? Array.prototype.slice.call(document.querySelectorAll(config.dots)) : [];
    var tabs = config.tabs ? Array.prototype.slice.call(document.querySelectorAll(config.tabs)) : [];
    if (primary.length < 2) return;

    // steepness > 1 shortens the overlap window between adjacent slides (less garbled crossfade)
    var steepness = config.steepness || 1.7;
    var travel = config.travel || 90; // px of translateY at offset = 1

    if (reduceMotion) {
      primary.concat(synced).forEach(function (el) { el.style.opacity = ''; el.style.transform = ''; });
      function setActive(i) {
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
          var opacity = Math.max(0, 1 - Math.abs(offset) * steepness);
          el.style.opacity = String(opacity);
          if (group === primary) {
            el.style.transform = 'translateY(' + (-offset * travel) + 'px)';
          }
        });
      });

      var nearest = Math.round(vIndex);
      dots.forEach(function (dot, i) { dot.classList.toggle('is-active', i === nearest); });
      tabs.forEach(function (t) {
        t.classList.toggle('is-active', Number(t.getAttribute('data-tab-for')) === nearest);
      });
    }

    function goToIndex(i, smooth) {
      var stickyH = sticky.offsetHeight;
      var scrollable = wrap.offsetHeight - stickyH;
      var wrapTop = wrap.getBoundingClientRect().top + window.scrollY;
      var targetY = wrapTop - STICKY_OFFSET + (i / (primary.length - 1)) * scrollable;
      window.scrollTo({ top: targetY, behavior: smooth ? 'smooth' : 'auto' });
    }

    var snapTimer = null;
    function scheduleSnap() {
      clearTimeout(snapTimer);
      snapTimer = setTimeout(function () {
        var rect = wrap.getBoundingClientRect();
        var stickyH = sticky.offsetHeight;
        var scrollable = wrap.offsetHeight - stickyH;
        if (scrollable <= 0) return;
        var progress = (STICKY_OFFSET - rect.top) / scrollable;
        // Only snap while genuinely inside the scrub zone (not just entering/leaving it).
        if (progress <= 0.02 || progress >= 0.98) return;
        var vIndex = progress * (primary.length - 1);
        goToIndex(Math.round(vIndex), true);
      }, 140);
    }

    function onScroll() {
      if (!ticking) { ticking = true; requestAnimationFrame(render); }
      scheduleSnap();
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    window.addEventListener('load', render);
    render();

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () { goToIndex(i, true); });
    });
  }

  initScrub({
    wrap: '.hero-scrub-wrap',
    sticky: '.hero',
    primarySlides: '.hero-slide',
    dots: '.hero .hero-dot',
    steepness: 1.4,
    travel: 80
  });

  initScrub({
    wrap: '.line-scrub-track',
    sticky: '.line-scrub',
    primarySlides: '.line-step',
    syncedSlides: '.phone-slide',
    dots: '.line-dots .hero-dot',
    tabs: '.p-tab',
    steepness: 1.3,
    travel: 55
  });
});
