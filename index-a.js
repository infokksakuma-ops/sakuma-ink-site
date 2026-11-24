document.addEventListener('DOMContentLoaded', function () {
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Scroll reveal
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

  // Count-up
  var countTargets = document.querySelectorAll('.count-up');
  if (countTargets.length > 0) {
    var formatCount = function (el, value) {
      var rounded = Math.round(value);
      return el.getAttribute('data-format') === 'comma' ? rounded.toLocaleString('ja-JP') : String(rounded);
    };
    var runCountUp = function (el) {
      var target = parseFloat(el.getAttribute('data-count'));
      if (isNaN(target)) return;
      if (reduceMotion || !('requestAnimationFrame' in window)) {
        el.textContent = formatCount(el, target);
        return;
      }
      var duration = 1300;
      var startTime = null;
      var step = function (now) {
        if (startTime === null) startTime = now;
        var progress = Math.min((now - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = formatCount(el, target * eased);
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if (!('IntersectionObserver' in window)) {
      countTargets.forEach(runCountUp);
    } else {
      var countObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            runCountUp(entry.target);
            countObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4 });
      countTargets.forEach(function (el) {
        if (!reduceMotion) el.textContent = formatCount(el, 0);
        countObserver.observe(el);
      });
    }
  }
});
