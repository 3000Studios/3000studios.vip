/* ============================================================================
   LIQUID A — liquid.js  ·  3000 Studios VIP v2
   Contained canvas liquid surface: dark water / liquid chrome in the VIP
   aurora palette (violet · cyan · magenta · gold on deep blue-black).

   Vanilla JS, no dependencies, no build step. Drop in and:
     const surface = new LiquidSurface(document.querySelector('#hero-liquid'));
     surface.spawnRipple(x, y, strength);        // pointer does this for you
     LiquidBeat.setBeat(0.8);                    // from your audio analyser
     LiquidBeat.pulse();                         // on a kick / downbeat

   Shared beat hub (window.LiquidBeat): ONE signal drives the surface, the
   carousel bob and the nav dance, so the whole page grooves together.
   When no external beat arrives for ~3s the hub falls back to a gentle
   idle rhythm of its own — the page never looks dead, never fakes "playing".

   Perf law (hard budget):
   - devicePixelRatio capped at 1.75 (1.5 on narrow screens), backing store
     also capped at 1680 CSS px wide — hero canvas cost stays flat.
   - Ripples are a bounded pool (36 max), drawn as stroked arcs — no
     per-pixel heightfield, no filters, no shadowBlur in the hot loop.
   - Loop runs ONLY while the canvas is on-screen (IntersectionObserver)
     and the tab is visible (visibilitychange). Hidden = zero cost.
   ========================================================================== */
