/* ============================================================================
   LIQUID A — carousel.js  ·  3000 Studios VIP v2
   Video panels floating ON the liquid surface. Inward-perspective arc on
   desktop, vertical perspective stack on phones. Every panel is present and
   playing (muted / loop / playsinline); the ring auto-rotates each panel to
   the front in turn; swipe / drag with inertia; click fires onSelect(slug).

   Vanilla JS. Pairs with carousel.css and (optionally) a LiquidSurface
   instance — panels bob on the SAME wave math the canvas draws, driven by
   the shared window.LiquidBeat groove.

     new LiquidCarousel(stageEl, [
       { slug:'neon-highway', src:'…/preview.mp4', poster:'…jpg', label:'Neon Highway' },
       …
     ], { liquid: surface, onSelect: function(slug){ … } });

   Panels without `src` render as gradient placeholder tiles (demo mode).
   ========================================================================== */
(function (global) {
  'use strict';

  function LiquidCarousel(stage, panels, opts) {
    if (!stage) throw new Error('LiquidCarousel: stage element required');
    opts = opts || {};
    this.stage = stage;
    this.panels = panels || [];
    this.liquid = opts.liquid || null;
    this.onSelect = typeof opts.onSelect === 'function' ? opts.onSelect : function () {};
    this.rotateMs = opts.rotateMs || 4200;   /* dwell per panel at front */
    this.idleResumeMs = 2600;                /* auto-rotate resumes after drag */
    this.angle = 0;                          /* ring rotation (turns) */
    this.vel = 0;
    this.target = 0;
    this.lastInteract = 0;
    this.lastAdvance = performance.now();
    this._drag = null;
    this._t = Math.random() * 10;
    this._build();
    this._bind();
    this._observe();
  }

  LiquidCarousel.prototype._build = function () {
    var doc = document;
    this.stage.classList.add('lq-stage');
    this.ring = doc.createElement('div');
    this.ring.className = 'lq-ring';
    this.els = this.panels.map(function (p, i) {
      var el = doc.createElement('article');
      el.className = 'lq-panel';
      el.dataset.slug = p.slug || ('panel-' + i);
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      el.setAttribute('aria-label', p.label || p.slug || 'video');
      if (p.src) {
        var v = doc.createElement('video');
        v.src = p.src;
        v.muted = true; v.loop = true; v.autoplay = true;
        v.playsInline = true; v.setAttribute('playsinline', '');
        v.preload = 'auto';
        if (p.poster) v.poster = p.poster;
        el.appendChild(v);
      } else {
        var ph = doc.createElement('div');
        ph.className = 'lq-panel__ph';
        ph.style.setProperty('--ph-hue', (p.hue != null ? p.hue : 265 + i * 22) + '');
        el.appendChild(ph);
      }
      var cap = doc.createElement('span');
      cap.className = 'lq-panel__cap';
      cap.textContent = p.label || p.slug || '';
      el.appendChild(cap);
      var sheen = doc.createElement('span');
      sheen.className = 'lq-panel__sheen';
      el.appendChild(sheen);
      this.ring.appendChild(el);
      return el;
    }, this);
    this.stage.appendChild(this.ring);
  };

  LiquidCarousel.prototype._bind = function () {
    var self = this, stage = this.stage;
    function down(e) {
      self._drag = { x: e.clientX, y: e.clientY, moved: 0, angle: self.target, t: performance.now() };
      self.vel = 0;
      stage.setPointerCapture && e.pointerId != null && stage.setPointerCapture(e.pointerId);
    }
    function move(e) {
      if (!self._drag) return;
      var vertical = self._vertical();
      var d = vertical ? (e.clientY - self._drag.y) : (e.clientX - self._drag.x);
      self._drag.moved = Math.max(self._drag.moved, Math.abs(d));
      var span = (vertical ? stage.clientHeight : stage.clientWidth) || 1;
      self.target = self._drag.angle + (d / span) * 0.9;
      self.lastInteract = performance.now();
    }
    function up(e) {
      if (!self._drag) return;
      var moved = self._drag.moved, drag = self._drag;
      self._drag = null;
      self.lastInteract = performance.now();
      if (moved < 7) {
        /* Treat as a click: find the panel under the pointer. */
        var el = document.elementFromPoint(e.clientX, e.clientY);
        var panel = el && el.closest ? el.closest('.lq-panel') : null;
        if (panel) { self.onSelect(panel.dataset.slug); return; }
      }
      /* Flick inertia + snap the nearest panel to the front. */
      var dt = Math.max(16, performance.now() - drag.t);
      var step = 1 / Math.max(1, self.panels.length);
      var flick = (self.target - drag.angle) * (120 / dt);
      self.target += flick * 0.12;
      self.target = Math.round(self.target / step) * step;
    }
    stage.addEventListener('pointerdown', down);
    stage.addEventListener('pointermove', move);
    stage.addEventListener('pointerup', up);
    stage.addEventListener('pointercancel', up);
    stage.addEventListener('keydown', function (e) {
      var panel = e.target.closest ? e.target.closest('.lq-panel') : null;
      if (panel && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault(); self.onSelect(panel.dataset.slug);
      }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { self.next(); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { self.prev(); }
    });
  };

  LiquidCarousel.prototype._vertical = function () {
    return this.stage.clientWidth < 680;
  };
  LiquidCarousel.prototype.next = function () {
    this.target += 1 / Math.max(1, this.panels.length);
    this.lastInteract = performance.now();
  };
  LiquidCarousel.prototype.prev = function () {
    this.target -= 1 / Math.max(1, this.panels.length);
    this.lastInteract = performance.now();
  };
  LiquidCarousel.prototype.goTo = function (i) {
    var step = 1 / Math.max(1, this.panels.length);
    /* Panel i fronts when angle ≡ -i*step (mod 1 turn); take the nearest. */
    var m = Math.round(this.target + i * step);
    this.target = m - i * step;
    this.lastInteract = performance.now();
  };

  LiquidCarousel.prototype._observe = function () {
    var self = this;
    this._vis = function () { document.hidden ? self._stop() : self._maybeStart(); };
    document.addEventListener('visibilitychange', this._vis);
    if ('IntersectionObserver' in global) {
      this._io = new IntersectionObserver(function (en) {
        self._onScreen = en[0].isIntersecting;
        self._onScreen ? self._maybeStart() : self._stop();
      }, { threshold: 0.05 });
      this._io.observe(this.stage);
    } else { this._onScreen = true; this._maybeStart(); }
  };
  LiquidCarousel.prototype._maybeStart = function () {
    if (this._onScreen && !document.hidden && !this.running) {
      this.running = true; this._last = performance.now();
      var self = this;
      this._raf = requestAnimationFrame(function (t) { self._frame(t); });
    }
  };
  LiquidCarousel.prototype._stop = function () {
    this.running = false;
    if (this._raf) cancelAnimationFrame(this._raf);
    this._raf = 0;
  };

  LiquidCarousel.prototype._frame = function (now) {
    if (!this.running) return;
    var self = this;
    this._raf = requestAnimationFrame(function (t) { self._frame(t); });
    var dt = Math.min(50, now - this._last || 16.7);
    this._last = now;
    this._t += dt / 1000;

    var n = Math.max(1, this.panels.length);
    var step = 1 / n;
    /* Auto-advance when the visitor isn't driving. */
    if (!this._drag && now - this.lastInteract > this.idleResumeMs &&
        now - this.lastAdvance > this.rotateMs) {
      this.lastAdvance = now;
      this.target += step;
    }
    /* Critically-damped glide toward target. */
    var k = 1 - Math.pow(0.002, dt / 1000);
    this.angle += (this.target - this.angle) * Math.min(1, k);
    if (Math.abs(this.target - this.angle) < 0.00004) this.angle = this.target;

    var vertical = this._vertical();
    var W = this.stage.clientWidth, H = this.stage.clientHeight;
    var beat = global.LiquidBeat ? global.LiquidBeat.energy : 0.12;
    var front = ((Math.round(-this.angle / step) % n) + n) % n;

    for (var i = 0; i < n; i++) {
      var rel = i * step + this.angle;                 /* turns from front */
      rel = rel - Math.round(rel);                     /* wrap to [-.5,.5] */
      var a = rel * Math.PI * 2;                       /* radians around ring */
      var el = this.els[i];
      var x, y, z, rx, ry, scale;
      if (vertical) {
        /* Vertical perspective stack: panels pour down toward viewer. */
        y = Math.sin(a) * H * 0.34;
        x = Math.sin(a * 2) * W * 0.03;
        z = Math.cos(a);
        scale = 0.72 + 0.34 * ((z + 1) / 2);
        rx = -rel * 52; ry = rel * 10;
      } else {
        /* Inward arc: panels angle in toward a centre vanishing point. */
        x = Math.sin(a) * W * 0.36;
        y = Math.abs(Math.sin(a)) * H * 0.05;
        z = Math.cos(a);
        scale = 0.7 + 0.36 * ((z + 1) / 2);
        ry = -rel * 64; rx = rel * 6;
      }
      /* Bob on the shared water. */
      var x01 = W ? (W / 2 + x) / W : 0.5;
      var bob = this.liquid ? this.liquid.waveHeight(x01)
        : Math.sin(this._t * 1.3 + i * 1.7) * (2 + beat * 3);
      var isFront = i === front;
      el.style.transform =
        'translate(-50%,-50%) translate3d(' + x.toFixed(1) + 'px,' + (y + bob).toFixed(1) + 'px,0)' +
        ' rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg)' +
        ' scale(' + scale.toFixed(3) + ')';
      el.style.zIndex = String(100 + Math.round(z * 40));
      el.style.opacity = (0.45 + 0.55 * ((z + 1) / 2)).toFixed(2);
      el.classList.toggle('is-front', isFront);
      el.style.setProperty('--lq-glow', (0.25 + beat * 0.55 * ((z + 1) / 2)).toFixed(2));
    }
    this.frontIndex = front;
  };

  LiquidCarousel.prototype.destroy = function () {
    this._stop();
    document.removeEventListener('visibilitychange', this._vis);
    if (this._io) this._io.disconnect();
  };

  global.LiquidCarousel = LiquidCarousel;
})(typeof window !== 'undefined' ? window : this);
