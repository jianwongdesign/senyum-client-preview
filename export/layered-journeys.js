/* Only the hero stays behind the first content panel; later sections flow normally. */
(() => {
  const header = document.querySelector('header');
  if (!header) return;
  const updateHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();
  document.addEventListener('click', event => {
    const anchor = event.target.closest('a[href^="#"]');
    if (!anchor) return;
    const target = document.getElementById(anchor.getAttribute('href').slice(1));
    if (!target) return;
    event.preventDefault();
    document.documentElement.classList.add('journey-measuring');
    const destination = target.getBoundingClientRect().top + window.scrollY - header.firstElementChild.offsetHeight - 16;
    document.documentElement.classList.remove('journey-measuring');
    history.replaceState(null, '', anchor.getAttribute('href'));
    window.scrollTo({ top: Math.max(0, destination), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  });
})();

/* Load only one web-optimised film, and respect reduced motion and data saving. */
(() => {
  const video = document.querySelector('.destination-hero__video');
  const button = document.querySelector('.hero-film-toggle');
  const hero = document.querySelector('#top');
  if (!video || !button || !hero) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let userPaused = false;
  let manuallyStarted = false;
  let visible = true;
  const automaticAllowed = () => !motion.matches && !navigator.connection?.saveData;
  const updateControl = playing => {
    button.setAttribute('aria-label', playing ? 'Pause background film' : 'Play background film');
    button.querySelector('span').textContent = playing ? 'Pause film' : 'Play film';
    button.querySelector('svg').innerHTML = playing
      ? '<path d="M8 5v14M16 5v14" />'
      : '<path d="m9 5 10 7-10 7Z" />';
  };
  const play = async () => {
    if (userPaused || !visible || document.hidden || (!automaticAllowed() && !manuallyStarted)) return;
    if (!video.getAttribute('src')) {
      video.src = innerWidth < 768 && innerHeight > innerWidth ? video.dataset.mobile : video.dataset.desktop;
      video.muted = true;
      video.defaultMuted = true;
      video.loop = true;
      video.playsInline = true;
      video.playbackRate = .7;
    }
    try { await video.play(); } catch { updateControl(false); }
  };
  video.addEventListener('playing', () => { video.classList.add('is-playing'); updateControl(true); });
  video.addEventListener('pause', () => updateControl(false));
  video.addEventListener('error', () => { video.classList.remove('is-playing'); updateControl(false); });
  button.addEventListener('click', () => {
    if (!video.paused) { userPaused = true; video.pause(); }
    else { userPaused = false; manuallyStarted = true; play(); }
  });
  // A sticky hero remains geometrically on screen behind the next panel.
  // Measure the uncovered part so a fully covered film does not keep decoding.
  let visibilityFrame = 0;
  const checkVisibility = () => {
    visibilityFrame = 0;
    const box = hero.getBoundingClientRect();
    const nextTop = document.querySelector('#finder').getBoundingClientRect().top;
    const headerHeight = document.querySelector('header').firstElementChild.offsetHeight;
    const uncovered = Math.min(box.bottom, nextTop) - Math.max(box.top, headerHeight);
    visible = uncovered > innerHeight * .12;
    if (!visible) video.pause();
    else if (video.paused) play();
  };
  const scheduleVisibility = () => {
    if (!visibilityFrame) visibilityFrame = requestAnimationFrame(checkVisibility);
  };
  window.addEventListener('scroll', scheduleVisibility, { passive: true });
  window.addEventListener('resize', scheduleVisibility, { passive: true });
  document.addEventListener('visibilitychange', () => { if (document.hidden) video.pause(); else play(); });
  motion.addEventListener('change', () => {
    manuallyStarted = false;
    if (!automaticAllowed()) video.pause(); else play();
  });
  checkVisibility();
})();

/* Custom destination pickers retain native select values for the existing forms. */
(() => {
  const pickers = [];
  let activePicker = null;
  const icon = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7"><path d="m7 10 5 5 5-5" /></svg>';
  document.querySelectorAll('#hero-destination, #package-search select').forEach((select, index) => {
    const wrap = document.createElement('div');
    wrap.className = 'destination-picker';
    select.before(wrap);
    wrap.append(select);
    select.classList.add('native-select-source');
    select.tabIndex = -1;
    select.setAttribute('aria-hidden', 'true');
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'destination-picker__trigger';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-controls', 'destination-options-' + index);
    trigger.innerHTML = '<span></span>' + icon;
    wrap.append(trigger);
    const popup = document.createElement('div');
    popup.className = 'destination-picker__popup';
    popup.hidden = true;
    popup.innerHTML = '<div class="destination-picker__search"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/></svg><input type="search" placeholder="Find a destination" aria-label="Find a destination" autocomplete="off" /></div><div class="destination-picker__list" role="listbox" aria-label="Destinations" id="destination-options-' + index + '"></div><p class="destination-picker__empty" hidden>No destinations found. Try another name.</p>';
    document.body.append(popup);
    const search = popup.querySelector('input');
    const list = popup.querySelector('[role="listbox"]');
    const empty = popup.querySelector('p');
    let options = [];
    let focused = -1;
    const sync = () => {
      const option = select.options[select.selectedIndex];
      trigger.querySelector('span').textContent = option ? option.textContent : 'Any destination';
      trigger.setAttribute('aria-label', 'Destination: ' + (option ? option.textContent : 'Any destination'));
    };
    const close = (restoreFocus = false) => {
      popup.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
      if (activePicker === picker) activePicker = null;
      if (restoreFocus) trigger.focus({ preventScroll: true });
    };
    const choose = value => {
      select.value = value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      sync(); close(true);
    };
    const focusOption = n => {
      focused = (n + options.length) % options.length;
      if (!options.length) return;
      options.forEach((el, i) => el.classList.toggle('is-focused', i === focused));
      options[focused].focus({ preventScroll: true });
      const optionBox = options[focused].getBoundingClientRect();
      const listBox = list.getBoundingClientRect();
      if (optionBox.bottom > listBox.bottom) list.scrollTop += optionBox.bottom - listBox.bottom;
      else if (optionBox.top < listBox.top) list.scrollTop -= listBox.top - optionBox.top;
    };
    const render = () => {
      list.replaceChildren(); options = []; focused = -1;
      const query = search.value.trim().toLowerCase();
      [...select.options].filter(o => (o.value + ' ' + o.textContent).toLowerCase().includes(query)).forEach(o => {
        const el = document.createElement('button');
        el.type = 'button'; el.className = 'destination-picker__option';
        el.setAttribute('role', 'option'); el.tabIndex = -1;
        el.setAttribute('aria-selected', String(o.value === select.value));
        const text = document.createElement('span');
        text.textContent = o.value === 'Any destination' ? 'Explore all destinations' : o.textContent;
        el.append(text);
        const check = document.createElement('span');
        check.className = 'destination-picker__check';
        check.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m5 12 4 4L19 6"/></svg>';
        el.append(check);
        el.addEventListener('click', () => choose(o.value));
        list.append(el); options.push(el);
      });
      empty.hidden = options.length > 0;
    };
    const position = () => {
      const r = trigger.getBoundingClientRect();
      const width = Math.min(380, innerWidth - 32);
      const below = innerHeight - r.bottom - 16;
      const above = r.top - 16;
      const upward = below < 280 && above > below;
      const available = Math.max(160, Math.min(330, upward ? above : below));
      popup.style.width = width + 'px';
      popup.style.left = Math.max(16, Math.min(r.left, innerWidth - width - 16)) + 'px';
      popup.style.top = upward ? 'auto' : (r.bottom + 10) + 'px';
      popup.style.bottom = upward ? (innerHeight - r.top + 10) + 'px' : 'auto';
      list.style.maxHeight = Math.max(85, available - 76) + 'px';
    };
    const open = () => {
      if (activePicker && activePicker !== picker) activePicker.close();
      activePicker = picker; sync(); search.value = ''; render();
      position();
      popup.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
      search.focus({ preventScroll: true });
    };
    const picker = { trigger, popup, sync, close, position };
    pickers.push(picker); sync();
    trigger.addEventListener('click', event => { event.preventDefault(); popup.hidden ? open() : close(); });
    trigger.addEventListener('keydown', event => {
      if (['ArrowDown', 'ArrowUp'].includes(event.key)) { event.preventDefault(); open(); focusOption(event.key === 'ArrowDown' ? 0 : options.length - 1); }
    });
    search.addEventListener('input', render);
    popup.addEventListener('keydown', event => {
      if (event.key === 'Escape') { event.preventDefault(); close(true); }
      else if (event.key === 'Tab') { close(true); }
      else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault(); focusOption(focused + (event.key === 'ArrowDown' ? 1 : -1));
      } else if (event.key === 'Home' && event.target !== search) { event.preventDefault(); focusOption(0); }
      else if (event.key === 'End' && event.target !== search) { event.preventDefault(); focusOption(options.length - 1); }
      else if (event.key === 'Enter' && event.target === search && options.length) { event.preventDefault(); options[0].click(); }
    });
    select.addEventListener('change', sync);
  });
  document.addEventListener('pointerdown', event => {
    if (activePicker && !activePicker.popup.contains(event.target) && !activePicker.trigger.contains(event.target)) activePicker.close();
  });
  document.addEventListener('click', () => requestAnimationFrame(() => pickers.forEach(p => p.sync())));
  document.addEventListener('submit', () => requestAnimationFrame(() => pickers.forEach(p => p.sync())));
  document.addEventListener('wheel', event => { if (activePicker && !activePicker.popup.contains(event.target)) activePicker.close(); }, { passive: true });
  window.addEventListener('resize', () => { if (activePicker) activePicker.position(); });
})();
