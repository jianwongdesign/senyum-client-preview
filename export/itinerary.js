(() => {
 const days=[...document.querySelectorAll('.itinerary-day')];
 const expand=document.querySelector('.expand-days');
 const sync=()=>{const all=days.every(day=>day.open);expand.setAttribute('aria-expanded',String(all));expand.textContent=all?'Collapse all days':'Expand all days'};
 expand.addEventListener('click',()=>{const open=!days.every(day=>day.open);days.forEach(day=>day.open=open);sync()});
 days.forEach(day=>day.addEventListener('toggle',sync));
 const links=[...document.querySelectorAll('.tour-sections a')];
 if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{const visible=entries.find(entry=>entry.isIntersecting);if(!visible)return;links.forEach(link=>{if(link.hash==='#'+visible.target.id)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current')})},{rootMargin:'-120px 0px -55% 0px'});links.forEach(link=>observer.observe(document.querySelector(link.hash)))}
})();
