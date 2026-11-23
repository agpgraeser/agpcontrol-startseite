/* ---------------------------------------------------------------
   aufwecken.js – Rechenprogramme auf Render vorab starten

   Render (Free-Tarif) legt die Programme nach ~15 min ohne Aufruf
   schlafen; der erste Aufruf dauert dann bis zu einer Minute. Diese
   Seite weckt ein Programm, sobald seine Beschreibung im Bild ist –
   während man liest, startet es. Der Knopf zeigt den Zustand.

   Einbau je Werkzeug (werkzeuge.html):
     <section data-wecken="https://name.agpcontrol.com/">
       ...
       <a class="btn btn-voll" data-oeffnen href="https://name.agpcontrol.com/">Programm öffnen</a>
       <span class="werkzeug-status" aria-live="polite"></span>
     </section>
   Ohne data-wecken (z. B. Datenbetrachter auf Netlify) bleibt der
   Knopf ein normaler Link. Ohne JavaScript ebenso.

   Woran "wach" erkannt wird: Das Programm liefert /static/app.css.
   Die Datei wird als Stylesheet mit media="not all" geladen – sie
   wirkt also nicht. "load" kommt nur, wenn wirklich CSS ankommt;
   eine HTML-Warte- oder Fehlerseite löst "error" aus. So geht es
   ohne CORS und ohne Änderung an den Programmen.
   --------------------------------------------------------------- */

(function () {
  'use strict';

  var GEDULD_MS   = 90000;   // so lange insgesamt warten
  var VERSUCH_MS  = 60000;   // ein Versuch; Render hält die Anfrage beim
                             // Aufwachen ~30 s und liefert dann (gemessen 2026-11-23)
  var PAUSE_MS    = 3000;    // zwischen zwei Versuchen

  var TEXT = {
    weckt:    'Programm wird gestartet …',
    wartet:   'Programm wird gestartet – es öffnet sich gleich (bis zu 1 Minute).',
    bereit:   'bereit',
    zaeh:     'Der Server antwortet noch nicht. Der Knopf öffnet das Programm trotzdem.'
  };

  function versuch(basis) {
    return new Promise(function (ok) {
      // Anstoß: der eigentliche Weckruf (Antwort ist hier nicht lesbar)
      try { fetch(basis + 'api/health', { mode: 'no-cors', cache: 'no-store' }).catch(function () {}); } catch (e) {}

      var l = document.createElement('link');
      l.rel = 'stylesheet';
      l.media = 'not all';
      l.href = basis + 'static/app.css?wach=' + Date.now();
      var uhr = setTimeout(function () { fertig(false); }, VERSUCH_MS);
      function fertig(wach) {
        clearTimeout(uhr);
        l.onload = l.onerror = null;
        if (l.parentNode) l.parentNode.removeChild(l);
        ok(wach);
      }
      l.onload  = function () { fertig(true); };
      l.onerror = function () { fertig(false); };
      document.head.appendChild(l);
    });
  }

  function Werkzeug(abschnitt) {
    this.basis   = abschnitt.getAttribute('data-wecken');
    this.knopf   = abschnitt.querySelector('[data-oeffnen]');
    this.status  = abschnitt.querySelector('.werkzeug-status');
    this.zustand = 'schlaeft';   // schlaeft | weckt | bereit | zaeh
    this.oeffnen = false;        // Nutzer hat schon geklickt
    var w = this;
    if (this.knopf) {
      this.knopf.addEventListener('click', function (ev) {
        if (w.zustand === 'bereit' || w.zustand === 'zaeh') return;   // normal folgen
        ev.preventDefault();
        w.oeffnen = true;
        w.zeige('wartet');
        w.wecken();
      });
    }
  }

  Werkzeug.prototype.zeige = function (z) {
    if (!this.status) return;
    this.status.textContent = TEXT[z];
    this.status.className = 'werkzeug-status ist-' + z;
  };

  Werkzeug.prototype.wecken = function () {
    if (this.zustand !== 'schlaeft') return;
    this.zustand = 'weckt';
    if (!this.oeffnen) this.zeige('weckt');
    var w = this, start = Date.now();
    (function runde() {
      versuch(w.basis).then(function (wach) {
        if (wach) {
          w.zustand = 'bereit';
          w.zeige('bereit');
          if (w.oeffnen) location.href = w.knopf.href;
        } else if (Date.now() - start < GEDULD_MS) {
          setTimeout(runde, PAUSE_MS);
        } else {
          w.zustand = 'zaeh';
          w.zeige('zaeh');
        }
      });
    })();
  };

  var abschnitte = document.querySelectorAll('[data-wecken]');
  if (!abschnitte.length || !window.Promise) return;

  var liste = [];
  Array.prototype.forEach.call(abschnitte, function (a) {
    var w = new Werkzeug(a);
    a._werkzeug = w;
    liste.push(w);
  });

  // Wecken, sobald die Beschreibung zur Hälfte im Bild ist und dort
  // VERWEILEN_MS bleibt – beim Durchscrollen (oder beim Sprung auf einen
  // Anker) werden die übrigen Programme nicht mitgeweckt.
  var VERWEILEN_MS = 1500;
  if ('IntersectionObserver' in window) {
    var beobachter = new IntersectionObserver(function (eintraege) {
      eintraege.forEach(function (e) {
        var a = e.target;
        if (e.isIntersecting) {
          if (!a._uhr) a._uhr = setTimeout(function () {
            a._werkzeug.wecken();
            beobachter.unobserve(a);
          }, VERWEILEN_MS);
        } else if (a._uhr) {
          clearTimeout(a._uhr);
          a._uhr = null;
        }
      });
    }, { threshold: 0.5 });
    Array.prototype.forEach.call(abschnitte, function (a) { beobachter.observe(a); });
  } else {
    liste.forEach(function (w) { w.wecken(); });
  }
})();
