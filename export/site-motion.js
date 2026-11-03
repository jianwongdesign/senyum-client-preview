/* Progressive motion: content stays visible if scripts or observers are unavailable. */
(() => {
 if (window.senyumMotionReady) return;
 window.senyumMotionReady = true;
 const reduce = matchMedia('(prefers-reduced-motion: reduce)');
 const running = new Set();
 const animate = (element, delay = 0) => {
  if (reduce.matches || !element.animate) return;
  const animation = element.animate([
   { opacity: 0, transform: 'translateY(16px)' },
   { opacity: 1, transform: 'translateY(0)' }
  ], { duration: 620, delay, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' });
  running.add(animation);
  animation.finished.catch(() => {}).finally(() => running.delete(animation));
 };
 const loader = document.querySelector('#senyum-loading');
 if (loader) {
  if (reduce.matches || !loader.animate) loader.remove();
  else loader.animate([{opacity:1},{opacity:0}],{duration:240,easing:'ease-out'}).finished.then(()=>loader.remove());
 }
 document.querySelectorAll('.hero-editorial>h1,.hero-editorial>.hero-description,.hero-editorial>.hero-search,.hero-copy>h1,.hero-copy>.hero-lead,.hero-photo').forEach((el,i)=>animate(el,80+i*70));
 if (!('IntersectionObserver' in window)) return;
 const seen = new WeakSet();
 const observer = new IntersectionObserver(entries => {
  entries.filter(entry=>entry.isIntersecting).forEach((entry,i)=>{
   observer.unobserve(entry.target);
   animate(entry.target,Math.min(i*45,135));
  });
 },{threshold:.08});
 const scan = () => document.querySelectorAll('.package-results article,.section-heading,.care-intro,.care-benefits>div,.umrah-options>a,.journey-type,.team-person,.service-grid>a,.story-grid,.contact-copy').forEach(el=>{
  if(seen.has(el)) return;
  seen.add(el);
  const rect=el.getBoundingClientRect();
  if(rect.top<innerHeight && rect.bottom>0 && rect.width) return;
  observer.observe(el);
 });
 scan();
 let frame=0;
 new MutationObserver(()=>{if(!frame)frame=requestAnimationFrame(()=>{frame=0;scan()})}).observe(document.querySelector('main')||document.body,{childList:true,subtree:true});
 reduce.addEventListener('change',()=>{if(reduce.matches)running.forEach(animation=>animation.cancel())});
})();
