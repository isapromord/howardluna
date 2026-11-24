/* GA4 con consentimiento: no se carga nada hasta que el visitante acepta. */
(function () {
  var GA_ID = 'G-KYXLD7BBE4';
  var KEY = 'hl_analytics_consent';
  var consent = null;
  try { consent = localStorage.getItem(KEY); } catch (e) {}

  function loadGA() {
    if (window.__gaLoaded) return;
    window.__gaLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, { anonymize_ip: true });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
  }

  function save(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  if (consent === 'granted') { loadGA(); return; }
  if (consent === 'denied') return;

  function showBanner() {
    var legal = (location.pathname.indexOf('/aviso-legal/') !== -1) ? '' :
      (document.querySelector('script[src*="analytics.js"]').getAttribute('src').indexOf('../') === 0 ? '../aviso-legal/' : 'aviso-legal/');
    var b = document.createElement('div');
    b.setAttribute('role', 'dialog');
    b.setAttribute('aria-label', 'Preferencias de analítica');
    b.style.cssText = 'position:fixed;left:16px;right:16px;bottom:16px;max-width:560px;z-index:9999;background:#0b1426;color:#fff;border:1px solid rgba(255,255,255,.2);border-radius:16px;padding:16px 18px;box-shadow:0 20px 50px rgba(0,0,0,.4);font:14px/1.5 system-ui,sans-serif;';
    b.innerHTML = '<p style="margin:0 0 12px;">Uso Google Analytics para entender qué partes de la página sirven. Solo se activa si aceptas. <a href="' + legal + '" style="color:#ffb35c;text-decoration:underline;">Más info</a></p>' +
      '<div style="display:flex;gap:10px;flex-wrap:wrap;">' +
      '<button type="button" id="hlAccept" style="background:#fd8505;color:#fff;border:0;border-radius:999px;padding:10px 18px;font-weight:700;cursor:pointer;">Aceptar</button>' +
      '<button type="button" id="hlDecline" style="background:transparent;color:#fff;border:1px solid rgba(255,255,255,.4);border-radius:999px;padding:10px 18px;font-weight:600;cursor:pointer;">Rechazar</button></div>';
    document.body.appendChild(b);
    document.getElementById('hlAccept').addEventListener('click', function () { save('granted'); loadGA(); b.remove(); });
    document.getElementById('hlDecline').addEventListener('click', function () { save('denied'); b.remove(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', showBanner);
  else showBanner();
})();