(function (global) {
  'use strict';

  /* ------------------------------------------------------------------ */
  /* OKLCH -> sRGB (canvas needs rgb). Reads the site's live VIP tokens  */
  /* so the liquid matches the CSS palette exactly; falls back to the   */
  /* pinned vip-redesign.css values when tokens are absent.             */
  /* ------------------------------------------------------------------ */
  function oklchToRgb(L, C, h) {
    var hr = (h * Math.PI) / 180;
    var a = C * Math.cos(hr), b = C * Math.sin(hr);
    var l = Math.pow(L + 0.3963377774 * a + 0.2158037573 * b, 3);
    var m = Math.pow(L - 0.1055613458 * a - 0.0638541728 * b, 3);
    var s = Math.pow(L - 0.0894841775 * a - 1.291485548 * b, 3);
    function ch(v) {
      v = v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
      return Math.round(Math.min(1, Math.max(0, v)) * 255);
    }
    return [
      ch(+4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
      ch(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
      ch(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s)
    ];
  }
  function parseOklch(str, fallback) {
    var m = /oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)/.exec(str || '');
    return m ? oklchToRgb(+m[1], +m[2], +m[3]) : fallback;
  }
  function rgba(rgb, a) { return 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + a + ')'; }

  var FALLBACK = {
    bg: [13, 15, 26],        /* oklch(0.16 0.02 260) */
    deep: [7, 8, 16],
    cyan: [103, 227, 249],   /* --vip-cyan    oklch(0.87 0.15 200) */
    violet: [124, 92, 246],  /* aurora violet oklch(0.62 0.20 285) */
    magenta: [232, 58, 148], /* --acss-brand-2 oklch(0.66 0.24 350) */
    gold: [242, 193, 78]     /* --acss-brand   oklch(0.82 0.14 85)  */
  };
  function readPalette() {
    try {
      var cs = getComputedStyle(document.documentElement);
      return {
        bg: parseOklch(cs.getPropertyValue('--acss-bg'), FALLBACK.bg),
        deep: FALLBACK.deep,
        cyan: parseOklch(cs.getPropertyValue('--vip-cyan'), FALLBACK.cyan),
        violet: parseOklch('oklch(0.62 0.20 285)', FALLBACK.violet),
        magenta: parseOklch(cs.getPropertyValue('--acss-brand-2'), FALLBACK.magenta),
        gold: parseOklch(cs.getPropertyValue('--acss-brand'), FALLBACK.gold)
      };
    } catch (e) { return FALLBACK; }
  }

  /* ------------------------------------------------------------------ */
  /* LiquidBeat — the shared groove hub.                                */
  /*   .setBeat(0..1)  continuous intensity from an AnalyserNode        */
  /*   .pulse()        discrete kick: spikes energy, notifies listeners */
  /*   .energy         smoothed 0..1 (surfaces/nav/carousel read this)  */
  /*   .phase          beat phase 0..1 advancing with the groove        */
  /*   .onPulse(fn)    subscribe (carousel bob accents, nav pops)       */
  /* ------------------------------------------------------------------ */
  var listeners = [];
  var hub = {
    energy: 0, target: 0, phase: 0, lastFeed: -1e9, _impulse: 0,
    setBeat: function (v) {
      this.target = Math.min(1, Math.max(0, +v || 0));
      this.lastFeed = performance.now();
    },
    pulse: function (strength) {
      this._impulse = Math.min(1, (strength == null ? 0.85 : strength));
      this.lastFeed = performance.now();
      for (var i = 0; i < listeners.length; i++) {
        try { listeners[i](this._impulse); } catch (e) {}
      }
    },
    onPulse: function (fn) { listeners.push(fn); },
    /* Called once per frame by whichever consumer is running (surface,
       nav dance…). Guarded by timestamp so multiple callers in the same
       frame never double-integrate the groove. */
    _tick: function (now, dt) {
      if (this._lastTick === now) return;
      this._lastTick = now;
      var idle = now - this.lastFeed > 3000;
      if (idle) {
        /* Gentle self-groove: slow sine swell, ~52 BPM half-time feel. */
        this.target = 0.16 + 0.1 * (0.5 + 0.5 * Math.sin(now * 0.00055));
        if (Math.sin(now * 0.00173) > 0.9965 && now - (this._lastIdlePulse || 0) > 1800) {
          this._lastIdlePulse = now; this._impulse = Math.max(this._impulse, 0.3);
        }
      }
      var k = 1 - Math.pow(0.0015, dt / 1000); /* fast attack-ish smoothing */
      this.energy += (this.target - this.energy) * Math.min(1, k);
      this.energy = Math.min(1, this.energy + this._impulse * 0.55);
      this._impulse *= Math.pow(0.02, dt / 1000); /* impulse decay */
      this.energy *= Math.pow(0.55, dt / 1000);    /* natural settle */
      this.phase = (this.phase + dt / (idle ? 1150 : 545)) % 1;
      return idle;
    }
  };
  global.LiquidBeat = hub;

  /* ------------------------------------------------------------------ */
  /* LiquidSurface                                                      */
  /* ------------------------------------------------------------------ */
  var MAX_RIPPLES = 36;

  function LiquidSurface(canvas, opts) {
    if (!canvas || !canvas.getContext) throw new Error('LiquidSurface: canvas required');
    opts = opts || {};
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.pal = readPalette();
    this.ripples = [];
    this.running = false;
    this._raf = 0; this._last = 0; this._t = Math.random() * 100;
    this._pointerDown = false; this._lastSpawn = 0;
    this.interactive = opts.interactive !== false;
    this._bind();
    this.resize();
    this._observe();
    var self = this;
    hub.onPulse(function (s) { self._onPulse(s); });
  }

  LiquidSurface.prototype._bind = function () {
    var self = this, c = this.canvas;
    this._onResize = function () { self.resize(); };
    global.addEventListener('resize', this._onResize, { passive: true });
    if (!this.interactive) return;
    function pos(e) {
      var r = c.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top, w: r.width, h: r.height };
    }
    c.addEventListener('pointerdown', function (e) {
      self._pointerDown = true;
      var p = pos(e); self.spawnRipple(p.x, p.y, 1);
    });
    c.addEventListener('pointermove', function (e) {
      if (!self._pointerDown) return;
      var now = performance.now();
      if (now - self._lastSpawn < 46) return; /* trail throttle */
      self._lastSpawn = now;
      var p = pos(e); self.spawnRipple(p.x, p.y, 0.55);
    });
    function up() { self._pointerDown = false; }
    c.addEventListener('pointerup', up);
    c.addEventListener('pointercancel', up);
    c.addEventListener('pointerleave', up);
  };

  LiquidSurface.prototype._observe = function () {
    var self = this;
    this._vis = function () { document.hidden ? self._stop() : self._maybeStart(); };
    document.addEventListener('visibilitychange', this._vis);
    if ('IntersectionObserver' in global) {
      this._io = new IntersectionObserver(function (en) {
        self._onScreen = en[0].isIntersecting;
        self._onScreen ? self._maybeStart() : self._stop();
      }, { threshold: 0.02 });
      this._io.observe(this.canvas);
    } else { this._onScreen = true; this._maybeStart(); }
  };

  LiquidSurface.prototype._maybeStart = function () {
    if (this._onScreen && !document.hidden && !this.running) {
      this.running = true; this._last = performance.now();
      var self = this;
      this._raf = requestAnimationFrame(function (t) { self._frame(t); });
    }
  };
  LiquidSurface.prototype._stop = function () {
    this.running = false;
    if (this._raf) cancelAnimationFrame(this._raf);
    this._raf = 0;
  };

  LiquidSurface.prototype.resize = function () {
    var c = this.canvas;
    var w = c.clientWidth || c.parentElement.clientWidth || 300;
    var h = c.clientHeight || c.parentElement.clientHeight || 200;
    var dpr = Math.min(global.devicePixelRatio || 1, w < 680 ? 1.5 : 1.75);
    var bw = Math.min(Math.round(w * dpr), 1680);
    var bh = Math.round(bw * (h / w));
    if (c.width !== bw || c.height !== bh) { c.width = bw; c.height = bh; }
    this.w = w; this.h = h; this.sx = bw / w; this.sy = bh / h;
  };

  LiquidSurface.prototype.spawnRipple = function (x, y, strength) {
    if (this.ripples.length >= MAX_RIPPLES) this.ripples.shift();
    this.ripples.push({
      x: x, y: y, r: 2, max: 90 + (strength || 0.6) * 150,
      a: 0.55 * (strength || 0.6), v: 0.9 + (strength || 0.6) * 1.1
    });
  };
  LiquidSurface.prototype._onPulse = function (s) {
    /* A kick sends one ring out of the lower-centre — the "stage floor". */
    if (this.w) this.spawnRipple(this.w * (0.3 + Math.random() * 0.4), this.h * 0.92, 0.35 + s * 0.5);
  };

  /* Wave height in CSS px at horizontal fraction x01 — the carousel reads
     this so panels bob ON the same water the canvas draws. */
  LiquidSurface.prototype.waveHeight = function (x01) {
    var t = this._t, e = hub.energy;
    return Math.sin(x01 * 5.1 + t * 0.9) * (2.2 + e * 3.4)
         + Math.sin(x01 * 9.3 - t * 1.35) * (1.1 + e * 1.8);
  };
  Object.defineProperty(LiquidSurface.prototype, 'energy', { get: function () { return hub.energy; } });

  LiquidSurface.prototype._frame = function (now) {
    if (!this.running) return;
    var self = this;
    this._raf = requestAnimationFrame(function (t) { self._frame(t); });
    var dt = Math.min(50, now - this._last || 16.7);
    this._last = now;
    this._t += dt / 1000;
    hub._tick(now, dt);
    this._draw();
  };

  LiquidSurface.prototype._draw = function () {
    var ctx = this.ctx, pal = this.pal, t = this._t, e = hub.energy;
    var W = this.canvas.width, H = this.canvas.height;
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    /* Base water: deep vertical falloff. */
    var g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, rgba(pal.bg, 1));
    g.addColorStop(0.55, rgba(pal.deep, 1));
    g.addColorStop(1, rgba(pal.bg, 1));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    /* Aurora blooms — two slow radial washes, hotter with the beat. */
    this._bloom(ctx, W * (0.22 + 0.05 * Math.sin(t * 0.11)), H * 0.28,
      W * 0.55, pal.violet, 0.10 + e * 0.10);
    this._bloom(ctx, W * (0.82 + 0.04 * Math.cos(t * 0.09)), H * 0.72,
      W * 0.5, pal.cyan, 0.08 + e * 0.12);
    this._bloom(ctx, W * 0.55, H * 1.05, W * 0.6, pal.magenta, 0.05 + e * 0.06);

    /* Liquid-chrome wave bands — stacked sine ribbons near the floor. */
    for (var i = 0; i < 3; i++) {
      var baseY = H * (0.68 + i * 0.1);
      var amp = (5 + i * 3.5) * this.sy * (0.55 + e * 1.15);
      var col = i === 1 ? pal.cyan : (i === 0 ? pal.violet : pal.magenta);
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (var x = 0; x <= W; x += 14) {
        var y = baseY + this.waveHeight(x / W) * this.sy * (1 + i * 0.35)
              + Math.sin(x * 0.004 + t * (0.5 + i * 0.22)) * amp * 0.4;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(W, H); ctx.closePath();
      ctx.fillStyle = rgba(col, 0.05 + i * 0.02 + e * 0.045);
      ctx.fill();
      /* Specular crest line — the chrome edge. */
      ctx.beginPath();
      for (x = 0; x <= W; x += 14) {
        var y2 = baseY + this.waveHeight(x / W) * this.sy * (1 + i * 0.35)
               + Math.sin(x * 0.004 + t * (0.5 + i * 0.22)) * amp * 0.4;
        x === 0 ? ctx.moveTo(x, y2) : ctx.lineTo(x, y2);
      }
      ctx.strokeStyle = rgba(col, 0.16 + e * 0.22);
      ctx.lineWidth = Math.max(1, this.sy);
      ctx.stroke();
    }

    /* Ripples: expanding rings with a bright leading edge + soft echo. */
    var rip = this.ripples;
    for (var j = rip.length - 1; j >= 0; j--) {
      var r = rip[j];
      r.r += r.v * (this.sx + this.sy) * 0.5 * 1.35;
      var k = r.r / r.max;
      if (k >= 1) { rip.splice(j, 1); continue; }
      var alpha = r.a * (1 - k) * (1 - k);
      var cx = r.x * this.sx, cy = r.y * this.sy, rad = r.r * this.sx;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rad, rad * 0.42, 0, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(pal.cyan, alpha);
      ctx.lineWidth = Math.max(1, 2.2 * this.sy * (1 - k));
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(cx, cy, rad * 0.62, rad * 0.26, 0, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(pal.gold, alpha * 0.5);
      ctx.lineWidth = Math.max(1, this.sy);
      ctx.stroke();
    }

    /* Beat flash: a breath of gold on the kick, from the floor up. */
    if (hub._impulse > 0.03) {
      var fg = ctx.createLinearGradient(0, H, 0, H * 0.4);
      fg.addColorStop(0, rgba(pal.gold, hub._impulse * 0.10));
      fg.addColorStop(1, rgba(pal.gold, 0));
      ctx.fillStyle = fg; ctx.fillRect(0, 0, W, H);
    }
  };

  LiquidSurface.prototype._bloom = function (ctx, x, y, r, col, a) {
    var g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, rgba(col, a));
    g.addColorStop(1, rgba(col, 0));
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  };

  LiquidSurface.prototype.destroy = function () {
    this._stop();
    global.removeEventListener('resize', this._onResize);
    document.removeEventListener('visibilitychange', this._vis);
    if (this._io) this._io.disconnect();
  };

  /* Static conveniences — broadcast to the hub (all surfaces follow). */
  LiquidSurface.setBeat = function (v) { hub.setBeat(v); };
  LiquidSurface.pulse = function (s) { hub.pulse(s); };

  global.LiquidSurface = LiquidSurface;
})(typeof window !== 'undefined' ? window : this);
