/* Shared, interruptible disclosure motion. Content stays visible without JS. */
(() => {
 if (window.senyumMotionReady) return;
 window.senyumMotionReady = true;
 const reduce = matchMedia('(prefers-reduced-motion: reduce)');
 const ease = 'cubic-bezier(.16,1,.3,1)';
 const active = new Map();
 const loader = document.querySelector('#senyum-loading');
 if (loader) {
  if (reduce.matches || !loader.animate) loader.remove();
  else loader.animate([{opacity:1},{opacity:0}],{duration:140,easing:'ease-out'}).finished.then(()=>loader.remove()).catch(()=>loader.remove());
 }
 const desired = details => active.get(details)?.open ?? details.open;
 const setDetails = (details, open) => {
  const previous = active.get(details);
  if ((previous?.open ?? details.open) === open) return;
  const summary = details.querySelector('summary');
  const content = summary?.nextElementSibling;
  const height = details.getBoundingClientRect().height;
  const previousOpacity = content ? getComputedStyle(content).opacity : '1';
  const previousTransform = content ? getComputedStyle(content).transform : 'none';
  previous?.animation.cancel();
  active.delete(details);
  details.style.height = '';
  details.style.overflow = '';
  details.open = true;
  details.dataset.expanded = String(open);
  if (content) content.inert = !open;
  const finish = () => {
   details.open = open;
   details.style.height = '';
   details.style.overflow = '';
   if (content) content.inert = !open;
   active.delete(details);
   details.dispatchEvent(new Event('disclosureend'));
  };
  if (reduce.matches || !details.animate || !content) { finish(); return; }
  const floating = getComputedStyle(content).position === 'absolute';
  const end = open ? details.getBoundingClientRect().height : summary.getBoundingClientRect().height + parseFloat(getComputedStyle(details).borderTopWidth || 0) + parseFloat(getComputedStyle(details).borderBottomWidth || 0);
  const target = floating ? content : details;
  if (!floating) details.style.overflow = 'hidden';
  const frames = floating
   ? [{opacity:previous?previousOpacity:(open?0:1),transform:previous?previousTransform:(open?'translateY(-5px)':'translateY(0)')},{opacity:open?1:0,transform:open?'translateY(0)':'translateY(-3px)'}]
   : [{height:height+'px'},{height:end+'px'}];
  const animation = target.animate(frames,{duration:open?240:180,easing:ease});
  active.set(details,{animation,open,finish});
  animation.finished.then(()=>{if(active.get(details)?.animation===animation)finish()}).catch(()=>{});
 };
 window.senyumDetails = {set:setDetails,isOpen:desired};
 document.querySelectorAll('details').forEach(details => {
  const summary = details.querySelector('summary');
  summary?.addEventListener('click', event => {
   event.preventDefault();
   const open = !desired(details);
   if (open && details.classList.contains('nav-dropdown')) document.querySelectorAll('.nav-dropdown').forEach(other=>{if(other!==details)setDetails(other,false)});
   setDetails(details,open);
  });
 });
 reduce.addEventListener('change',()=>{
  if (!reduce.matches) return;
  [...active.values()].forEach(({animation,finish})=>{animation.cancel();finish()});
 });
})();
