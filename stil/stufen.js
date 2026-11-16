/* ---------------------------------------------------------------
   stufen.js – Übungsstufen a → b → c auf den Werkzeugseiten

   Lenkung, kein Schutz: wer die Adresse mit ?modus=c kennt, kommt
   direkt hin. Gespeichert wird nur die höchste geöffnete Stufe, im
   Browser des Teilnehmers (localStorage).

   Einbau:
     <section data-stufen-key="agpcontrol_hdt_stufe"> … Karten mit
       class="karte stufe" data-stufe="1|2|3" und <span class="stufe-status">
     <button data-stufen-reset>↺ Stufen zurücksetzen</button>
   Eigener Schlüssel je Seite, damit sich AGP_H und AGP_S nicht
   gegenseitig freischalten. Die Schlüssel sind dieselben wie vor dem
   Umbau (16.11.2026) – der Fortschritt der Teilnehmer bleibt erhalten.
   --------------------------------------------------------------- */

(function () {
  'use strict';
  var NAME = ['a', 'b', 'c'];

  function lies(key) {
    try { return parseInt(localStorage.getItem(key) || '0', 10) || 0; }
    catch (e) { return 0; }
  }
  function schreib(key, n) {
    try { localStorage.setItem(key, String(n)); } catch (e) {}
  }

  document.querySelectorAll('[data-stufen-key]').forEach(function (block) {
    var key = block.getAttribute('data-stufen-key');
    var karten = block.querySelectorAll('.stufe');

    function anwenden() {
      var erreicht = lies(key);
      karten.forEach(function (el) {
        var n = parseInt(el.getAttribute('data-stufe'), 10);
        var frei = n <= erreicht + 1;
        el.classList.toggle('gesperrt', !frei);
        el.classList.toggle('erledigt', n <= erreicht);
        if (frei) el.removeAttribute('aria-disabled'); else el.setAttribute('aria-disabled', 'true');
        el.querySelector('.stufe-status').textContent =
          n <= erreicht ? '✓ geöffnet'
          : frei        ? '▶ jetzt an der Reihe'
                        : '🔒 frei nach Stufe ' + NAME[n - 2];
      });
    }

    karten.forEach(function (el) {
      el.addEventListener('click', function (e) {
        if (el.classList.contains('gesperrt')) { e.preventDefault(); return; }
        var n = parseInt(el.getAttribute('data-stufe'), 10);
        if (n > lies(key)) schreib(key, n);
        setTimeout(anwenden, 50);
      });
    });

    document.querySelectorAll('[data-stufen-reset]').forEach(function (b) {
      b.addEventListener('click', function () {
        try { localStorage.removeItem(key); } catch (e) {}
        anwenden();
      });
    });

    // Zurück-Taste aus dem Programm: Seite kommt aus dem Cache, Stand neu setzen
    window.addEventListener('pageshow', anwenden);
    anwenden();
  });
})();
