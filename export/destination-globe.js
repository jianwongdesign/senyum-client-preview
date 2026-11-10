/* Compact mobile discovery. Real land geometry, user-controlled movement, no animation loop. */
(() => {
  const section = document.querySelector('#dest');
  const mobile = matchMedia('(max-width:767px)');
  if (!section) return;
  const destinations = __GLOBE_DESTINATIONS__;
  let initialized = false;
  const loadScript = src => new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src; script.onload = resolve; script.onerror = reject;
    document.head.append(script);
  });
  async function init() {
    if (!mobile.matches || initialized) return;
    initialized = true;
    try {
      await loadScript('assets/globe/d3-array.min.js');
      await loadScript('assets/globe/d3-geo.min.js');
      const response = await fetch('assets/globe/land.json');
      if (!response.ok) throw Error('Globe unavailable');
      const land = await response.json();
      const root = document.createElement('div');
      root.className = 'destination-globe';
      root.innerHTML = `<div class="destination-globe__stage"><svg class="destination-globe__map" viewBox="0 0 320 260" role="img" aria-label="Destination globe. Drag left or right to turn, tap a dot to choose. You can also use the country picker below."><circle cx="160" cy="130" r="120" fill="#dceee2"/><path class="globe-grid" fill="none" stroke="#bed7c8" stroke-width="0.65"/><path class="globe-land" fill="#76a58a" stroke="#eef7ef" stroke-width="0.45"/><g class="globe-pins"></g></svg><span class="destination-globe__label" aria-hidden="true"></span></div><div class="destination-globe__hint">Swipe to explore · Tap a dot</div><div class="destination-globe__picker"><button type="button" class="globe-prev" aria-label="Previous destination"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 6-6 6 6 6"/></svg></button><label><span class="globe-sr-only">Choose a destination</span><select class="globe-select"></select></label><button type="button" class="globe-next" aria-label="Next destination"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m10 6 6 6-6 6"/></svg></button></div><div class="destination-globe__journeys" aria-label="Journeys for selected destination"></div><span class="globe-sr-only globe-status" role="status" aria-live="polite"></span>`;
      const svg = root.querySelector('svg');
      const select = root.querySelector('select');
      const label = root.querySelector('.destination-globe__label');
      destinations.forEach((d, i) => select.add(new Option(d.name, i)));
      const projection = d3.geoOrthographic().scale(120).translate([160, 130]).clipAngle(90).rotate([-90, -20]);
      const path = d3.geoPath(projection);
      const grid = d3.geoGraticule10();
      let selected = 0;
      let drag = null;
      let frame = 0;
      let visiblePoints = [];
      function render() {
        frame = 0;
        root.querySelector('.globe-land').setAttribute('d', path(land));
        root.querySelector('.globe-grid').setAttribute('d', path(grid));
        const centre = projection.invert([160,130]);
        visiblePoints = destinations.map((d, index) => ({...d, index, point:projection(d.coordinates)})).filter(d => d3.geoDistance(d.coordinates, centre) < Math.PI / 2 - .04);
        root.querySelector('.globe-pins').innerHTML = visiblePoints.map(d => `<circle cx="${d.point[0]}" cy="${d.point[1]}" r="${d.index === selected ? 6 : 3.5}" fill="${d.index === selected ? '#103f35' : '#f8fbf8'}" stroke="#103f35" stroke-width="1.4"/>`).join('');
        const current = visiblePoints.find(d => d.index === selected);
        label.hidden = !current;
        if (current) { label.textContent = current.name; label.style.left = (current.point[0] / 320 * 100) + '%'; label.style.top = (current.point[1] / 260 * 100) + '%'; }
      }
      function choose(index, centre = true) {
        selected = (index + destinations.length) % destinations.length;
        const d = destinations[selected];
        select.value = selected;
        if (centre) projection.rotate([-d.coordinates[0], -d.coordinates[1]]);
        const links = root.querySelector('.destination-globe__journeys');
        links.replaceChildren();
        for (const journey of d.journeys) {
          const a = document.createElement('a'); a.href = journey.url; a.textContent = journey.label;
          a.setAttribute('aria-label', journey.label + ' in ' + d.name);
          a.insertAdjacentHTML('beforeend','<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6"/></svg>');
          links.append(a);
        }
        root.querySelector('.globe-status').textContent = d.name + ': ' + d.journeys.map(j => j.label).join(', ');
        render();
      }
      root.querySelector('.globe-prev').onclick = () => choose(selected - 1);
      root.querySelector('.globe-next').onclick = () => choose(selected + 1);
      select.onchange = () => choose(Number(select.value));
      svg.addEventListener('pointerdown', e => {
        if (e.button !== 0) return;
        drag = {x:e.clientX, y:e.clientY, rotation:projection.rotate(), moved:false};
        svg.setPointerCapture(e.pointerId);
      });
      svg.addEventListener('pointermove', e => {
        if (!drag) return;
        const dx = e.clientX - drag.x;
        if (Math.abs(dx) > 5) drag.moved = true;
        if (!drag.moved) return;
        projection.rotate([drag.rotation[0] + dx * .6, drag.rotation[1]]);
        if (!frame) frame = requestAnimationFrame(render);
      });
      svg.addEventListener('pointerup', e => {
        if (!drag) return;
        if (!drag.moved && Math.abs(e.clientY - drag.y) < 8) {
          const rect = svg.getBoundingClientRect();
          const x = (e.clientX-rect.left)/rect.width*320, y = (e.clientY-rect.top)/rect.height*260;
          const nearest = visiblePoints.map(d => ({...d, distance:Math.hypot(d.point[0]-x,d.point[1]-y)})).sort((a,b)=>a.distance-b.distance)[0];
          if (nearest && nearest.distance < 18) choose(nearest.index, false);
        }
        drag = null;
      });
      svg.addEventListener('pointercancel', () => { drag = null; });
      section.firstElementChild.append(root);
      choose(0, false);
      section.classList.add('has-globe');
    } catch (error) {
      // Preserve the fully linked original directory when map assets are unavailable.
      initialized = false;
    }
  }
  mobile.addEventListener('change', init);
  init();
})();
