/* ============================================================================
   LIQUID A — navdance.js  ·  3000 Studios VIP v2
   Makes nav links groove to the same beat that drives the liquid surface:
   glow pulses staggered per link (random phase + lift per link), non-current
   links lift and bounce on the groove, random links POP on each pulse.
   The .is-current link is never touched — CSS keeps it steadily lit.

   Reads window.LiquidBeat (from liquid.js). If liquid.js isn't loaded it
   runs its own gentle idle groove. One tiny rAF loop per page, transform-
   only, pauses off-screen / hidden / reduced-motion.

     NavDance.attach(document.querySelector('header nav'));
     NavDance.attach(bottomBarEl); NavDance.attach(menuEl);  // as many as needed
   ========================================================================== */
(function (global) {
  'use strict';

  var instances = [];
  var raf = 0, last = 0, running = false;

  function hub() {
    if (global.LiquidBeat) return global.LiquidBeat;
    /* Standalone idle fallback (same shape as the real hub). */
    if (!hub._idle) {
      hub._idle = {
        energy: 0.12, phase: 0,
        _tick: function (now, dt) {
          this.energy = 0.14 + 0.08 * (0.5 + 0.5 * Math.sin(now * 0.00055));
          this.phase = (this.phase + dt / 1150) % 1;
        },
        onPulse: function () {}
      };
    }
    return hub._idle;
  }

  function NavDance(root) {
    this.root = root;
    this.links = [];
    var nodes = root.querySelectorAll('a, [data-nav-link]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (el.classList.contains('is-current') || el.getAttribute('aria-current') === 'page') continue;
      this.links.push({
        el: el,
        phase: Math.random(),                          /* stagger */
        lift: 4 + Math.random() * 7,                   /* px, personal */
        pop: 0,
        popAt: 0
      });
    }
    var self = this;
    hub().onPulse && hub().onPulse(function (s) { self._onPulse(s); });
    root.classList.add('navdance');
    instances.push(this);
  }

  NavDance.prototype._onPulse = function (s) {
    if (!this.links.length) return;
    /* A random third of the links pop on each kick — never all together. */
    var count = Math.max(1, Math.round(this.links.length / 3));
    for (var i = 0; i < count; i++) {
      var l = this.links[(Math.random() * this.links.length) | 0];
      l.pop = Math.min(1, 0.5 + s * 0.6);
    }
  };

  function frame(now) {
    raf = requestAnimationFrame(frame);
    var dt = Math.min(50, now - last || 16.7);
    last = now;
    var h = hub();
    if (h._tick) h._tick(now, dt);
    var e = h.energy, phase = h.phase;
    for (var j = 0; j < instances.length; j++) {
      var inst = instances[j];
      inst.root.style.setProperty('--nd-beat', e.toFixed(3));
      for (var i = 0; i < inst.links.length; i++) {
        var l = inst.links[i];
        var wave = Math.sin((phase + l.phase) * Math.PI * 2);
        var bounce = Math.max(0, wave);
        bounce = bounce * bounce;                       /* snappier attack */
        l.pop *= Math.pow(0.015, dt / 1000);            /* pop decay */
        var y = -(bounce * l.lift * (0.3 + 0.7 * e)) - l.pop * 5;
        var sc = 1 + l.pop * 0.1 + bounce * e * 0.03;
        l.el.style.transform = 'translateY(' + y.toFixed(1) + 'px) scale(' + sc.toFixed(3) + ')';
        l.el.style.setProperty('--nd-glow',
          (0.12 + bounce * (0.25 + 0.6 * e) + l.pop * 0.4).toFixed(2));
      }
    }
  }

  function start() {
    if (running) return;
    running = true; last = performance.now();
    raf = requestAnimationFrame(frame);
  }
  function stop() { running = false; cancelAnimationFrame(raf); }

  var NavDancePublic = {
    attach: function (root) {
      if (!root) return null;
      if (global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        root.classList.add('navdance');   /* CSS still lights .is-current */
        return null;
      }
      var inst = new NavDance(root);
      start();
      return inst;
    }
  };

  document.addEventListener('visibilitychange', function () {
    document.hidden ? stop() : (instances.length && start());
  });

  global.NavDance = NavDancePublic;
})(typeof window !== 'undefined' ? window : this);
