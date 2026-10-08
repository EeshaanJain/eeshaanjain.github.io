// Mobile slide-out menu (the #menu / #panel markup lives in _layouts/layout.html)
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
