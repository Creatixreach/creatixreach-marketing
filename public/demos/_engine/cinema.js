/* ============================================================
   CINEMA — scroll-driven shot engine
   Shared by every demo under /demos/*. No build step, no npm.
   Depends on GSAP + ScrollTrigger + Lenis (loaded via CDN).

   Templates declare scenes in HTML; this file owns the hard,
   easy-to-break parts: pinning, scrub, parallax, transitions,
   reduced-motion, and mobile degradation.
   ============================================================ */

window.Cinema = (function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var compact = window.matchMedia('(max-width: 860px)').matches;
  var shots = [];
  var lenis = null;

  /* ---------- utilities exposed to templates ---------- */

  function vh(n) { return window.innerHeight * n; }

  /* Distance a shot occupies, in px. `length` is in viewport heights.
     Compact screens get shorter shots so phones don't scroll forever. */
  function shotDistance(length) {
    return vh(compact ? Math.max(1, length * 0.65) : length);
  }

  /* ---------- parallax ----------
     Any element inside a shot with data-depth="0.4" drifts by
     depth * driftBase px across the shot. Negative depth drifts
     the other way. depth 0 = locked to camera. */
  function attachParallax(tl, shotEl, driftBase) {
    var layers = shotEl.querySelectorAll('[data-depth]');
    Array.prototype.forEach.call(layers, function (el) {
      var depth = parseFloat(el.getAttribute('data-depth')) || 0;
      if (!depth) return;
      var axis = el.getAttribute('data-axis') || 'x';
      var drift = -depth * driftBase;
      var props = { ease: 'none', duration: 1 };
      props[axis] = drift;
      tl.to(el, props, 0);
    });
  }

  /* ---------- the push-in ----------
     Camera "enters" something: an iris opens out of a point on the
     outgoing layer while it scales past the viewer, revealing the
     incoming layer underneath. This is the shot the whole demo sells.

     opts: { out, in, origin:'50% 46%', scale:14, at:0, dur:1 }  */
  function pushIn(tl, opts) {
    var o = opts || {};
    var at = o.at || 0;
    var dur = o.dur || 1;
    var origin = o.origin || '50% 50%';
    var scale = o.scale || 12;

    if (o.in) {
      /* The reveal state has to be applied ON the timeline, not at build
         time — otherwise the incoming plate sits visible on top of the
         whole shot from the first frame. */
      tl.set(o.in, {
        autoAlpha: 1,
        transformOrigin: origin,
        clipPath: 'circle(0% at ' + origin + ')'
      }, at);
      tl.fromTo(o.in,
        { clipPath: 'circle(0% at ' + origin + ')', scale: 1.3 },
        { clipPath: 'circle(155% at ' + origin + ')', scale: 1, ease: 'power2.inOut', duration: dur }, at);
    }
    if (o.out) {
      tl.to(o.out, {
        scale: scale,
        transformOrigin: origin,
        autoAlpha: 0,
        ease: 'power2.in',
        duration: dur
      }, at);
    }
    return tl;
  }

  /* ---------- shot registration ---------- */

  function buildShot(el, index) {
    var length = parseFloat(el.getAttribute('data-length')) || 2;
    var drift = parseFloat(el.getAttribute('data-drift')) || 420;
    var name = el.getAttribute('data-shot') || String(index + 1);

    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: el,
        start: 'top top',
        end: '+=' + shotDistance(length),
        pin: !reduced,
        pinSpacing: true,
        scrub: reduced ? false : 0.8,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onEnter: function () { setSlate(index, name); },
        onEnterBack: function () { setSlate(index, name); }
      }
    });

    if (!reduced) attachParallax(tl, el, drift);

    var record = { el: el, tl: tl, name: name, index: index };
    shots.push(record);

    /* Templates hook in here: window.SCENE[name](tl, el, Cinema) */
    if (window.SCENE && typeof window.SCENE[name] === 'function') {
      window.SCENE[name](tl, el, api);
    }
    return record;
  }

  /* ---------- slate (the corner HUD) ----------
     Shows which shot you're in and how far through the film you are.
     It reports real state, so it earns its place on screen. */
  var slateShot, slateName, slateBar;

  function mountSlate() {
    var host = document.querySelector('[data-slate]');
    if (!host) return;
    slateShot = host.querySelector('[data-slate-index]');
    slateName = host.querySelector('[data-slate-name]');
    slateBar = host.querySelector('[data-slate-bar]');

    var doc = document.documentElement;
    var onScroll = function () {
      if (!slateBar) return;
      var max = doc.scrollHeight - window.innerHeight;
      var p = max > 0 ? window.scrollY / max : 0;
      slateBar.style.transform = 'scaleX(' + Math.min(1, Math.max(0, p)) + ')';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function setSlate(i, name) {
    if (slateShot) slateShot.textContent = String(i + 1).padStart(2, '0');
    if (slateName) slateName.textContent = name;
  }

  /* ---------- reveal-on-enter for ordinary sections ---------- */
  function mountReveals() {
    var items = document.querySelectorAll('[data-reveal]');
    Array.prototype.forEach.call(items, function (el) {
      if (reduced) { gsap.set(el, { autoAlpha: 1, y: 0 }); return; }
      gsap.fromTo(el,
        { autoAlpha: 0, y: 26 },
        {
          autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true }
        });
    });
  }

  /* ---------- smooth scroll ---------- */
  function mountLenis() {
    if (reduced || typeof Lenis === 'undefined') return;
    lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, touchMultiplier: 1.4 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  /* ---------- boot ---------- */
  function init() {
    if (typeof gsap === 'undefined') {
      document.documentElement.classList.add('no-motion');
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    document.documentElement.classList.add(reduced ? 'no-motion' : 'has-motion');
    if (compact) document.documentElement.classList.add('is-compact');

    mountLenis();
    mountSlate();

    var els = document.querySelectorAll('[data-shot]');
    Array.prototype.forEach.call(els, buildShot);

    mountReveals();

    /* Fonts change layout height; refresh once they land. */
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    }
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });

    document.body.classList.add('is-ready');
  }

  /* Let a scene rename the slate mid-shot, so one long pinned move
     can still announce its beats the way a cut would. */
  function label(name) {
    if (slateName) slateName.textContent = name;
  }

  var api = {
    init: init,
    pushIn: pushIn,
    label: label,
    vh: vh,
    reduced: reduced,
    compact: compact,
    shots: shots,
    get lenis() { return lenis; }
  };

  return api;
})();
