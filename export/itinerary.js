(() => {
 const days=[...document.querySelectorAll('.itinerary-day')];
 const expand=document.querySelector('.expand-days');
 const noun=expand?.dataset.noun||'days';
 const sync=()=>{if(!expand)return;const all=days.every(day=>day.open);expand.setAttribute('aria-expanded',String(all));expand.textContent=(all?'Collapse all ':'Expand all ')+noun};
 expand?.addEventListener('click',()=>{const open=!days.every(day=>day.open);days.forEach(day=>day.open=open);sync()});
 days.forEach(day=>day.addEventListener('toggle',sync));
 const links=[...document.querySelectorAll('.tour-sections a')];
 const sections=links.map(link=>document.querySelector(link.hash));
 let frame=0;
 const update=()=>{
  frame=0;
  const boundary=document.querySelector('.site-header').offsetHeight+80;
  let current=0;
  sections.forEach((section,i)=>{if(section.getBoundingClientRect().top<=boundary)current=i});
  links.forEach((link,i)=>{if(i===current)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current')});
 };
 const schedule=()=>{if(!frame)frame=requestAnimationFrame(update)};
 addEventListener('scroll',schedule,{passive:true});
 addEventListener('resize',schedule,{passive:true});
 days.forEach(day=>day.addEventListener('toggle',schedule));
 update();
})();
