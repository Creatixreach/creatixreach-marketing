/* ============================================================
   HALCYON — pest control · demo 02
   Self-contained. Deliberately does NOT use ../_engine/cinema.js:
   this page owns its own pin/scrub engine so that fixing demo 01
   later cannot break demo 02, and vice versa. The only shared
   files are the vendored library builds (GSAP, ScrollTrigger,
   Lenis), which are immutable.

   CONTENTS
     0  capability detection
     1  utilities
     2  pointer, lens, cursor
     3  insect drawing — every creature is a vector path on canvas
     4  the swarm system
     5  ambient field (dust, spores, the occasional flyer)
     6  split text
     7  hand-rolled SVG path morphing
     8  the shot engine (pin, scrub, parallax, push-in)
     9  the six acts
    10  the last cockroach
    11  boot

   THE ONE RULE THAT SHAPES EVERYTHING BELOW
     Scroll is the clock. Anything driven by scroll is computed as a
     pure function of progress, never accumulated frame to frame.
     That is why scrolling back up un-digs the tunnels, retracts the
     spray and stands every insect back on its legs. An animation
     that only works forwards is a bug, not a feature.
   ============================================================ */

(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.remove('no-js');

  /* ---------- 0. capability detection ---------- */

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse  = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  var compact = window.matchMedia('(max-width: 900px)').matches;

  /* "lite" drops the effects whose cost is not worth their look on a
     phone: film grain, gooey and displacement filters, glow blurs. */
  var lite = coarse || compact || (navigator.hardwareConcurrency || 8) <= 4;

  var hasGSAP = (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined');

  if (!hasGSAP) {
    /* Library did not load. Fall back to the readable document rather
       than leaving a pinned, half-built page on screen. */
    root.classList.add('no-motion');
    root.classList.remove('booting');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  root.classList.add(reduced ? 'no-motion' : 'has-motion');
  if (lite) root.classList.add('is-lite');

  /* Film grain is generated, not downloaded — a 90x90 turbulence tile
     inlined as a data URI. No image file anywhere on this page. */
  if (!lite) {
    root.style.setProperty('--grain-src',
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='90' height='90'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='90' height='90' filter='url(%23n)' opacity='.42'/%3E%3C/svg%3E\")");
  }


  /* ---------- 1. utilities ---------- */

  var TAU = Math.PI * 2;
  function rand(a, b) { return a + Math.random() * (b - a); }
  function randInt(a, b) { return Math.floor(rand(a, b + 1)); }
  function pick(arr) { return arr[randInt(0, arr.length - 1)]; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function easeIn(t) { return t * t; }
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }

  /* The transform an SVG with preserveAspectRatio="xMidYMid meet"
     applies to its viewBox. The insect canvases reuse this exact
     function so a corridor authored in viewBox coordinates lands on
     the same pixels as the wall drawn in the SVG, at any viewport. */
  function meetFit(boxW, boxH, vbW, vbH) {
    var s = Math.min(boxW / vbW, boxH / vbH);
    return { s: s, ox: (boxW - vbW * s) / 2, oy: (boxH - vbH * s) / 2 };
  }

  /* Origin for a push-in, MEASURED from a marker's viewBox coordinates
     against the plate's untransformed layout box. offsetWidth is used
     rather than getBoundingClientRect because the plate may already be
     scaled by the timeline when a refresh happens — a rect would then
     report the scaled size and the iris would open off-target. */
  function originVB(plate, vbW, vbH, vx, vy) {
    var w = plate.offsetWidth || window.innerWidth;
    var h = plate.offsetHeight || window.innerHeight;
    var f = meetFit(w, h, vbW, vbH);
    return (((f.ox + vx * f.s) / w) * 100).toFixed(3) + '% ' +
           (((f.oy + vy * f.s) / h) * 100).toFixed(3) + '%';
  }


  /* ---------- 2. pointer, lens, cursor ---------- */

  var px = window.innerWidth * 0.5;
  var py = window.innerHeight * 0.5;
  var cursorEl = $('[data-cursor]');
  var cursorLabel = $('[data-cursor-label]');
  var cx = px, cy = py;

  function writePointer() {
    root.style.setProperty('--mx', px + 'px');
    root.style.setProperty('--my', py + 'px');
  }
  writePointer();

  if (!coarse) {
    window.addEventListener('pointermove', function (e) {
      px = e.clientX; py = e.clientY;
      writePointer();
      if (cursorEl) cursorEl.classList.add('live');
    }, { passive: true });

    /* Custom cursor lags the real one slightly. One transform per
       frame, never a layout read. */
    gsap.ticker.add(function () {
      cx = lerp(cx, px, 0.22);
      cy = lerp(cy, py, 0.22);
      if (cursorEl) cursorEl.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)';
    });

    /* Anything marked data-live grows the ring and names itself. */
    $$('[data-live]').forEach(function (el) {
      el.addEventListener('pointerenter', function () {
        if (!cursorEl) return;
        cursorEl.classList.add('near');
        if (cursorLabel) cursorLabel.textContent = el.getAttribute('data-label') || '';
      });
      el.addEventListener('pointerleave', function () {
        if (cursorEl) cursorEl.classList.remove('near');
      });
    });
  } else {
    /* No pointer: the lens sweeps itself, slowly, so a phone still
       gets the "something is moving over the wall" idea. */
    var t0 = 0;
    gsap.ticker.add(function (time) {
      t0 = time;
      px = window.innerWidth * (0.5 + Math.sin(t0 * 0.32) * 0.3);
      py = window.innerHeight * (0.48 + Math.cos(t0 * 0.21) * 0.22);
      writePointer();
    });
  }


  /* ---------- 3. insect drawing ----------
     Every creature is drawn with paths and arcs on a 2D context.
     Canvas rather than DOM because six hundred moving elements is
     six hundred style recalculations a frame; the artwork is still
     vector, which is the claim this page makes about itself.

     Each draw function works in a local space centred on the body,
     facing +x. The caller has already applied translate/rotate/scale.
     `g` is the gait phase, `curl` is 0 alive .. 1 legs fully curled. */

  /* INK, not light. The page is plaster-pale, so every creature is
     drawn in the same near-black as the body copy. That is the whole
     reason the background is light: a roach on a dark page is a
     silhouette you have to hunt for, and a roach on plaster is a
     roach. One constant so nothing drifts out of step. */
  var INK = '25,30,23';
  var CHITIN = '43,50,38';
  var SHELL = '58,66,47';

  function legs(ctx, pairs, g, curl, spread, len, alpha) {
    ctx.lineWidth = 1.1;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(' + INK + ',' + (0.78 * alpha) + ')';
    for (var i = 0; i < pairs; i++) {
      var bx = -spread + (i * (spread * 2) / Math.max(1, pairs - 1));
      for (var s = -1; s <= 1; s += 2) {
        /* Alternating tripod gait: opposite sides are half a cycle
           apart, which is what makes it read as walking rather than
           as vibrating. */
        var ph = g + i * 1.1 + (s > 0 ? Math.PI : 0);
        var swing = Math.sin(ph) * 0.5 * (1 - curl);
        var L = len * (1 - curl * 0.62);
        var kneeX = bx + Math.cos(swing) * L * 0.55;
        var kneeY = s * (L * 0.5 + curl * 2);
        var footX = bx + swing * L * 0.9 + L * 0.25;
        var footY = s * (L * (1 - curl * 0.8)) * (curl > 0 ? 0.4 : 1);
        ctx.beginPath();
        ctx.moveTo(bx, s * 1.5);
        ctx.quadraticCurveTo(kneeX, kneeY, footX, footY);
        ctx.stroke();
      }
    }
  }

  function antennae(ctx, x, g, len, alpha) {
    ctx.lineWidth = 0.9;
    ctx.strokeStyle = 'rgba(' + INK + ',' + (0.6 * alpha) + ')';
    for (var s = -1; s <= 1; s += 2) {
      ctx.beginPath();
      ctx.moveTo(x, s * 1.4);
      ctx.quadraticCurveTo(x - len * 0.6, s * (len * 0.5) + Math.sin(g * 1.7) * 2,
                           x - len, s * (len * 0.75) + Math.cos(g * 1.3) * 3);
      ctx.stroke();
    }
  }

  function drawRoach(ctx, a) {
    var al = a.alpha, s = a.size;
    ctx.save(); ctx.scale(s, s);
    legs(ctx, 3, a.gait, a.curl, 5, 7.5, al);
    antennae(ctx, -6, a.gait, 9, al);
    /* abdomen */
    ctx.fillStyle = 'rgba(' + SHELL + ',' + (0.95 * al) + ')';
    ctx.strokeStyle = 'rgba(' + INK + ',' + (0.85 * al) + ')';
    ctx.lineWidth = 0.9;
    ctx.beginPath(); ctx.ellipse(1, 0, 8, 5, 0, 0, TAU); ctx.fill(); ctx.stroke();
    /* wing seam — the detail that makes it a roach and not an oval */
    ctx.beginPath(); ctx.moveTo(-3, 0); ctx.lineTo(8, 0); ctx.stroke();
    /* pronotum + head */
    ctx.fillStyle = 'rgba(' + CHITIN + ',' + (0.97 * al) + ')';
    ctx.beginPath(); ctx.ellipse(-4.5, 0, 4, 3.6, 0, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(217,80,27,' + (0.8 * al) + ')';
    ctx.beginPath(); ctx.arc(-7, -1.4, 0.75, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(-7, 1.4, 0.75, 0, TAU); ctx.fill();
    ctx.restore();
  }

  function drawAnt(ctx, a) {
    var al = a.alpha, s = a.size;
    ctx.save(); ctx.scale(s, s);
    legs(ctx, 3, a.gait, a.curl, 3.5, 6, al);
    antennae(ctx, -5, a.gait, 6, al);
    ctx.fillStyle = 'rgba(' + CHITIN + ',' + (0.96 * al) + ')';
    ctx.strokeStyle = 'rgba(' + INK + ',' + (0.7 * al) + ')';
    ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.ellipse(4.5, 0, 4.5, 3.4, 0, 0, TAU); ctx.fill(); ctx.stroke(); /* gaster */
    ctx.beginPath(); ctx.ellipse(-0.5, 0, 2.4, 2, 0, 0, TAU); ctx.fill(); ctx.stroke();  /* mesosoma */
    ctx.beginPath(); ctx.ellipse(-4.5, 0, 2.6, 2.2, 0, 0, TAU); ctx.fill(); ctx.stroke(); /* head */
    ctx.restore();
  }

  function drawSpider(ctx, a) {
    var al = a.alpha, s = a.size;
    ctx.save(); ctx.scale(s, s);
    legs(ctx, 4, a.gait, a.curl, 3.5, 11, al);
    ctx.fillStyle = 'rgba(' + SHELL + ',' + (0.95 * al) + ')';
    ctx.strokeStyle = 'rgba(' + INK + ',' + (0.75 * al) + ')';
    ctx.lineWidth = 0.9;
    ctx.beginPath(); ctx.ellipse(4, 0, 6, 5, 0, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(-3, 0, 3.6, 3, 0, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(217,80,27,' + (0.7 * al) + ')';
    ctx.beginPath(); ctx.arc(-5.5, -1, 0.7, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(-5.5, 1, 0.7, 0, TAU); ctx.fill();
    ctx.restore();
  }

  function drawFly(ctx, a) {
    var al = a.alpha, s = a.size;
    ctx.save(); ctx.scale(s, s);
    /* wings blur into a shape rather than being drawn per beat —
       cheaper and closer to what a wing actually looks like */
    var beat = 0.4 + Math.abs(Math.sin(a.gait * 6)) * 0.6 * (1 - a.curl);
    ctx.fillStyle = 'rgba(' + INK + ',' + (0.16 * al) + ')';
    ctx.save(); ctx.scale(1, beat);
    ctx.beginPath(); ctx.ellipse(1, -4.5, 6, 2.6, -0.3, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(1, 4.5, 6, 2.6, 0.3, 0, TAU); ctx.fill();
    ctx.restore();
    legs(ctx, 3, a.gait, Math.max(a.curl, 0.6), 2.5, 4, al);
    ctx.fillStyle = 'rgba(' + CHITIN + ',' + (0.96 * al) + ')';
    ctx.beginPath(); ctx.ellipse(1.5, 0, 5, 3, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(217,80,27,' + (0.75 * al) + ')';
    ctx.beginPath(); ctx.arc(-3.6, 0, 2.4, 0, TAU); ctx.fill();
    ctx.restore();
  }

  function drawSilverfish(ctx, a) {
    var al = a.alpha, s = a.size;
    ctx.save(); ctx.scale(s, s);
    legs(ctx, 3, a.gait, a.curl, 4, 5, al);
    ctx.fillStyle = 'rgba(96,102,86,' + (0.9 * al) + ')';
    ctx.beginPath();
    ctx.moveTo(-7, 0);
    ctx.quadraticCurveTo(-2, -4, 4, -2.6);
    ctx.quadraticCurveTo(9, -1.4, 10, 0);
    ctx.quadraticCurveTo(9, 1.4, 4, 2.6);
    ctx.quadraticCurveTo(-2, 4, -7, 0);
    ctx.fill();
    /* three tail filaments — the give-away silhouette */
    ctx.strokeStyle = 'rgba(' + INK + ',' + (0.62 * al) + ')';
    ctx.lineWidth = 0.8;
    var w = Math.sin(a.gait * 2) * 2 * (1 - a.curl);
    ctx.beginPath();
    ctx.moveTo(10, 0); ctx.quadraticCurveTo(14, w, 17, w * 1.6);
    ctx.moveTo(10, 0); ctx.quadraticCurveTo(14, -3 + w, 16, -6 + w);
    ctx.moveTo(10, 0); ctx.quadraticCurveTo(14, 3 + w, 16, 6 + w);
    ctx.stroke();
    ctx.restore();
  }

  function drawTermite(ctx, a) {
    var al = a.alpha, s = a.size;
    ctx.save(); ctx.scale(s, s);
    legs(ctx, 3, a.gait, a.curl, 3, 5, al);
    /* Termites really are pale — they are the one insect here that
       would vanish on plaster, so they get an outline instead of a
       darker body. Accuracy first, then legibility. */
    ctx.strokeStyle = 'rgba(' + INK + ',' + (0.6 * al) + ')';
    ctx.lineWidth = 0.8;
    ctx.fillStyle = 'rgba(214,196,152,' + (0.95 * al) + ')';
    ctx.beginPath(); ctx.ellipse(3, 0, 6, 3.4, 0, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(160,132,86,' + (0.95 * al) + ')';
    ctx.beginPath(); ctx.ellipse(-4, 0, 3.2, 2.8, 0, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.restore();
  }

  function drawLeaf(ctx, a) {
    var al = a.alpha, s = a.size * 1.15;
    ctx.save(); ctx.scale(s, s);
    ctx.fillStyle = 'rgba(62,138,76,' + (0.95 * al) + ')';
    ctx.beginPath();
    ctx.moveTo(-8, 0);
    ctx.quadraticCurveTo(0, -6.5, 9, 0);
    ctx.quadraticCurveTo(0, 6.5, -8, 0);
    ctx.fill();
    ctx.strokeStyle = 'rgba(20,54,28,' + (0.7 * al) + ')';
    ctx.lineWidth = 0.7;
    ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(9, 0); ctx.stroke();
    ctx.restore();
  }

  var DRAW = {
    roach: drawRoach, ant: drawAnt, spider: drawSpider,
    fly: drawFly, silverfish: drawSilverfish, termite: drawTermite
  };


  /* ---------- 4. the swarm system ---------- */

  /* Every swarm is a canvas plus a list of agents. `progress` and
     `kill` are written by the scroll timeline; everything an agent
     does while dying is a pure function of `kill`, which is what
     makes the extermination reversible. */

  function Swarm(canvas, cfg) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: true });
    this.cfg = cfg;
    this.agents = [];
    this.progress = 0;
    this.kill = 0;
    this.leafMix = 0;
    this.visible = false;
    this.dpr = Math.min(window.devicePixelRatio || 1, lite ? 1.5 : 2);
    this.w = 0; this.h = 0;
    this.resize();
    this.populate();
  }

  Swarm.prototype.resize = function () {
    /* offsetWidth, NOT getBoundingClientRect. A rect reports the
       TRANSFORMED size, and act 2 scales its plate to 2x mid-shot —
       measuring a rect there would convince the canvas it had been
       resized and scatter every insect to a new position halfway
       through the push-in. offsetWidth is the layout box and ignores
       transforms, which is what a canvas backing store wants. */
    var w = Math.max(1, this.canvas.offsetWidth);
    var h = Math.max(1, this.canvas.offsetHeight);
    if (w === this.w && h === this.h) return;
    this.w = w; this.h = h;
    this.canvas.width = Math.round(w * this.dpr);
    this.canvas.height = Math.round(h * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    /* Corridors are authored in viewBox space; recompute the fit so
       they still land inside the walls after a resize. */
    if (this.cfg.viewBox) {
      this.fit = meetFit(w, h, this.cfg.viewBox[0], this.cfg.viewBox[1]);
    }
    this.place();
  };

  Swarm.prototype.count = function () {
    var n = this.cfg.count;
    return lite ? Math.round(n * 0.42) : n;
  };

  Swarm.prototype.populate = function () {
    this.agents.length = 0;
    var n = this.count();
    for (var i = 0; i < n; i++) this.agents.push(this.makeAgent(i, n));
    this.place();
  };

  Swarm.prototype.makeAgent = function (i, n) {
    var kind = pick(this.cfg.kinds);
    return {
      kind: kind,
      /* corridor index, if this swarm is confined */
      lane: this.cfg.corridors ? i % this.cfg.corridors.length : -1,
      x: 0, y: 0, hx: 0, hy: 0,
      dir: rand(0, TAU),
      turn: 0,
      speed: rand(this.cfg.speed[0], this.cfg.speed[1]) * (kind === 'fly' ? 2.6 : 1),
      size: rand(this.cfg.size[0], this.cfg.size[1]),
      gait: rand(0, TAU),
      curl: 0,
      alpha: 1,
      rot: 0,
      /* Entry order and death order. Both are fixed per agent so the
         same scroll position always produces the same picture. */
      born: i / n,
      thr: Math.random(),
      spin: rand(-2.4, 2.4),
      flips: Math.random() < 0.45,
      escapes: Math.random() < 0.18,
      dead: false, dx: 0, dy: 0,
      pausing: 0
    };
  };

  /* Initial / post-resize placement. */
  Swarm.prototype.place = function () {
    var self = this;
    this.agents.forEach(function (a) {
      if (self.cfg.corridors && self.fit) {
        var c = self.cfg.corridors[a.lane];
        a.x = self.fit.ox + (c[0] + Math.random() * c[2]) * self.fit.s;
        a.y = self.fit.oy + (c[1] + Math.random() * c[3]) * self.fit.s;
        /* Corridors are mostly vertical; bias heading along the long axis */
        a.dir = c[3] > c[2] ? (Math.random() < 0.5 ? Math.PI / 2 : -Math.PI / 2)
                            : (Math.random() < 0.5 ? 0 : Math.PI);
      } else if (self.cfg.band) {
        a.x = Math.random() * self.w;
        a.y = self.h * (self.cfg.band[0] + Math.random() * (self.cfg.band[1] - self.cfg.band[0]));
      } else {
        a.x = Math.random() * self.w;
        a.y = Math.random() * self.h;
      }
      a.hx = a.x; a.hy = a.y;
    });
  };

  Swarm.prototype.step = function (dt) {
    var cfg = this.cfg;

    /* A frozen swarm is a graveyard. Its poses were set once, after
       construction, and running the normal update would reset curl,
       rotation and alpha back to "alive" on the very first frame —
       standing every corpse in act 5 back up. */
    if (cfg.frozen) return;

    var pointerInside = false;
    var lx = 0, ly = 0;
    if (!coarse) {
      /* One layout read per visible swarm per frame, hoisted out of
         the agent loop. The rect IS transformed here, and that is
         correct — the pointer lives in screen space, so its position
         has to be divided back into canvas space. */
      var r = this.canvas.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) {
        lx = (px - r.left) * (this.w / r.width);
        ly = (py - r.top) * (this.h / r.height);
        pointerInside = lx > -80 && ly > -80 && lx < this.w + 80 && ly < this.h + 80;
      }
    }

    for (var i = 0; i < this.agents.length; i++) {
      var a = this.agents[i];

      /* --- how far into its death is this agent? Pure function of
         the scrubbed kill value. 0 = untouched, 1 = fully down. --- */
      var d = 0;
      if (this.kill > 0) {
        d = clamp((this.kill - a.thr * 0.86) / 0.14, 0, 1);
      }

      if (d > 0) {
        /* Freeze where it stood the first frame it was hit, so
           scrubbing inside the death window is stable. */
        if (!a.dead) { a.dead = true; a.dx = a.x; a.dy = a.y; }

        var e = easeIn(d);
        var floorY = this.h * 0.94;
        a.curl = d;
        a.alpha = 1 - 0.45 * d;
        /* Escapers get a lunge in before they go over. */
        var lunge = a.escapes ? Math.sin(d * Math.PI) * 34 : 0;
        a.x = a.dx + Math.cos(a.dir) * lunge;
        a.y = lerp(a.dy, Math.min(floorY, a.dy + 140), e) + Math.sin(d * Math.PI) * -12;
        a.rot = d * a.spin + (a.flips ? d * Math.PI : 0);
        a.gait += dt * 6 * (1 - d);
      } else {
        if (a.dead) { a.dead = false; }
        a.curl = 0; a.alpha = 1; a.rot = 0;
        this.wander(a, dt, cfg, pointerInside, lx, ly);
      }
    }
  };

  Swarm.prototype.wander = function (a, dt, cfg, pointerInside, lx, ly) {
    /* Natural-looking movement is three things: a slowly drifting
       heading, an occasional dead stop, and a hard swerve when
       something big moves nearby. Constant-velocity agents read as
       machinery immediately. */
    if (a.pausing > 0) {
      a.pausing -= dt;
      a.gait += dt * 1.2;
    } else {
      if (Math.random() < 0.004) { a.pausing = rand(0.15, 0.7); }
      a.turn += rand(-0.5, 0.5) * dt * 9;
      a.turn *= 0.9;
      a.dir += a.turn * dt;

      /* the flee reflex — hover near an insect and it runs */
      if (pointerInside) {
        var ddx = a.x - lx, ddy = a.y - ly;
        var dist2 = ddx * ddx + ddy * ddy;
        if (dist2 < 16900) {
          var dist = Math.sqrt(dist2) || 1;
          a.dir = Math.atan2(ddy, ddx);
          a.x += (ddx / dist) * 90 * dt;
          a.y += (ddy / dist) * 90 * dt;
          a.gait += dt * 26;
        }
      }

      var sp = a.speed * (cfg.speedScale ? cfg.speedScale(this.progress) : 1);
      a.x += Math.cos(a.dir) * sp * dt;
      a.y += Math.sin(a.dir) * sp * dt;
      a.gait += dt * (4 + sp * 0.22);
    }

    /* --- containment --- */
    if (cfg.corridors && this.fit) {
      var c = cfg.corridors[a.lane];
      var x0 = this.fit.ox + c[0] * this.fit.s, x1 = x0 + c[2] * this.fit.s;
      var y0 = this.fit.oy + c[1] * this.fit.s, y1 = y0 + c[3] * this.fit.s;
      /* A wall cavity is a corridor, so bounce rather than wrap —
         these things are trapped in there, and it should look like it. */
      if (a.x < x0) { a.x = x0; a.dir = Math.PI - a.dir; }
      if (a.x > x1) { a.x = x1; a.dir = Math.PI - a.dir; }
      if (a.y < y0) { a.y = y0; a.dir = -a.dir; }
      if (a.y > y1) { a.y = y1; a.dir = -a.dir; }
    } else {
      var m = 40;
      if (a.x < -m) a.x = this.w + m;
      if (a.x > this.w + m) a.x = -m;
      if (a.y < -m) a.y = this.h + m;
      if (a.y > this.h + m) a.y = -m;
    }
  };

  Swarm.prototype.render = function () {
    var ctx = this.ctx;
    ctx.clearRect(0, 0, this.w, this.h);
    if (!this.visible) return;

    /* How many of this swarm are on stage right now. Scrubbed, so the
       infestation grows and shrinks with the scrollbar. The per-agent
       fade is derived from the SAME ramp value rather than from a
       separate clock, so the last one in never pops. */
    var rampV = this.cfg.ramp ? clamp(this.cfg.ramp(this.progress), 0, 1) : 1;
    var live = Math.ceil(this.agents.length * rampV);

    for (var i = 0; i < live; i++) {
      var a = this.agents[i];
      var fade = clamp((rampV - i / this.agents.length) * 14, 0, 1);
      if (fade <= 0) continue;

      ctx.save();
      ctx.translate(a.x, a.y);
      ctx.rotate(a.dir + a.rot);

      /* contact shadow — a dead insect needs one or it floats */
      if (a.curl > 0.15) {
        ctx.save();
        ctx.rotate(-(a.dir + a.rot));
        ctx.fillStyle = 'rgba(25,30,23,' + (0.16 * a.curl) + ')';
        ctx.beginPath();
        ctx.ellipse(0, a.size * 6, a.size * 9 * a.curl, a.size * 2.4 * a.curl, 0, 0, TAU);
        ctx.fill();
        ctx.restore();
      }

      var drawn = { alpha: a.alpha * fade, size: a.size, gait: a.gait, curl: a.curl };

      if (this.leafMix > 0) {
        /* Bodies dissolve into leaves: cross-fade the two drawings
           rather than trying to tween one path into the other. At
           the midpoint both are half-there, which is exactly what
           "dissolving" looks like. */
        var lm = clamp((this.leafMix - a.born * 0.4) * 2.2, 0, 1);
        if (lm < 1) { drawn.alpha = a.alpha * fade * (1 - lm); DRAW[a.kind](ctx, drawn); }
        if (lm > 0) {
          drawn.alpha = a.alpha * fade * lm;
          ctx.rotate(lm * 0.6);
          drawLeaf(ctx, drawn);
        }
      } else {
        DRAW[a.kind](ctx, drawn);
      }

      ctx.restore();

      /* dust puff at the moment of impact — appears and clears
         inside the death window, so it also reverses */
      if (a.curl > 0.02 && a.curl < 0.85) {
        var p = Math.sin(a.curl * Math.PI);
        ctx.save();
        /* A puff of dust on plaster is darker than the plaster, not
           lighter. Inverting this is the difference between "impact"
           and "a white blob". */
        ctx.globalAlpha = p * 0.22;
        ctx.fillStyle = 'rgba(120,112,92,1)';
        ctx.beginPath();
        ctx.arc(a.x, a.y + a.size * 5, 4 + p * 16 * a.size, 0, TAU);
        ctx.fill();
        ctx.restore();
      }
    }
  };

  /* --- swarm registry --- */

  var swarms = {};
  var HOUSE_VB = [1600, 900];
  /* These corridors mirror the cavity rects in index.html, in the same
     viewBox space. Change one, change the other. */
  var HOUSE_CORRIDORS = [
    [432, 250, 36, 496],   /* cavity 1 */
    [782, 250, 32, 496],   /* cavity 2 */
    [1132, 250, 36, 496],  /* cavity 3 */
    [470, 700, 660, 50],   /* sub-floor void */
    [470, 560, 660, 16],   /* behind the skirting */
    [470, 400, 660, 18]    /* ceiling void */
  ];

  var SWARM_CFG = {
    dark:   { count: 26,  kinds: ['roach', 'spider', 'silverfish'], size: [0.9, 1.5], speed: [10, 26],
              ramp: function (p) { return 1; },
              speedScale: function (p) { return 1 + p * 9; } },      /* they scatter as you scroll */
    house:  { count: 90,  kinds: ['roach', 'ant', 'silverfish', 'spider'], size: [0.7, 1.15], speed: [12, 30],
              viewBox: HOUSE_VB, corridors: HOUSE_CORRIDORS,
              ramp: function (p) { return clamp(0.25 + p * 1.1, 0, 1); } },
    cavity: { count: 44,  kinds: ['roach', 'ant', 'spider'], size: [1.4, 2.4], speed: [16, 40],
              ramp: function (p) { return clamp(p * 2, 0, 1); } },
    below:  { count: 150, kinds: ['ant', 'termite', 'roach', 'silverfish'], size: [0.75, 1.3], speed: [14, 34],
              ramp: function (p) { return clamp(0.1 + p * 1.4, 0, 1); } },
    field:  { count: 260, kinds: ['roach', 'ant', 'fly', 'spider', 'silverfish'], size: [0.8, 1.5], speed: [16, 44],
              ramp: function (p) { return clamp(0.35 + p * 2, 0, 1); } },
    floor:  { count: 170, kinds: ['roach', 'ant', 'fly', 'silverfish'], size: [0.8, 1.4], speed: [0, 0],
              band: [0.55, 0.98], frozen: true, ramp: function (p) { return 1; } },
    mist:   { count: 0,   kinds: ['roach'], size: [1, 1], speed: [0, 0] },   /* particles, handled separately */
    pollen: { count: 0,   kinds: ['roach'], size: [1, 1], speed: [0, 0] }
  };

  $$('[data-swarm]').forEach(function (cv) {
    var key = cv.getAttribute('data-swarm');
    var cfg = SWARM_CFG[key];
    if (!cfg || !cfg.count) return;
    swarms[key] = new Swarm(cv, cfg);
  });

  /* The floor swarm is a graveyard: everything starts down, and it is
     fully populated from the first frame rather than ramping in — by
     act 5 the damage is already done. */
  if (swarms.floor) {
    swarms.floor.progress = 1;
    swarms.floor.agents.forEach(function (a) {
      a.curl = 1; a.rot = a.spin + (a.flips ? Math.PI : 0); a.alpha = 0.6;
      a.dir = rand(0, TAU);
    });
  }


  /* ---------- 5. ambient field ---------- */

  /* Dust, floating spores, and once in a while something crossing the
     whole viewport. One fixed canvas for the entire page — it is the
     cheapest way to keep air in every shot. */

  var ambCanvas = $('[data-ambient]');
  var amb = null;

  function Ambient(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    this.motes = [];
    this.flyer = null;
    this.gold = 0;     /* 0 = spores in the dark, 1 = pollen in daylight */
    this.resize();
    var n = lite ? 34 : 78;
    for (var i = 0; i < n; i++) {
      this.motes.push({
        x: Math.random() * this.w, y: Math.random() * this.h,
        r: rand(0.5, 2.1), vy: rand(-7, -1), vx: rand(-5, 5),
        ph: rand(0, TAU), a: rand(0.08, 0.4)
      });
    }
  }
  Ambient.prototype.resize = function () {
    this.w = window.innerWidth; this.h = window.innerHeight;
    this.canvas.width = Math.round(this.w * this.dpr);
    this.canvas.height = Math.round(this.h * this.dpr);
    this.canvas.style.width = this.w + 'px';
    this.canvas.style.height = this.h + 'px';
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  };
  Ambient.prototype.step = function (dt, t) {
    for (var i = 0; i < this.motes.length; i++) {
      var m = this.motes[i];
      m.y += m.vy * dt;
      m.x += (m.vx + Math.sin(t * 0.6 + m.ph) * 6) * dt;
      if (m.y < -10) { m.y = this.h + 10; m.x = Math.random() * this.w; }
      if (m.x < -10) m.x = this.w + 10;
      if (m.x > this.w + 10) m.x = -10;
    }
    /* the occasional flyer */
    if (!this.flyer && Math.random() < 0.0022) {
      var up = Math.random() < 0.5;
      this.flyer = {
        x: -40, y: rand(this.h * 0.15, this.h * 0.85),
        vx: rand(150, 320), amp: rand(14, 46), ph: 0, sz: rand(0.9, 1.6),
        dirSign: up ? 1 : -1, gait: 0
      };
    }
    if (this.flyer) {
      var f = this.flyer;
      f.x += f.vx * dt;
      f.ph += dt * 5;
      f.gait += dt * 12;
      if (f.x > this.w + 60) this.flyer = null;
    }
  };
  Ambient.prototype.render = function () {
    var ctx = this.ctx;
    ctx.clearRect(0, 0, this.w, this.h);
    var g = this.gold;
    /* Dust in a dark room glows. Dust against a bright wall is a
       speck of shadow. This lerps from grey-brown motes to warm
       pollen as the page opens out, but both are DARKER than the
       plaster behind them. */
    var col = 'rgba(' + Math.round(lerp(96, 178, g)) + ',' +
                        Math.round(lerp(92, 140, g)) + ',' +
                        Math.round(lerp(74, 52, g)) + ',';
    for (var i = 0; i < this.motes.length; i++) {
      var m = this.motes[i];
      ctx.fillStyle = col + (m.a * (0.7 + g * 0.5)) + ')';
      ctx.beginPath(); ctx.arc(m.x, m.y, m.r * (1 + g * 0.5), 0, TAU); ctx.fill();
    }
    if (this.flyer) {
      var f = this.flyer;
      ctx.save();
      ctx.translate(f.x, f.y + Math.sin(f.ph) * f.amp);
      ctx.rotate(Math.cos(f.ph) * 0.25);
      drawFly(ctx, { alpha: 0.7, size: f.sz, gait: f.gait, curl: 0 });
      ctx.restore();
    }
  };

  if (ambCanvas && !reduced) amb = new Ambient(ambCanvas);


  /* --- one ticker drives every canvas on the page --- */

  var lastT = 0;
  if (!reduced) {
    gsap.ticker.add(function (time) {
      var dt = Math.min(0.05, time - lastT);
      lastT = time;
      if (amb) { amb.step(dt, time); amb.render(); }
      for (var k in swarms) {
        var s = swarms[k];
        if (!s.visible) { continue; }
        s.step(dt);
        s.render();
      }
    });
  }


  /* ---------- 6. split text ---------- */

  function split(el) {
    if (el.dataset.done) return [];
    var text = el.textContent;
    el.setAttribute('aria-label', text);
    el.textContent = '';
    var wrap = document.createElement('span');
    wrap.className = 'split';
    wrap.setAttribute('aria-hidden', 'true');
    var chars = [];
    for (var i = 0; i < text.length; i++) {
      var s = document.createElement('span');
      s.className = 'ch';
      s.textContent = text[i];
      wrap.appendChild(s);
      if (text[i] !== ' ') chars.push(s);
    }
    el.appendChild(wrap);
    el.dataset.done = '1';
    return chars;
  }


  /* ---------- 7. hand-rolled SVG path morphing ----------
     GSAP's MorphSVG is a paid plugin and this page ships no
     third-party runtime beyond what is already vendored. Two paths
     authored with an identical command sequence can simply have
     their numbers interpolated, which is all a morph is. */

  function parsePath(d) {
    var tokens = d.match(/[a-zA-Z]|-?\d*\.?\d+(?:e[-+]?\d+)?/gi) || [];
    var cmds = [], nums = [];
    tokens.forEach(function (t) {
      if (/[a-zA-Z]/.test(t)) cmds.push({ c: t, n: nums.length });
      else nums.push(parseFloat(t));
    });
    return { cmds: cmds, nums: nums };
  }

  function makeMorph(el, toD) {
    var from = parsePath(el.getAttribute('d'));
    var to = parsePath(toD);
    if (from.nums.length !== to.nums.length) {
      console.warn('[halcyon] morph pair mismatch, skipping', el);
      return function () {};
    }
    var out = new Array(from.nums.length);
    return function (t) {
      for (var i = 0; i < out.length; i++) out[i] = lerp(from.nums[i], to.nums[i], t);
      var s = '', ni = 0, ci = 0;
      for (ci = 0; ci < from.cmds.length; ci++) {
        var next = (ci + 1 < from.cmds.length) ? from.cmds[ci + 1].n : out.length;
        s += from.cmds[ci].c + ' ';
        for (; ni < next; ni++) s += out[ni].toFixed(2) + ' ';
      }
      el.setAttribute('d', s.trim());
    };
  }


  /* ---------- 8. the shot engine ---------- */

  var slateIndex = $('[data-slate-index]');
  var slateName = $('[data-slate-name]');
  var slateBar = $('[data-slate-bar]');
  var gaugeCells = $$('[data-gauge] i');
  var SCENE = {};

  function setSlate(i, name) {
    if (slateIndex) slateIndex.textContent = String(i + 1).padStart(2, '0');
    if (slateName) slateName.textContent = name;
  }

  /* Infestation read-out. It is the plot and the progress bar at once. */
  function setGauge(v) {
    var on = Math.round(clamp(v, 0, 1) * gaugeCells.length);
    for (var i = 0; i < gaugeCells.length; i++) {
      gaugeCells[i].classList.toggle('on', i < on);
    }
  }
  setGauge(0.15);

  /* The push-in: an iris opens out of a measured point on the outgoing
     plate while that plate scales past the camera. Origin values are
     functions so invalidateOnRefresh re-measures them at every resize
     instead of baking in a percentage that only worked at one width. */
  function pushIn(tl, o) {
    var at = o.at || 0, dur = o.dur || 0.6;
    var org = o.origin;   /* function returning '61.4% 22.8%' */

    if (o.in) {
      tl.set(o.in, {
        autoAlpha: 1,
        transformOrigin: org,
        clipPath: function () { return 'circle(0% at ' + org() + ')'; }
      }, at);
      tl.fromTo(o.in,
        { clipPath: function () { return 'circle(0% at ' + org() + ')'; }, scale: 1.35 },
        { clipPath: function () { return 'circle(160% at ' + org() + ')'; },
          scale: 1, ease: 'power2.inOut', duration: dur }, at);
    }
    if (o.out) {
      tl.to(o.out, {
        scale: o.scale || 14,
        transformOrigin: org,
        autoAlpha: 0,
        ease: 'power2.in',
        duration: dur
      }, at);
    }
    return tl;
  }

  function buildShot(el, index) {
    var name = el.getAttribute('data-act') || String(index + 1);
    var length = parseFloat(el.getAttribute('data-length')) || 2.6;
    var drift = parseFloat(el.getAttribute('data-drift')) || 380;
    if (compact) length = Math.max(1.4, length * 0.66);

    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: el,
        start: 'top top',
        end: function () { return '+=' + (window.innerHeight * length); },
        pin: true,
        pinSpacing: true,
        scrub: 0.75,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onEnter: function () { setSlate(index, name); },
        onEnterBack: function () { setSlate(index, name); },
        /* Grant GPU promotion only while this act is on stage. */
        onToggle: function (self) { el.classList.toggle('is-live', self.isActive); }
      }
    });

    /* parallax: every [data-depth] inside the shot drifts across it */
    $$('[data-depth]', el).forEach(function (l) {
      var depth = parseFloat(l.getAttribute('data-depth')) || 0;
      if (!depth) return;
      var axis = l.getAttribute('data-axis') || 'x';
      var v = {};
      v[axis] = -depth * drift;
      v.duration = 1;
      tl.to(l, v, 0);
    });

    if (SCENE[name]) SCENE[name](tl, el, index);
    return tl;
  }

  /* Swarms only run while their act is on stage. A canvas nobody can
     see should not be costing frames. */
  function stageSwarm(el, keys, extra) {
    ScrollTrigger.create({
      trigger: el,
      start: 'top bottom',
      end: function () { return 'bottom top'; },
      onToggle: function (self) {
        keys.forEach(function (k) {
          if (swarms[k]) {
            swarms[k].visible = self.isActive;
            if (self.isActive) swarms[k].resize();
          }
        });
        if (extra) extra(self.isActive);
      }
    });
  }


  /* ---------- 9. the six acts ---------- */

  /* ===== ACT 1 — THE WALL ===== */
  SCENE['The wall'] = function (tl, el) {
    var eyes = $$('.eyepair', el);
    var chars = split($('h1[data-split]', el));
    var copy = $('.copy', el);
    var hidden = $('[data-hidden-life]', el);

    gsap.set(chars, { yPercent: 118, opacity: 0 });
    gsap.set(eyes, { opacity: 0 });

    /* The lens is in your hand for this act and is put down once the
       house arrives — by then the survey is not yours any more. */
    ScrollTrigger.create({
      trigger: el, start: 'top bottom', end: 'bottom top',
      onToggle: function (s) { root.style.setProperty('--lens-a', s.isActive ? '1' : '0'); }
    });

    /* eyes open one after another, then blink out as things scatter */
    tl.to(eyes, { opacity: 1, duration: 0.16, stagger: { each: 0.02, from: 'random' } }, 0.04);
    tl.to(eyes, { opacity: 0, duration: 0.1, stagger: { each: 0.012, from: 'random' } }, 0.44);

    /* headline rises letter by letter */
    tl.to(chars, {
      yPercent: 0, opacity: 1, duration: 0.34,
      stagger: { each: 0.006 }, ease: 'power3.out'
    }, 0.06);

    /* the scatter: swarm speed is a function of shot progress, and
       the whole reveal layer drifts back as the camera pulls off */
    tl.to({}, {
      duration: 1,
      onUpdate: function () {
        if (swarms.dark) swarms.dark.progress = this.progress();
      }
    }, 0);
    tl.to(hidden, { scale: 1.25, opacity: 0.4, duration: 0.5 }, 0.5);
    tl.to(copy, { opacity: 0, y: -50, duration: 0.28 }, 0.7);

    stageSwarm(el, ['dark']);
  };


  /* ===== ACT 2 — THE HOUSE ===== */
  SCENE['The house'] = function (tl, el) {
    var housePlate = $('[data-house]', el);
    var cavity = $('[data-cavity]', el);
    var chars = split($('h2[data-split]', el));
    var copy = $('.copy', el);

    /* MEASURED origin. #entry-house sits at 450,474 in the house
       SVG's 1600x900 viewBox; originVB recomputes the percentage from
       the plate's live layout box on every refresh. */
    var org = function () { return originVB(housePlate, 1600, 900, 450, 474); };

    gsap.set(chars, { yPercent: 110, opacity: 0 });
    tl.to(chars, { yPercent: 0, opacity: 1, duration: 0.3, stagger: 0.008, ease: 'power3.out' }, 0.05);

    /* Slow creep first. Cutting straight from rest into the push-in
       reads as a jump; the push has to accelerate out of something. */
    tl.fromTo(housePlate, { scale: 1 }, { scale: 2.05, transformOrigin: org, duration: 0.42 }, 0);

    tl.to({}, { duration: 1, onUpdate: function () {
      if (swarms.house) swarms.house.progress = this.progress();
    } }, 0);

    tl.to(copy, { opacity: 0, duration: 0.14 }, 0.4);

    pushIn(tl, { out: housePlate, in: cavity, origin: org, scale: 20, at: 0.44, dur: 0.5 });

    tl.to({}, { duration: 0.5, onUpdate: function () {
      if (swarms.cavity) swarms.cavity.progress = this.progress();
    } }, 0.44);

    tl.add(function () { if (slateName) slateName.textContent = 'Inside the cavity'; }, 0.62);

    stageSwarm(el, ['house', 'cavity']);
  };


  /* ===== ACT 3 — BELOW ===== */
  SCENE['Below'] = function (tl, el) {
    var tunnels = $$('[data-t]', el);
    var brood = $('[data-brood]', el);
    var walkers = $$('.walker', el);
    var rigs = $$('.spiderrig', el);
    var chars = split($('h2[data-split]', el));
    var head = $('h2[data-shake]', el);

    /* --- tunnels draw themselves on. dashoffset is scrubbed, so
       scrolling back up un-digs the colony. --- */
    tunnels.forEach(function (p) {
      var len = p.getTotalLength();
      gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
      tl.to(p, { strokeDashoffset: 0, duration: 0.5 }, rand(0, 0.14));
    });

    /* --- brood chambers --- */
    gsap.set(brood, { opacity: 0, scale: 0.5, transformOrigin: '50% 50%' });
    tl.to(brood, { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(1.6)' }, 0.32);
    /* eggs breathe: a loop, not scrubbed, because a heartbeat that
       stops when you stop scrolling looks broken */
    if (!reduced) {
      gsap.to($$('.eggcluster', el), {
        scale: 1.06, transformOrigin: '50% 50%',
        duration: 2.2, yoyo: true, repeat: -1, ease: 'sine.inOut', stagger: 0.4
      });
    }

    /* --- termites walk the galleries. getPointAtLength rather than
       CSS offset-path: identical result, no support caveats, and the
       position is a pure function of progress. --- */
    var NS = 'http://www.w3.org/2000/svg';
    var meas = document.createElementNS(NS, 'svg');
    meas.setAttribute('aria-hidden', 'true');
    meas.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
    document.body.appendChild(meas);

    walkers.forEach(function (w, i) {
      var d = w.getAttribute('data-path');
      var path = document.createElementNS(NS, 'path');
      path.setAttribute('d', d);
      meas.appendChild(path);
      var total = path.getTotalLength();
      var state = { t: rand(0, 0.2) };
      tl.to(state, {
        t: 1, duration: 0.9,
        onUpdate: function () {
          var l = clamp(state.t, 0, 1) * total;
          var pt = path.getPointAtLength(l);
          var ahead = path.getPointAtLength(Math.min(total, l + 4));
          var ang = Math.atan2(ahead.y - pt.y, ahead.x - pt.x) * 180 / Math.PI;
          w.setAttribute('transform',
            'translate(' + pt.x.toFixed(1) + ' ' + pt.y.toFixed(1) + ') rotate(' + ang.toFixed(1) + ')');
        }
      }, 0.1 + i * 0.05);
    });

    /* --- spiders descend on real threads --- */
    rigs.forEach(function (rig, i) {
      var thread = $('.thread', rig);
      var spider = $('.spider', rig);
      var y2 = parseFloat(thread.getAttribute('y2'));

      /* svgOrigin, not transformOrigin: a vertical <line> has a
         zero-width bounding box, and percentage origins resolved
         against a zero-width box are unreliable. svgOrigin is given
         in the element's own user space, where 0,0 is the anchor
         point the thread hangs from. */
      gsap.set(thread, { scaleY: 0, svgOrigin: '0 0' });

      /* The spider already carries transform="translate(0 <y2>)" in
         the markup, so GSAP's y for it is y2, not 0. Setting y:-y2
         would send it 230 units ABOVE the ceiling instead of parking
         it at the anchor. Rest position is y2; start position is 0. */
      gsap.set(spider, { y: 0, opacity: 0 });
      tl.to(thread, { scaleY: 1, duration: 0.26 }, 0.4 + i * 0.06);
      tl.to(spider, { y: y2, opacity: 1, duration: 0.26, ease: 'power2.out' }, 0.4 + i * 0.06);

      /* hover it and it drops further, then climbs back */
      if (!coarse) {
        spider.addEventListener('pointerenter', function () {
          gsap.timeline()
            .to(spider, { y: y2 + 150, duration: 0.45, ease: 'power3.in' })
            .to(thread, { scaleY: 1 + 150 / y2, duration: 0.45, ease: 'power3.in' }, 0)
            .to(spider, { y: y2, duration: 1.1, ease: 'power2.inOut' }, 0.5)
            .to(thread, { scaleY: 1, duration: 1.1, ease: 'power2.inOut' }, 0.5);
        });
      }
    });

    /* --- the swarm grows --- */
    tl.to({}, { duration: 1, onUpdate: function () {
      var p = this.progress();
      if (swarms.below) swarms.below.progress = p;
      setGauge(0.15 + p * 0.85);
    } }, 0);

    /* --- headline rises, then gets walked on --- */
    gsap.set(chars, { yPercent: 110, opacity: 0 });
    tl.to(chars, { yPercent: 0, opacity: 1, duration: 0.28, stagger: 0.007, ease: 'power3.out' }, 0.1);
    /* something lands on the text and it shakes. Random per letter,
       but seeded by index so the same scroll position shakes the same
       way both directions. */
    if (!reduced && head) {
      chars.forEach(function (c, i) {
        tl.to(c, {
          x: Math.sin(i * 12.9898) * 5,
          y: Math.cos(i * 78.233) * 4,
          rotation: Math.sin(i * 43.7) * 6,
          duration: 0.06, yoyo: true, repeat: 5, ease: 'none'
        }, 0.62 + (i % 5) * 0.012);
      });
    }

    stageSwarm(el, ['below']);
  };


  /* ===== ACT 4 — CONTACT ===== */
  SCENE['Contact'] = function (tl, el) {
    var op = $('[data-operator]', el);
    var cannon = $('[data-cannon]', el);
    var spray = $('[data-spray]', el);
    var chars = split($('h2[data-split]', el));
    var heatTurb = $('#heatTurb');
    var mistCv = $('[data-swarm="mist"]', el);
    var mistCtx = mistCv ? mistCv.getContext('2d') : null;
    var mist = [];
    var sprayOn = 0;

    /* The operator group already carries transform="translate(1140 250)".
       GSAP therefore reads x as 1140, not 0 — animating to x:0 would
       walk him off the left edge of the viewBox instead of into
       position. Read the rest position first and offset from it. */
    var opX = parseFloat(gsap.getProperty(op, 'x')) || 0;

    gsap.set(op, { x: opX + 620, opacity: 0 });
    gsap.set(spray, { scaleX: 0, opacity: 0, transformOrigin: '100% 50%' });
    gsap.set(chars, { yPercent: 110, opacity: 0 });

    /* operator walks in */
    tl.to(op, { x: opX, opacity: 1, duration: 0.3, ease: 'power3.out' }, 0.02);
    tl.to(chars, { yPercent: 0, opacity: 1, duration: 0.28, stagger: 0.008, ease: 'power3.out' }, 0.1);

    /* the spray opens up */
    tl.to(spray, { scaleX: 1, opacity: 1, duration: 0.2, ease: 'power2.out' }, 0.3);

    /* --- THE KILL. A scrubbed value, not a one-way animation. Every
       insect carries a threshold; when the value passes it, it goes
       down, and when the value drops back below it, it gets up. That
       is the whole reason scrolling up is worth doing. --- */
    tl.to({}, {
      duration: 1,
      onUpdate: function () {
        var p = this.progress();
        if (swarms.field) {
          swarms.field.progress = clamp(p * 2.2, 0, 1);
          swarms.field.kill = clamp((p - 0.32) / 0.55, 0, 1);
          sprayOn = clamp((p - 0.28) * 6, 0, 1) * (1 - clamp((p - 0.9) * 8, 0, 1));
          setGauge(1 - swarms.field.kill);
        }
        /* heat shimmer around the nozzle, desktop only */
        if (heatTurb && !lite) {
          heatTurb.setAttribute('baseFrequency', (0.008 + p * 0.02).toFixed(4) + ' ' + (0.03 + p * 0.05).toFixed(4));
        }
      }
    }, 0);

    tl.to(spray, { opacity: 0, scaleX: 0.4, duration: 0.12 }, 0.9);

    /* --- the cannon leads the scroll direction. Not on the timeline:
       this reacts to velocity, which is a live value, not a position.
       Clamped and eased so a flick does not snap it. --- */
    var aim = { r: 0 };
    ScrollTrigger.create({
      trigger: el, start: 'top bottom', end: 'bottom top',
      onUpdate: function (self) {
        var v = clamp(self.getVelocity() / 900, -1, 1);
        gsap.to(aim, { r: v * 9, duration: 0.5, overwrite: true, ease: 'power2.out',
          onUpdate: function () {
            if (cannon) cannon.setAttribute('transform', 'rotate(' + aim.r.toFixed(2) + ' 0 200)');
          } });
      }
    });

    /* --- mist particles from the nozzle. Emitted while the spray is
       on, drifting left; a swirl if you hover them. --- */
    function mistResize() {
      if (!mistCv) return;
      mistCv.width = Math.max(1, mistCv.offsetWidth);
      mistCv.height = Math.max(1, mistCv.offsetHeight);
    }

    var mistLive = false;
    stageSwarm(el, ['field'], function (active) {
      mistLive = active;
      if (active) mistResize();
      if (!active && mistCtx) mistCtx.clearRect(0, 0, mistCv.width, mistCv.height);
      if (!active) mist.length = 0;
    });
    window.addEventListener('resize', mistResize);

    if (mistCtx && !reduced) {
      var mistT = 0;
      gsap.ticker.add(function (time) {
        var dt = Math.min(0.05, time - mistT);
        mistT = time;
        if (!mistLive) return;

        var W = mistCv.width, H = mistCv.height;
        /* The nozzle is at 844,462 in the operator SVG's 1600x900
           viewBox (that is translate(1140 250) on the figure plus
           -296,212 for the #entry-nozzle marker inside the cannon).
           Running it back through the same meet transform the SVG
           uses puts the emitter on the actual nozzle at every
           viewport size, instead of on a guessed percentage that only
           lines up on one monitor. */
        var f = meetFit(W, H, 1600, 900);
        var ox = f.ox + 844 * f.s;
        var oy = f.oy + 462 * f.s;

        /* Pointer position in canvas space. Read ONCE per frame, not
           once per particle — a getBoundingClientRect inside the loop
           is a forced synchronous layout six hundred times a frame. */
        var hasP = false, hx = 0, hy = 0;
        if (!coarse) {
          var rct = mistCv.getBoundingClientRect();
          if (rct.width > 0) {
            hx = (px - rct.left) * (W / rct.width);
            hy = (py - rct.top) * (H / rct.height);
            hasP = true;
          }
        }

        if (sprayOn > 0.05) {
          var n = Math.round(sprayOn * (lite ? 2 : 5));
          for (var i = 0; i < n; i++) {
            mist.push({
              x: ox, y: oy + rand(-8, 8),
              vx: rand(-460, -220), vy: rand(-90, 90),
              r: rand(3, 12), life: 1, decay: rand(0.35, 0.75)
            });
          }
        }

        for (var j = mist.length - 1; j >= 0; j--) {
          var m = mist[j];
          m.life -= m.decay * dt;
          if (m.life <= 0) { mist.splice(j, 1); continue; }
          m.x += m.vx * dt;
          m.y += m.vy * dt;
          m.vy += 22 * dt;
          m.vx *= (1 - 0.9 * dt);
          m.r += 34 * dt;
          /* hover the cloud and it swirls: a tangential push, which
             is what makes it curl instead of just scattering */
          if (hasP) {
            var dx = m.x - hx, dy = m.y - hy;
            var d2 = dx * dx + dy * dy;
            if (d2 < 22000 && d2 > 1) {
              var d = Math.sqrt(d2);
              m.vx += (-dy / d) * 300 * dt;
              m.vy += (dx / d) * 300 * dt;
            }
          }
        }

        mistCtx.clearRect(0, 0, W, H);
        for (var k = 0; k < mist.length; k++) {
          var p2 = mist[k];
          mistCtx.fillStyle = 'rgba(94,122,100,' + (p2.life * 0.1) + ')';
          mistCtx.beginPath();
          mistCtx.arc(p2.x, p2.y, p2.r, 0, TAU);
          mistCtx.fill();
        }
      });
    }
  };


  /* ===== ACT 5 — BALANCE ===== */
  SCENE['Balance'] = function (tl, el) {
    var birds = $$('.birdrig', el);
    var wings = $$('[data-wing]', el);
    var lizard = $('[data-lizard]', el);
    var ladies = $$('.ladyrig', el);
    var glow = $('[data-dawn-glow]', el);
    var base = $('[data-dawn-base]', el);
    var chars = split($('h2[data-split]', el));

    gsap.set(chars, { yPercent: 110, opacity: 0 });
    tl.to(chars, { yPercent: 0, opacity: 1, duration: 0.28, stagger: 0.008, ease: 'power3.out' }, 0.42);

    /* birds cross the frame on scrubbed paths */
    birds.forEach(function (b, i) {
      var fromX = -260 - i * 180, toX = 1780 + i * 90;
      var y = 180 + i * 190;
      gsap.set(b, { x: fromX, y: y, opacity: 0 });
      tl.to(b, { opacity: 1, duration: 0.06 }, 0.1 + i * 0.05);
      tl.to(b, {
        x: toX, duration: 0.8, ease: 'none',
        onUpdate: function () {
          /* a bird does not fly in a straight line */
          var p = this.progress();
          gsap.set(b, { y: y + Math.sin(p * 7 + i) * 46 });
        }
      }, 0.1 + i * 0.05);
    });
    /* wingbeat is scrubbed too — scroll backwards and they fly
       backwards, which is the tell that nothing here is on a timer */
    tl.to(wings, {
      rotation: -46, transformOrigin: '10% 60%',
      duration: 0.05, repeat: 15, yoyo: true, ease: 'sine.inOut'
    }, 0.1);

    /* the lizard */
    gsap.set(lizard, { x: -320, opacity: 0 });
    tl.to(lizard, { opacity: 1, duration: 0.05 }, 0.3);
    tl.to(lizard, { x: 420, duration: 0.32, ease: 'power1.inOut' }, 0.3);
    tl.to(lizard, { x: 560, duration: 0.24, ease: 'power2.out' }, 0.68);

    /* ladybugs land */
    ladies.forEach(function (l, i) {
      var tx = 380 + i * 340, ty = 700 + (i % 2) * 40;
      gsap.set(l, { x: tx, y: ty - 420, opacity: 0, rotation: -30 });
      tl.to(l, { opacity: 1, duration: 0.05 }, 0.44 + i * 0.06);
      tl.to(l, { y: ty, rotation: 0, duration: 0.3, ease: 'bounce.out' }, 0.44 + i * 0.06);
    });

    /* the light comes back and the bodies become leaves */
    tl.to(glow, { opacity: 1, duration: 0.5 }, 0.35);
    /* the grade lifts: dull plaster warms toward the clean act */
    tl.to(base, { attr: { fill: '#F6F3E7' }, duration: 0.6 }, 0.3);
    tl.to({}, {
      duration: 1,
      onUpdate: function () {
        var p = this.progress();
        if (swarms.floor) swarms.floor.leafMix = clamp((p - 0.35) / 0.5, 0, 1);
        if (amb) amb.gold = clamp((p - 0.4) / 0.5, 0, 1) * 0.6;
        setGauge(clamp(0.12 - p * 0.12, 0, 1));
      }
    }, 0);

    stageSwarm(el, ['floor']);
  };


  /* ===== ACT 6 — HALCYON ===== */
  SCENE['Halcyon'] = function (tl, el) {
    var chars = split($('h2[data-split]', el));
    var glass = $('[data-glass]', el);
    var grass = $$('.clean-grass', el);
    var blooms = $$('.bloom', el);
    var rays = $('[data-rays]', el);
    var sky = $('[data-sky]', el);
    var night = $('[data-nightsky]', el);
    var copy = $('.copy', el);

    /* --- the morph. Same command sequence, different numbers. --- */
    var pairs = [
      ['body',     'M380 380 L800 300 L1220 380 L1220 760 L380 760 Z'],
      ['roofline', 'M340 392 L800 286 L1260 392 L1220 392 L800 330 L380 392 Z'],
      ['ground',   'M0 748 Q 400 726 800 752 T 1600 738 L1600 900 L0 900 Z']
    ];
    var morphs = pairs.map(function (p) {
      var node = $('[data-morph="' + p[0] + '"]', el);
      return node ? { node: node, fn: makeMorph(node, p[1]) } : null;
    }).filter(Boolean);

    tl.to({}, {
      duration: 0.55,
      onUpdate: function () {
        var t = gsap.parseEase('power2.inOut')(this.progress());
        morphs.forEach(function (m) { m.fn(t); });
      }
    }, 0.05);

    morphs.forEach(function (m) {
      tl.to(m.node, { opacity: 1, duration: 0.4 }, 0.1);
    });

    /* day arrives */
    tl.to(night, { opacity: 0, duration: 0.5 }, 0.12);
    tl.to(sky, { opacity: 1, duration: 0.5 }, 0.12);
    tl.to(rays, { opacity: 1, duration: 0.3 }, 0.34);
    tl.fromTo(rays, { rotation: -7, transformOrigin: '50% 0%' },
                    { rotation: 5, duration: 0.7, ease: 'sine.inOut' }, 0.3);

    /* windows light up */
    tl.to(glass, { opacity: 1, duration: 0.28 }, 0.42);

    /* grass grows from the roots, flowers open */
    gsap.set(grass, { scaleY: 0, transformOrigin: '50% 100%' });
    tl.to($('[data-grass]', el), { opacity: 1, duration: 0.05 }, 0.4);
    tl.to(grass, { scaleY: 1, duration: 0.3, stagger: 0.012, ease: 'back.out(1.7)' }, 0.42);

    gsap.set(blooms, { scale: 0, transformOrigin: '50% 100%' });
    tl.to($('[data-blooms]', el), { opacity: 1, duration: 0.05 }, 0.5);
    tl.to(blooms, { scale: 1, rotation: 0, duration: 0.3, stagger: 0.04, ease: 'back.out(2)' }, 0.52);

    /* headline + CTA */
    gsap.set(chars, { yPercent: 110, opacity: 0 });
    gsap.set(copy, { opacity: 0 });
    tl.to(copy, { opacity: 1, duration: 0.1 }, 0.52);
    tl.to(chars, { yPercent: 0, opacity: 1, duration: 0.3, stagger: 0.008, ease: 'power3.out' }, 0.54);

    /* pollen replaces spores */
    tl.to({}, { duration: 1, onUpdate: function () {
      if (amb) amb.gold = clamp(0.6 + this.progress() * 0.4, 0, 1);
    } }, 0);

    ScrollTrigger.create({
      trigger: el, start: 'top bottom', end: 'bottom top',
      onLeaveBack: function () { if (amb) amb.gold = 0.6; }
    });
  };


  /* ---------- the specimen belt (horizontal) ---------- */

  (function belt() {
    var track = $('[data-belt]');
    if (!track || reduced) return;
    var section = track.closest('.belt');
    gsap.to(track, {
      x: function () {
        /* scroll the strip exactly as far as it overflows, never more */
        return -Math.max(0, track.scrollWidth - window.innerWidth + 40);
      },
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.9,
        invalidateOnRefresh: true
      }
    });
  })();


  /* ---------- reveals ---------- */

  $$('[data-reveal]').forEach(function (el) {
    if (reduced) return;
    gsap.fromTo(el, { autoAlpha: 0, y: 28 },
      { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
  });


  /* ---------- button ripple ---------- */

  $$('[data-ripple]').forEach(function (btn) {
    btn.addEventListener('pointerdown', function (e) {
      var r = btn.getBoundingClientRect();
      var d = document.createElement('span');
      d.className = 'cta__ripple';
      d.style.left = (e.clientX - r.left) + 'px';
      d.style.top = (e.clientY - r.top) + 'px';
      btn.appendChild(d);
      gsap.to(d, {
        scale: Math.max(r.width, r.height) / 6, opacity: 0,
        duration: 0.7, ease: 'power2.out',
        onComplete: function () { d.remove(); }
      });
    });
  });


  /* ---------- 10. the last cockroach ----------
     (There is no audio on this page. It carries no sound files and
     synthesises none — the silence is deliberate, not an omission.) */

  (function lastOne() {
    var bug = $('[data-lastbug]');
    var black = $('[data-blackout]');
    if (!bug || !black || reduced) return;
    var escapes = 0, armed = false;

    function placeBug() {
      var x = rand(window.innerWidth * 0.15, window.innerWidth * 0.85);
      var y = rand(window.innerHeight * 0.35, window.innerHeight * 0.8);
      gsap.set(bug, { x: x, y: y, rotation: rand(0, 360) });
    }

    ScrollTrigger.create({
      trigger: '#outro',
      start: 'top 60%',
      once: true,
      onEnter: function () {
        armed = true;
        placeBug();
        gsap.to(bug, { opacity: 1, duration: 1.4, delay: 1.6 });
      }
    });

    bug.addEventListener('pointerenter', function () {
      if (!armed) return;
      escapes++;
      /* it runs, and it runs in the direction away from you */
      var r = bug.getBoundingClientRect();
      var ang = Math.atan2(r.top + 15 - py, r.left + 15 - px);
      var dist = rand(220, 460);
      gsap.to(bug, {
        x: '+=' + Math.cos(ang) * dist,
        y: '+=' + Math.sin(ang) * dist,
        rotation: ang * 180 / Math.PI,
        duration: 0.55,
        ease: 'power3.out'
      });

      if (escapes >= 3) {
        armed = false;
        gsap.timeline()
          .to(bug, { opacity: 0, duration: 0.5 }, 0.4)
          .to(black, { opacity: 1, duration: 1.1, ease: 'power2.inOut' }, 0.5)
          .to($('p', black), { opacity: 1, duration: 1.4 }, 1.1)
          .to(black, { opacity: 0, duration: 1.6, ease: 'power2.inOut' }, 4.2)
          .set(black, { pointerEvents: 'none' })
          .add(function () {
            escapes = 0;
            gsap.set($('p', black), { opacity: 0 });
            placeBug();
            gsap.to(bug, { opacity: 1, duration: 1.2, delay: 2 });
            armed = true;
          });
      }
    });
  })();


  /* ---------- 11. boot ---------- */

  /* smooth scroll: desktop only. Native momentum on a phone beats
     anything JS can do, and Lenis fights it. */
  if (!reduced && !coarse && typeof Lenis !== 'undefined') {
    var lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.92 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  /* Build the acts — but ONLY when motion is wanted.
     Under prefers-reduced-motion the CSS fallback has already laid
     every act out as a stacked, readable panel. Running the scene
     functions anyway would be actively harmful: each one opens by
     setting its artwork to opacity 0 / scale 0 in preparation for a
     scrubbed reveal that, with pinning and scrubbing disabled, would
     never arrive. The result would be a page of blank boxes. Not
     building them is the fallback. */
  if (!reduced) {
    $$('[data-act]').forEach(buildShot);
  }

  /* page progress in the slate */
  (function progress() {
    if (!slateBar) return;
    function onScroll() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var p = max > 0 ? window.scrollY / max : 0;
      slateBar.style.transform = 'scaleX(' + clamp(p, 0, 1) + ')';
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  })();

  /* resize: canvases are sized from layout, so they must be re-fitted
     before ScrollTrigger recomputes pinned end points */
  var rTimer;
  window.addEventListener('resize', function () {
    clearTimeout(rTimer);
    rTimer = setTimeout(function () {
      if (amb) amb.resize();
      for (var k in swarms) swarms[k].resize();
      ScrollTrigger.refresh();
    }, 160);
  });

  /* Fonts change layout height. Refresh once they land or the last
     act's pin ends in the wrong place. */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  }
  window.addEventListener('load', function () {
    for (var k in swarms) swarms[k].resize();
    ScrollTrigger.refresh();
  });

  root.classList.remove('booting');
  setSlate(0, 'The wall');

})();
