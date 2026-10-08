// Dark mode: apply the saved (or system) theme before first paint, then add the switch.
(function () {
  var root = document.documentElement;
  var saved = null;
  try { saved = localStorage.getItem('theme'); } catch (e) {}
  var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  root.setAttribute('data-theme', saved || (prefersDark ? 'dark' : 'light'));

  // lucide "sun" and "snowflake" icons
  var SUN =
    '<svg class="icon-sun" viewBox="0 0 24 24" aria-hidden="true">' +
    '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/>' +
    '<path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/>' +
    '<path d="M2 12h2"/><path d="M20 12h2"/>' +
    '<path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>';
  var SNOWFLAKE =
    '<svg class="icon-snowflake" viewBox="0 0 24 24" aria-hidden="true">' +
    '<path d="m10 20-1.25-2.5L6 18"/><path d="M10 4 8.75 6.5 6 6"/>' +
    '<path d="m14 20 1.25-2.5L18 18"/><path d="m14 4 1.25 2.5L18 6"/>' +
    '<path d="m17 21-3-6h-4"/><path d="m17 3-3 6 1.5 3"/>' +
    '<path d="M2 12h6.5L10 9"/><path d="m20 10-1.5 2 1.5 2"/>' +
    '<path d="M22 12h-6.5L14 15"/><path d="m4 10 1.5 2L4 14"/>' +
    '<path d="m7 21 3-6-1.5-3"/><path d="m7 3 3 6h4"/></svg>';

  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.createElement('button');
    btn.className = 'theme-switch';
    btn.type = 'button';
    btn.innerHTML = SUN + SNOWFLAKE;

    function sync() {
      var dark = root.getAttribute('data-theme') === 'dark';
      btn.setAttribute('aria-pressed', dark ? 'true' : 'false');
      btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
      btn.title = dark ? 'Switch to light mode' : 'Switch to dark mode';
    }

    btn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      sync();
    });

    sync();
    document.body.appendChild(btn);
  });
})();
