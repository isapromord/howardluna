/* Portafolio: la sección se ancla y las tarjetas se desplazan de lado mientras haces scroll.
   Las fotos se mueven un poco al revés dentro de cada tarjeta (parallax). */
window.addEventListener('DOMContentLoaded', function () {
  var sec = document.getElementById('proyectos');
  if (!sec || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  var vp = sec.querySelector('.hs-viewport'), track = sec.querySelector('.bento-projects'), bar = sec.querySelector('.hs-progress i');
  if (!vp || !track) return;

  var mm = gsap.matchMedia();
  mm.add('(min-width: 861px) and (prefers-reduced-motion: no-preference)', function () {
    sec.classList.add('hs-on');
    function travel() { return Math.max(0, track.scrollWidth - vp.clientWidth + 16); }
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: function () { return '+=' + Math.max(1, travel() * 1.15); },
        pin: true, scrub: 0.6, invalidateOnRefresh: true,
        onUpdate: function (self) { if (bar) bar.style.transform = 'scaleX(' + self.progress + ')'; }
      }
    });
    tl.to(track, { x: function () { return -travel(); } }, 0)
      .fromTo(track.querySelectorAll('img'), { xPercent: 4 }, { xPercent: -4 }, 0);
    ScrollTrigger.sort(); ScrollTrigger.refresh();
    return function () { sec.classList.remove('hs-on'); if (bar) bar.style.transform = ''; };
  });
});
