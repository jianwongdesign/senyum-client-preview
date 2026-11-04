/* Small, one-time reveals start before content enters the viewport. */
(() => {
 if (window.senyumMotionReady) return;
 window.senyumMotionReady = true;
 const reduce = matchMedia('(prefers-reduced-motion: reduce)');
 const running = new Set();
 const animate = element => {
  if (reduce.matches || !element.animate) return;
  const animation = element.animate([{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:380,easing:'cubic-bezier(.22,1,.36,1)'});
  running.add(animation);
  animation.finished.catch(()=>{}).finally(()=>running.delete(animation));
 };
 const loader = document.querySelector('#senyum-loading');
 if (loader) {
  if (reduce.matches || !loader.animate) loader.remove();
  else loader.animate([{opacity:1},{opacity:0}],{duration:180,easing:'ease-out'}).finished.then(()=>loader.remove());
 }
 if (!('IntersectionObserver' in window) || reduce.matches) return;
 const selector='.package-results article,.section-heading,.care-intro,.care-benefits>div,.umrah-options>a,.journey-type,.team-person,.service-grid>a,.story-grid,.contact-copy';
 const seen = new WeakSet();
 const observer = new IntersectionObserver(entries=>entries.forEach(entry=>{
  if(!entry.isIntersecting)return;
  observer.unobserve(entry.target);
  // Fast scrolling and newly mounted results stay readable without fading out.
  if(entry.boundingClientRect.top>=innerHeight) animate(entry.target);
 }),{rootMargin:'0px 0px 120px 0px',threshold:0});
 const register = el => {
  if(seen.has(el))return;
  seen.add(el);
  const rect=el.getBoundingClientRect();
  if(rect.width && rect.top>=innerHeight)observer.observe(el);
 };
 const scan = root => {if(root.nodeType!==1)return;if(root.matches(selector))register(root);root.querySelectorAll(selector).forEach(register)};
 scan(document.querySelector('main')||document.body);
 const mutations=new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(scan)));
 mutations.observe(document.querySelector('main')||document.body,{childList:true,subtree:true});
 reduce.addEventListener('change',()=>{if(reduce.matches){running.forEach(animation=>animation.cancel());observer.disconnect();mutations.disconnect()}});
})();
