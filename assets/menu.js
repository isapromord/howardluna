/* Menú de pantalla completa: se abre desde el botón con un círculo que crece. */
window.addEventListener('DOMContentLoaded', function () {
  var btn = document.getElementById('hmBtn'), menu = document.getElementById('hmMenu');
  if (!btn || !menu) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var gs = typeof gsap !== 'undefined' && !reduce;
  var open = false, passing = false, tl = null;
  function lenis() { return window.__hlLenis || null; }
  function origin() { var r = btn.getBoundingClientRect(); return (r.left + r.width / 2) + 'px ' + (r.top + r.height / 2) + 'px'; }
  function radius() { return Math.hypot(window.innerWidth, window.innerHeight) + 'px'; }

  function openMenu() {
    if (open) return; open = true;
    menu.hidden = false; btn.setAttribute('aria-expanded', 'true'); btn.setAttribute('aria-label', 'Cerrar menú');
    if (lenis()) lenis().stop();
    document.documentElement.style.overflow = 'hidden';
    if (gs) {
      if (tl) tl.kill();
      tl = gsap.timeline();
      tl.fromTo(menu, { clipPath: 'circle(0px at ' + origin() + ')' }, { clipPath: 'circle(' + radius() + ' at ' + origin() + ')', duration: .9, ease: 'expo.inOut' }, 0)
        .from('.hm-nav a', { y: 60, opacity: 0, duration: .8, stagger: .05, ease: 'expo.out' }, .35)
        .from('.hm-side > *', { y: 30, opacity: 0, duration: .7, stagger: .07, ease: 'expo.out' }, .5);
    }
    setTimeout(function () { var f = menu.querySelector('.hm-nav a'); if (f) f.focus({ preventScroll: true }); }, gs ? 450 : 0);
  }
  function closeMenu(then) {
    if (!open) return; open = false;
    btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-label', 'Abrir menú');
    function done() {
      menu.hidden = true; document.documentElement.style.overflow = '';
      if (gs) gsap.set([menu, '.hm-nav a', '.hm-side > *'], { clearProps: 'all' });
      if (lenis()) lenis().start();
      if (then) then(); else btn.focus();
    }
    if (!gs) return done();
    if (tl) tl.kill();
    tl = gsap.to(menu, { clipPath: 'circle(0px at ' + origin() + ')', duration: .6, ease: 'expo.inOut', onComplete: done });
  }

  btn.addEventListener('click', function () { open ? closeMenu() : openMenu(); });
  window.addEventListener('keydown', function (e) {
    if (!open) return;
    if (e.key === 'Escape') { closeMenu(); return; }
    if (e.key === 'Tab') {
      var f = [btn].concat([].slice.call(menu.querySelectorAll('a[href]')));
      var i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    }
  });

  /* Enlaces internos: cerrar primero y luego dejar que el desplazamiento normal haga su trabajo */
  menu.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a || passing) return;
    e.preventDefault(); e.stopPropagation();
    closeMenu(function () { passing = true; a.click(); passing = false; });
  }, true);
});
