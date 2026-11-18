/* ---------------------------------------------------------------
   navigation.js – linke Navigationsleiste von agpcontrol.com

   DIE EINZIGE STELLE, an der die Navigation steht. Neuer Menüpunkt:
   eine Zeile in NAVIGATION ergänzen – fertig, auf allen Seiten.

   Eintrag:  { text: 'Anzeige', href: 'datei.html' }
             extern: href mit https://   → bekommt ein ↗ und öffnet neu
             noch keine Seite: href weglassen → grau, "in Vorbereitung"

   Jede Seite braucht dafür nur:
     <nav id="seitennav" aria-label="Hauptnavigation">
       <a href="index.html">Startseite</a>          ← Notlink ohne JS
     </nav>
     <script src="stil/navigation.js" defer></script>
   --------------------------------------------------------------- */

(function () {
  'use strict';

  var START = 'index.html';

  var NAVIGATION = [
    { rubrik: 'AGP Control', punkte: [
      { text: 'Startseite',   href: START },
      { text: 'Aktuelles',    href: START + '#aktuelles' },
      { text: 'Über mich',    href: 'ueber-mich.html' }
    ]},
    { rubrik: 'Seminare', punkte: [
      { text: 'Auslegung von Regelkreisen', href: 'hdt-kurs.html' },
      // Voruebergehend ausgeblendet (2026-11-18), siehe index.html:
      // { text: 'AGP_S Inhouse-Schulung',     href: 'siemens.html' },
      // { text: 'Vibe Coding',                href: 'vibecoding.html' },
      { text: 'Claude Code in der SPS' }
    ]},
    { rubrik: 'Werkzeuge', punkte: [
      { text: 'PTn – ZPK-Verfahren',     href: 'https://ptn-zpk.agpcontrol.com/' },
      { text: 'PTn – Systemvergleich',   href: 'https://ptn-vergleich.agpcontrol.com/' },
      { text: 'ZPK-Identifikation',      href: 'https://zpk-identifikation.agpcontrol.com/' },
      { text: 'Regelkreis-Simulationen', href: 'https://regelkreissimulationen.agpcontrol.com/' },
      { text: 'Reglerparameter',         href: 'https://reglerparameter.agpcontrol.com/' },
      { text: 'Datenbetrachter',         href: 'https://datenbetrachter.agpcontrol.com/' }
    ]},
    { rubrik: 'Teilnehmer', punkte: [
      // Voruebergehend ausgeblendet (2026-11-18):
      // { text: 'AGP_H Werkzeugseite', href: 'hdt.html' },
      // { text: 'AGP_S Werkzeugseite', href: 'siemens.html' },
      { text: 'Hinweise für IT',     href: 'it-info.html' }
    ]},
    { rubrik: 'Information', punkte: [
      { text: 'Kontakt',     href: START + '#kontakt' },
      { text: 'Impressum',   href: 'impressum.html' },
      { text: 'Datenschutz', href: 'datenschutz.html' }
    ]}
  ];

  // ---------------------------------------------------------------

  var nav = document.getElementById('seitennav');
  if (!nav) return;
  document.body.classList.remove('ohne-js');

  // Aktuelle Seite: Dateiname ohne Pfad, leer = index.html
  var hier = location.pathname.split('/').pop() || 'index.html';
  var schonMarkiert = false;

  function istHier(href) {
    if (!href || /^https?:/.test(href) || href.indexOf('#') !== -1) return false;
    return href === hier;
  }

  var html = '';
  NAVIGATION.forEach(function (gruppe) {
    html += '<p class="nav-rubrik">' + gruppe.rubrik + '</p><ul>';
    gruppe.punkte.forEach(function (p) {
      if (!p.href) {
        html += '<li><span class="nav-bald" title="in Vorbereitung">' + p.text + '</span></li>';
        return;
      }
      var extern = /^https?:/.test(p.href);
      // Nur den ersten Treffer markieren (siemens.html steht zweimal drin)
      var aktiv = !schonMarkiert && istHier(p.href);
      if (aktiv) schonMarkiert = true;
      html += '<li><a href="' + p.href + '"' +
        (aktiv ? ' aria-current="page"' : '') +
        (extern ? ' target="_blank" rel="noopener"' : '') + '>' +
        p.text + (extern ? '<span class="nav-extern" aria-label="(neues Fenster)"> ↗</span>' : '') +
        '</a></li>';
    });
    html += '</ul>';
  });
  nav.innerHTML = html;

  // ---------- Menü-Knopf für schmale Bildschirme ----------
  // Sitzt in der Kopfleiste; per CSS nur unter 900px sichtbar.
  var kopf = document.querySelector('.kopf .wrap');
  if (!kopf) return;

  var knopf = document.createElement('button');
  knopf.type = 'button';
  knopf.className = 'menue-knopf';
  knopf.setAttribute('aria-controls', 'seitennav');
  knopf.setAttribute('aria-expanded', 'false');
  knopf.innerHTML =
    '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" ' +
    'stroke-width="2" stroke-linecap="round" aria-hidden="true">' +
    '<path d="M4 7h16M4 12h16M4 17h16"/></svg><span>Menü</span>';
  kopf.appendChild(knopf);

  function setze(offen) {
    document.body.classList.toggle('nav-offen', offen);
    knopf.setAttribute('aria-expanded', offen ? 'true' : 'false');
    if (offen) window.scrollTo(0, 0);
  }

  knopf.addEventListener('click', function () {
    setze(!document.body.classList.contains('nav-offen'));
  });
  // Klick auf einen Eintrag (auch Sprung auf derselben Seite) schließt
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) setze(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setze(false);
  });
})();
