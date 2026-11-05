(() => {
 const menu = document.querySelector('.menu-toggle');
 const nav = document.querySelector('.site-nav');
 const dropdowns = [...document.querySelectorAll('.nav-dropdown')];
 const mobile = matchMedia('(max-width:900px)');
 const setDropdown = (details,open) => window.senyumDetails ? window.senyumDetails.set(details,open) : details.open=open;
 const closeMenu = () => {
  nav.classList.remove('is-open');
  nav.inert = mobile.matches;
  menu.setAttribute('aria-expanded','false');
  menu.setAttribute('aria-label','Open menu');
  dropdowns.forEach(d => setDropdown(d,false));
 };
 const syncViewport = () => { closeMenu(); nav.inert = mobile.matches; };
 mobile.addEventListener('change',syncViewport);
 syncViewport();
 menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  if (!open) { closeMenu(); return; }
  nav.inert = false;
  nav.classList.add('is-open');
  menu.setAttribute('aria-expanded','true');
  menu.setAttribute('aria-label','Close menu');
 });
 nav.addEventListener('click', e => { if(e.target.closest('a')) closeMenu(); });
 document.addEventListener('click', e => { if(!e.target.closest('.site-header')) closeMenu(); });
 document.addEventListener('keydown', e => {
  if(e.key !== 'Escape') return;
  const active = dropdowns.find(d => window.senyumDetails?.isOpen(d) ?? d.open);
  if(active){ setDropdown(active,false); active.querySelector('summary').focus(); }
  else if(nav.classList.contains('is-open')){ closeMenu(); menu.focus(); }
 });
 const toggle = document.querySelector('.team-toggle');
 const grid = document.querySelector('.team-grid');
 toggle?.addEventListener('click', () => {
  const expanded = toggle.getAttribute('aria-expanded') !== 'true';
  grid.dataset.expanded = String(expanded);
  toggle.setAttribute('aria-expanded',String(expanded));
  toggle.textContent = expanded ? 'Show fewer people' : 'Meet the whole team';
  if(expanded && !matchMedia('(prefers-reduced-motion: reduce)').matches) [...grid.children].slice(4).forEach(el=>el.animate([{opacity:0},{opacity:1}],{duration:180}));
  if(!expanded) grid.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
 });
})();
