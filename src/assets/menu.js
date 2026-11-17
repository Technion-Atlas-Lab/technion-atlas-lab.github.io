// The site's only script: the mobile menu toggle.
//
// It loads in <head>, before the page is drawn, and marks the page with the
// `js` class, so phones never see the menu flash open. Without JavaScript the
// class is missing, the Menu button never shows and the menu stays open.
document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
  const button = document.querySelector('.menu-button');
  if (!button) return;
  const isOpen = () => button.getAttribute('aria-expanded') === 'true';
  const setOpen = (open) => button.setAttribute('aria-expanded', String(open));

  button.addEventListener('click', () => setOpen(!isOpen()));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) {
      setOpen(false);
      button.focus();
    }
  });
  // Back and Forward can restore a page as it was left, menu open; close it.
  window.addEventListener('pageshow', () => setOpen(false));
});
