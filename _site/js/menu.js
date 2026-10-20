// Navigation behaviour: the "Fun" dropdown (desktop) and the slide-out menu (mobile).
// The #menu / #panel markup lives in _layouts/layout.html.

// "Fun" is a dropdown, not a page: it only opens a small menu.
document.addEventListener('DOMContentLoaded', function () {
  var dd = document.querySelector('.nav-dropdown');
  if (!dd) return;
  var btn = dd.querySelector('.nav-trigger'), menu = dd.querySelector('.nav-dropdown-menu');

  function set(open) {
    dd.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  btn.addEventListener('click', function () { set(!dd.classList.contains('open')); });
  document.addEventListener('click', function (e) { if (!dd.contains(e.target)) set(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && dd.classList.contains('open')) { set(false); btn.focus(); }
  });
  menu.addEventListener('click', function () { set(false); });
});

// Mobile slide-out menu
document.addEventListener('DOMContentLoaded', function () {
  var panel = document.getElementById('panel');
  var menu = document.getElementById('menu');
  var toggle = document.querySelector('.toggle-button');
  if (!panel || !menu || !toggle || typeof Slideout === 'undefined') return;

  var slideout = new Slideout({
    panel: panel,
    menu: menu,
    padding: 150,
    tolerance: 70
  });

  toggle.addEventListener('click', function () {
    slideout.toggle();
  });
});
