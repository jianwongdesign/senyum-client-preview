(() => {
 const menu = document.querySelector('.menu-toggle');
 const nav = document.querySelector('.site-nav');
 const dropdowns = [...document.querySelectorAll('.nav-dropdown')];
 const closeMenu = () => { nav.classList.remove('is-open'); menu.setAttribute('aria-expanded','false'); menu.setAttribute('aria-label','Open menu'); dropdowns.forEach(d => d.open = false); };
 menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; nav.classList.toggle('is-open',open); menu.setAttribute('aria-expanded',String(open)); menu.setAttribute('aria-label',open ? 'Close menu' : 'Open menu'); });
 nav.addEventListener('click', e => { if(e.target.closest('a')) closeMenu(); });
 dropdowns.forEach(d => d.addEventListener('toggle', () => { if(d.open) dropdowns.filter(other => other !== d).forEach(other => other.open = false); }));
 document.addEventListener('click', e => { if(!e.target.closest('.site-header')) closeMenu(); });
 document.addEventListener('keydown', e => { if(e.key !== 'Escape') return; const active = dropdowns.find(d => d.open); if(active){ active.open = false; active.querySelector('summary').focus(); }else if(nav.classList.contains('is-open')){ closeMenu(); menu.focus(); } });
 const toggle = document.querySelector('.team-toggle');
 const grid = document.querySelector('.team-grid');
 toggle?.addEventListener('click', () => { const expanded = toggle.getAttribute('aria-expanded') !== 'true'; grid.dataset.expanded = String(expanded); toggle.setAttribute('aria-expanded',String(expanded)); toggle.textContent = expanded ? 'Show fewer people' : 'Meet the whole team'; if(!expanded) grid.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'}); });
})();
