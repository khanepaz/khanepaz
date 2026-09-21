/* ==========================================================
   خانه‌پز | منطق صفحه
   داده‌ها فقط از طریق DataAPI (api.js) گرفته می‌شوند؛
   بنابراین رفتن از فایل JSON به سرور، این فایل را تغییر نمی‌دهد.
   ========================================================== */
(() => {
  'use strict';

  const CFG = window.KHANEPAZ_CONFIG;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const fa = n => Number(n).toLocaleString('fa-IR');
  const faRate = n => Number(n).toLocaleString('fa-IR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const faDate = iso => {
    const d = new Date(iso);
    return isNaN(d) ? '' : d.toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' });
  };
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&', '<': '<', '>': '>', '"': '"', "'": '&#39;' }[c]));
  const norm = s => String(s || '')
    .replace(/[يى]/g, 'ی').replace(/ك/g, 'ک')
    .replace(/[\u064B-\u065F\u0640]/g, '')
    .replace(/[\u200c\u200f]/g, ' ')
    .replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
    .replace(/\s+/g, ' ').toLowerCase().trim();
  const rand = (a, b) => Math.random() * (b - a) + a;

  let S = {};
  let filter = 'all';
  let page = 1;
  let rate = 5;

  const catBy = slug => S.categories.find(c => c.slug === slug);
  const recipeBy = id => S.recipes.find(r => r.id === id);
  const countIn = slug => S.recipes.filter(r => r.category === slug).length;

  function art(item, cls = '', extra = '') {
    if (item.image) {
      return `<div class="art ${cls}" style="${extra}"><img src="${esc(item.image)}" alt="${esc(item.title || item.caption || '')}" loading="lazy"></div>`;
    }
    const a = item.art || {};
    return `<div class="art ${cls}" style="--a:${esc(a.from || '#f4c26b')};--b:${esc(a.to || '#c9743a')};${extra}">
      <span class="art-emoji" aria-hidden="true">${a.emoji || '🍰'}</span>
      <i class="wisp w1"></i><i class="wisp w2"></i><i class="wisp w3"></i></div>`;
  }
  const stars = r => `<span class="stars" style="--r:${Number(r) || 0}" aria-hidden="true">★★★★★</span>`;

  function card(r, opts = {}) {
    const cat = catBy(r.category);
    return `<article class="card ${opts.cls || ''}" data-recipe="${esc(r.id)}" tabindex="0" role="button" aria-label="${esc(r.title)}">
      ${art(r)}
      <span class="badge">${cat ? esc(cat.name) : ''}</span>
      ${opts.ribbon ? '<span class="ribbon" title="ویژه">★</span>' : ''}
      ${opts.isNew ? '<span class="new-dot">جدید</span>' : ''}
      <div class="card-body">
        <h3>${esc(r.title)}</h3>
        <p>${esc(r.excerpt)}</p>
        <div class="meta">
          <span>${fa(r.time)} دقیقه</span>
          ${stars(r.rating)}<span class="rate-n">${faRate(r.rating)}</span>
        </div>
        ${opts.date ? `<div class="date">${faDate(r.created)}</div>` : ''}
      </div></article>`;
  }

  function renderNav() {
    const dd = S.categories.map(c => `<button data-cat="${c.slug}"><span class="em">${c.icon}</span>${esc(c.name)}</button>`).join('');
    $('#catDDList').innerHTML = `<button data-cat="all"><span class="em">📖</span>همه‌ی دستورها</button>${dd}`;
    $('#sbCats').innerHTML = S.categories.map(c =>
      `<li><button data-cat="${c.slug}"><span>${c.icon}</span>${esc(c.name)}<span class="n">${fa(countIn(c.slug))}</span></button></li>`).join('');
    const email = S.site.social?.email;
    $('#sbFoot').innerHTML = `khanepaz.ir${email ? `<br><a href="mailto:${esc(email)}">${esc(email)}</a>` : ''}`;
  }

  function renderHero() {
    $('#heroTitle').textContent = S.site.heroTitle;
    $('#heroLead').textContent = S.site.heroLead;
    const freq = {};
    S.recipes.forEach(r => (r.tags || []).forEach(t => freq[t] = (freq[t] || 0) + 1));
    const top = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 6).map(e => e[0]);
    $('#heroTags').innerHTML = top.map(t => `<button class="tag" data-search="${esc(t)}">${esc(t)}</button>`).join('');
    $('#stats').textContent = `${fa(S.recipes.length)} دستور در ${fa(S.categories.length)} دسته و ${fa(S.tutorials.length)} آموزش`;
  }

  function renderCategories() {
    $('#catGrid').innerHTML = S.categories.map(c => `
      <button class="cat" data-cat="${c.slug}">
        <span class="cat-ic" aria-hidden="true">${c.icon}</span>
        <span><b>${esc(c.name)}</b><small>${esc(c.desc || '')}</small><small>${fa(countIn(c.slug))} دستور</small></span>
      </button>`).join('');
  }

  function renderFeatured() {
    const list = S.recipes.filter(r => r.featured).sort((a, b) => b.votes - a.votes).slice(0, 6);
    $('#featuredGrid').innerHTML = list.map(r => card(r, { ribbon: true })).join('');
  }

  function renderBrowse() {
    const chips = [{ slug: 'all', name: 'همه', n: S.recipes.length }, ...S.categories.map(c => ({ slug: c.slug, name: c.name, n: countIn(c.slug) }))];
    $('#chips').innerHTML = chips.map(c =>
      `<button class="chip" role="tab" aria-selected="${c.slug === filter}" data-cat="${c.slug}">${esc(c.name)} (${fa(c.n)})</button>`).join('');
    const list = S.recipes
      .filter(r => filter === 'all' || r.category === filter)
      .sort((a, b) => new Date(b.created) - new Date(a.created));
    const shown = list.slice(0, page * CFG.browsePageSize);
    $('#browseGrid').innerHTML = shown.length ? shown.map(r => card(r)).join('') : '<p>هنوز دستوری در این دسته نیست.</p>';
    $('#moreBtn').hidden = shown.length >= list.length;
    const cat = catBy(filter);
    $('#browseInfo').textContent = cat ? `${cat.name}: ${fa(list.length)} دستور` : 'همه‌ی دستورها را ببینید یا با دسته‌بندی محدود کنید.';
  }

  function renderTutorials() {
    $('#tutGrid').innerHTML = S.tutorials.map(t => `
      <button class="tut" style="--c:${esc(t.color || '#e0980b')}" data-tutorial="${esc(t.id)}">
        ${t.image ? `<span class="tut-photo"><img src="${esc(t.image)}" alt="${esc(t.title)}" loading="lazy"></span>` : ''}
        <span class="tut-ic" aria-hidden="true">${t.icon}</span>
        <h3>${esc(t.title)}</h3>
        <p>${esc(t.summary)}</p>
        <span class="tut-meta"><span>${esc(t.level)}</span><span>${fa(t.duration)} دقیقه</span><span>${fa(t.steps.length)} مرحله</span></span>
      </button>`).join('');
  }

  function renderGallery() {
    $('#galleryGrid').innerHTML = S.gallery.map(g => `
      <button class="g-item" data-gallery="${esc(g.id)}" aria-label="${esc(g.caption)}">
        ${art(g, '', `--ratio:${esc(g.ratio || '1/1')}`)}
        <span class="g-cap">${esc(g.caption)}</span>
      </button>`).join('');
  }

  function renderLatest() {
    const list = [...S.recipes].sort((a, b) => new Date(b.created) - new Date(a.created)).slice(0, CFG.latestCount);
    $('#latestRow').innerHTML = list.map((r, i) => card(r, { cls: 'mini', isNew: i < 2, date: true })).join('');
  }

  function renderBest() {
    const list = [...S.recipes].sort((a, b) => b.rating - a.rating || b.votes - a.votes).slice(0, CFG.bestCount);
    $('#bestList').innerHTML = list.map((r, i) => `
      <li><a class="rank ${i < 3 ? 'rank-top' : ''}" href="#recipe=${esc(r.id)}" data-recipe="${esc(r.id)}">
        <span class="rank-n" aria-label="رتبه ${fa(i + 1)}">${fa(i + 1)}</span>
        <span class="thumb">${art(r)}</span>
        <div><h3>${esc(r.title)}</h3>
          <div class="meta">${stars(r.rating)}<span class="rate-n">${faRate(r.rating)}</span><span>${fa(r.votes)} رأی</span></div>
        </div></a></li>`).join('');
  }

  function renderStory() {
    const st = S.site.story;
    $('#storyYears').textContent = st.years;
    $('#storyText').innerHTML = `<h2>${esc(st.title)}</h2>${st.paragraphs.map(p => `<p>${esc(p)}</p>`).join('')}<p class="sig">خانواده‌ی خانه‌پز</p>`;
  }

  const AV = ['#f5c451', '#f19bb2', '#9bbf6a', '#f6a56a', '#b8a2e0'];
  function renderComments() {
    $('#cmList').innerHTML = S.comments.map((c, i) => {
      const r = c.recipeId && recipeBy(c.recipeId);
      return `<article class="cm">
        <div class="cm-top">
          <span class="avatar" style="--c:${AV[i % AV.length]}" aria-hidden="true">${esc([...c.name][0] || '؟')}</span>
          <div><b>${esc(c.name)}${c.local ? '<span class="mine">نظر شما</span>' : ''}</b><small>${faDate(c.date)}</small></div>
          ${stars(c.rating)}
        </div>
        <p>${esc(c.text)}</p>
        ${r ? `<button class="on" data-recipe="${esc(r.id)}">درباره‌ی «${esc(r.title)}»</button>` : ''}
      </article>`;
    }).join('');
  }

  function renderCommentForm() {
    $('#cmRecipe').innerHTML = '<option value="">کلی</option>' + S.recipes.map(r => `<option value="${esc(r.id)}">${esc(r.title)}</option>`).join('');
    $('#rateStars').innerHTML = [1, 2, 3, 4, 5].map(n =>
      `<button type="button" data-v="${n}" role="radio" aria-label="${fa(n)} از ۵" aria-checked="false">★</button>`).join('');
    setRate(5);
    $('#cmHint').textContent = CFG.mode === 'api' ? '' : 'فعلاً نظر شما فقط در همین مرورگر ذخیره می‌شود.';
  }
  function setRate(n) {
    rate = n;
    $$('#rateStars button').forEach(b => {
      const on = Number(b.dataset.v) <= n;
      b.classList.toggle('on', on);
      b.setAttribute('aria-checked', String(Number(b.dataset.v) === n));
    });
  }

  function renderFooter() {
    $('#footDesc').textContent = S.site.description;
    $('#footCats').innerHTML = S.categories.map(c => `<li><button data-cat="${c.slug}">${esc(c.name)}</button></li>`).join('');
    const so = S.site.social || {};
    $('#footContact').innerHTML = [
      so.email && `<li><a href="mailto:${esc(so.email)}">${esc(so.email)}</a></li>`,
      so.instagram && `<li><a href="${esc(so.instagram)}" target="_blank" rel="noopener">اینستاگرام</a></li>`,
      so.telegram && `<li><a href="${esc(so.telegram)}" target="_blank" rel="noopener">تلگرام</a></li>`
    ].filter(Boolean).join('');
    $('#footNote').textContent = `${S.site.footerNote || ''}`;
  }

  function initCarousel() {
    const el = $('#carouselEl');
    const items = (S.site.carousel || []).map(s => ({ ...s, r: recipeBy(s.recipeId) })).filter(s => s.r);
    if (!items.length) { $('#carousel').hidden = true; return; }
    el.innerHTML = items.map((s, i) => {
      const a = s.r.art || {};
      const photo = s.image || s.r.image || '';
      const visual = `<span class="big" aria-hidden="true">${a.emoji || '🍰'}</span><i class="wisp w1"></i><i class="wisp w2"></i><i class="wisp w3"></i>` +
        (photo ? `<img class="slide-photo" src="${esc(photo)}" alt="${esc(s.title || s.r.title)}" loading="lazy">` : '');
      return `<div class="slide ${i === 0 ? 'on' : ''}" style="--a:${esc(a.from || '#f4c26b')};--b:${esc(a.to || '#a8560f')}" role="group" aria-roledescription="اسلاید" aria-label="${fa(i + 1)} از ${fa(items.length)}">
        <div class="slide-text">
          <span class="pill">${esc(s.badge || '')}</span>
          <h3>${esc(s.title)}</h3>
          <p>${esc(s.text)}</p>
          <button class="btn btn-honey" data-recipe="${esc(s.r.id)}">مشاهده‌ی دستور</button>
        </div>
        <div class="slide-art">${visual}</div>
      </div>`;
    }).join('') +
      `<button class="car-btn prev" aria-label="اسلاید قبلی">›</button>
       <button class="car-btn next" aria-label="اسلاید بعدی">‹</button>
       <div class="dots">${items.map((_, i) => `<button aria-label="اسلاید ${fa(i + 1)}" aria-current="${i === 0}"></button>`).join('')}</div>`;

    const slides = $$('.slide', el), dots = $$('.dots button', el);
    let i = 0, timer = null;
    const go = n => {
      i = (n + items.length) % items.length;
      slides.forEach((s, k) => { s.classList.toggle('on', k === i); s.setAttribute('aria-hidden', String(k !== i)); });
      dots.forEach((d, k) => d.setAttribute('aria-current', String(k === i)));
    };
    const stop = () => clearInterval(timer);
    const play = () => { stop(); if (!reduceMotion) timer = setInterval(() => go(i + 1), 6500); };
    $('.prev', el).onclick = () => { go(i - 1); play(); };
    $('.next', el).onclick = () => { go(i + 1); play(); };
    dots.forEach((d, k) => d.onclick = () => { go(k); play(); });
    el.addEventListener('mouseenter', stop);
    el.addEventListener('mouseleave', play);
    el.addEventListener('focusin', stop);
    el.addEventListener('focusout', play);
    let x0 = null;
    el.addEventListener('pointerdown', e => { x0 = e.clientX; });
    el.addEventListener('pointerup', e => {
      if (x0 === null) return;
      const dx = e.clientX - x0; x0 = null;
      if (Math.abs(dx) > 50) { go(dx < 0 ? i + 1 : i - 1); play(); }
    });
    document.addEventListener('visibilitychange', () => document.hidden ? stop() : play());
    go(0); play();
  }

  function makeAroma() {
    if (reduceMotion) return;
    const box = $('#aroma');
    const types = ['sugar', 'petal', 'sugar', 'spice', 'sugar', 'petal'];
    const n = innerWidth < 700 ? 14 : 26;
    for (let i = 0; i < n; i++) {
      const t = types[i % types.length];
      const s = document.createElement('span');
      s.className = 'p ' + t;
      s.style.cssText = `left:${rand(0, 100).toFixed(1)}%;--s:${(t === 'sugar' ? rand(4, 10) : rand(10, 17)).toFixed(1)}px;--dx:${rand(-130, 130).toFixed(0)}px;animation-duration:${rand(10, 19).toFixed(1)}s;animation-delay:${(-rand(0, 19)).toFixed(1)}s`;
      box.appendChild(s);
    }
  }

  const modal = $('#modal'), panel = $('#modalPanel');
  let lastFocus = null;
  const CLOSE_BTN = `<button class="icon-btn m-close" data-close aria-label="بستن"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button>`;

  function lockScroll() {
    const any = modal.classList.contains('open') || $('#searchLayer').classList.contains('open') || $('#sidebar').classList.contains('open');
    document.body.style.overflow = any ? 'hidden' : '';
  }
  function openModal(html, label) {
    if (!modal.classList.contains('open')) lastFocus = document.activeElement;
    panel.innerHTML = html;
    panel.setAttribute('aria-label', label || '');
    modal.inert = false;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    panel.scrollTop = 0;
    panel.focus({ preventScroll: true });
    lockScroll();
  }
  function closeModal() {
    if (!modal.classList.contains('open')) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    modal.inert = true;
    if (location.hash.startsWith('#recipe=')) history.replaceState(null, '', location.pathname + location.search);
    lockScroll();
    lastFocus && lastFocus.focus && lastFocus.focus({ preventScroll: true });
  }

  function openRecipe(id) {
    const r = recipeBy(id);
    if (!r) return;
    const cat = catBy(r.category);
    const rel = S.recipes.filter(x => x.category === r.category && x.id !== r.id).slice(0, 4);
    history.replaceState(null, '', '#recipe=' + r.id);
    openModal(`
      ${CLOSE_BTN}
      <div class="m-head">${art(r)}
        <div class="m-title">
          <h2>${esc(r.title)}</h2>
          <div class="m-chips">
            ${cat ? `<span>${cat.icon} ${esc(cat.name)}</span>` : ''}
            <span>${fa(r.time)} دقیقه</span>
            <span>برای ${fa(r.servings)} نفر</span>
            <span>${esc(r.difficulty)}</span>
            <span>${stars(r.rating)} ${faRate(r.rating)} (${fa(r.votes)} رأی)</span>
          </div>
        </div>
      </div>
      <div class="m-body">
        <p class="m-lead">${esc(r.excerpt)}</p>
        <div class="ing"><h3>مواد لازم</h3>${r.ingredients.map(i => `<label><input type="checkbox"><span>${esc(i)}</span></label>`).join('')}</div>
        <div><h3>طرز تهیه</h3><ol class="steps">${r.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol></div>
        ${r.tip ? `<div class="tip"><b>نکته‌ی خانه‌پز:</b>${esc(r.tip)}</div>` : ''}
        <div class="m-actions">
          <button class="btn btn-green" data-action="share">کپی پیوند دستور</button>
          <button class="btn btn-ghost" data-action="print">چاپ دستور</button>
        </div>
        ${rel.length ? `<div class="m-related"><h3>دستورهای مشابه</h3><div class="row">${rel.map(x => `<button data-recipe="${esc(x.id)}">${esc(x.title)}</button>`).join('')}</div></div>` : ''}
      </div>`, r.title);
  }

  function openTutorial(id) {
    const t = S.tutorials.find(x => x.id === id);
    if (!t) return;
    const photo = t.image ? `<img class="m-head-photo" src="${esc(t.image)}" alt="${esc(t.title)}" loading="lazy">` : '';
    openModal(`
      ${CLOSE_BTN}
      <div class="m-head" style="position:relative">${photo}<div class="art" style="--a:${esc(t.color)};--b:#2f4a3a"><span class="art-emoji">${t.icon}</span></div>
        <div class="m-title"><h2>${esc(t.title)}</h2>
          <div class="m-chips"><span>${esc(t.level)}</span><span>${fa(t.duration)} دقیقه</span><span>${fa(t.steps.length)} مرحله</span></div></div></div>
      <div class="m-body" style="grid-template-columns:1fr">
        <p class="m-lead">${esc(t.summary)}</p>
        <div><h3>مراحل</h3><ol class="steps">${t.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol></div>
        ${t.note ? `<div class="tip"><b>یادت باشد:</b>${esc(t.note)}</div>` : ''}
      </div>`, t.title);
  }

  function openGallery(id) {
    const g = S.gallery.find(x => x.id === id);
    if (!g) return;
    const r = g.recipeId && recipeBy(g.recipeId);
    openModal(`
      ${CLOSE_BTN}
      <div class="m-head" style="min-height:min(60vh,420px)">${art(g)}
        <div class="m-title"><h2>${esc(g.caption)}</h2></div></div>
      ${r ? `<div class="lb-body"><p>این تصویر مربوط به «${esc(r.title)}» است.</p><button class="btn btn-green" data-recipe="${esc(r.id)}">مشاهده‌ی دستور</button></div>` : ''}`,
      g.caption);
  }

  const searchLayer = $('#searchLayer'), searchInput = $('#searchInput'), searchResults = $('#searchResults');
  const sidebar = $('#sidebar');

  function openSearch(q = '') {
    closeSidebar(); closeDD();
    searchLayer.classList.add('open');
    searchLayer.setAttribute('aria-hidden', 'false');
    searchInput.value = q;
    doSearch(q);
    setTimeout(() => searchInput.focus(), 50);
    lockScroll();
  }
  function closeSearch() {
    searchLayer.classList.remove('open');
    searchLayer.setAttribute('aria-hidden', 'true');
    lockScroll();
  }
  function doSearch(q) {
    const nq = norm(q);
    if (!nq) {
      searchResults.innerHTML = '<p class="sr-empty">عبارت جستجو را بنویسید…</p>';
      return;
    }
    const hits = [];
    S.recipes.forEach(r => {
      const cat = catBy(r.category);
      const hay = norm([r.title, r.excerpt, cat && cat.name, (r.tags || []).join(' '), (r.ingredients || []).join(' ')].join(' '));
      if (hay.includes(nq)) hits.push({ type: 'recipe', item: r, cat });
    });
    S.tutorials.forEach(t => {
      const hay = norm([t.title, t.summary, (t.steps || []).join(' ')].join(' '));
      if (hay.includes(nq)) hits.push({ type: 'tutorial', item: t });
    });
    searchResults.innerHTML = hits.length
      ? hits.slice(0, 20).map(({ type, item, cat }) => type === 'recipe'
        ? `<button class="sr-item" data-recipe="${esc(item.id)}"><span class="sr-thumb">${art(item)}</span><span><span class="sr-title">${esc(item.title)}</span><span class="sr-sub">${cat ? esc(cat.name) : ''}</span></span></button>`
        : `<button class="sr-item" data-tutorial="${esc(item.id)}"><span class="sr-thumb"><span class="art" style="--a:${esc(item.color)};--b:#2f4a3a"><span class="art-emoji">${item.icon}</span></span></span><span><span class="sr-title">${esc(item.title)}</span><span class="sr-sub">آموزش</span></span></button>`
      ).join('')
      : '<p class="sr-empty">چیزی پیدا نشد.</p>';
  }

  function closeSidebar() {
    sidebar.classList.remove('open');
    sidebar.setAttribute('aria-hidden', 'true');
    $('#scrim').classList.remove('open');
    lockScroll();
  }
  function closeDD() { $('#catDD')?.classList.remove('open'); }

  function bindEvents() {
    document.addEventListener('click', e => {
      const t = e.target.closest('[data-recipe],[data-cat],[data-tutorial],[data-gallery],[data-search],[data-action],[data-close]');
      if (!t) {
        if (!e.target.closest('.dd')) closeDD();
        return;
      }
      if (t.dataset.close != null) { closeModal(); closeSearch(); return; }
      if (t.dataset.recipe) { closeSearch(); return openRecipe(t.dataset.recipe); }
      if (t.dataset.tutorial) { closeSearch(); return openTutorial(t.dataset.tutorial); }
      if (t.dataset.gallery) return openGallery(t.dataset.gallery);
      if (t.dataset.cat) {
        filter = t.dataset.cat; page = 1; closeSidebar(); closeDD();
        renderBrowse();
        document.getElementById('browse')?.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      if (t.dataset.search) { openSearch(t.dataset.search); return; }
      if (t.dataset.action === 'share') {
        const url = location.href;
        navigator.clipboard?.writeText(url).then(() => {}).catch(() => prompt('پیوند:', url));
        return;
      }
      if (t.dataset.action === 'print') { window.print(); return; }
    });

    $('#openSidebar')?.addEventListener('click', () => {
      sidebar.classList.add('open');
      sidebar.setAttribute('aria-hidden', 'false');
      $('#scrim').classList.add('open');
      lockScroll();
    });
    $('#closeSidebar')?.addEventListener('click', closeSidebar);
    $('#scrim')?.addEventListener('click', closeSidebar);
    $('#openSearch')?.addEventListener('click', () => openSearch());
    $('#closeSearch')?.addEventListener('click', closeSearch);
    $('#themeBtn')?.addEventListener('click', () => {
      const d = document.documentElement;
      const next = d.getAttribute('data-theme') === 'dark' ? '' : 'dark';
      if (next) d.setAttribute('data-theme', next); else d.removeAttribute('data-theme');
      try { localStorage.setItem('kp-theme', next); } catch (e) {}
    });
    $('#catDD .dd-btn')?.addEventListener('click', e => {
      e.stopPropagation();
      $('#catDD').classList.toggle('open');
    });
    $('#moreBtn')?.addEventListener('click', () => { page++; renderBrowse(); });
    $('#rateStars')?.addEventListener('click', e => {
      const b = e.target.closest('[data-v]');
      if (b) setRate(+b.dataset.v);
    });
    $('#heroSearch')?.addEventListener('submit', e => {
      e.preventDefault();
      openSearch($('#heroInput').value);
    });
    searchInput?.addEventListener('input', () => doSearch(searchInput.value));
    document.addEventListener('keydown', e => {
      if (e.key === '/' && !e.target.matches('input,textarea')) { e.preventDefault(); openSearch(); }
      if (e.key === 'Escape') { closeModal(); closeSearch(); closeSidebar(); closeDD(); }
    });
    $('#toTop')?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    $('#cmForm')?.addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const name = (fd.get('name') || '').toString().trim();
      const text = (fd.get('text') || '').toString().trim();
      if (!name || !text) return;
      const c = { name, text, rating: rate, recipeId: fd.get('recipeId') || null, date: new Date().toISOString().slice(0, 10), local: true };
      S.comments.unshift(c);
      try {
        const prev = JSON.parse(localStorage.getItem('kp-comments') || '[]');
        prev.unshift(c);
        localStorage.setItem('kp-comments', JSON.stringify(prev.slice(0, 50)));
      } catch (err) {}
      renderComments();
      e.target.reset();
      setRate(5);
    });
  }

  function bindScroll() {
    const spyLinks = $$('[data-spy]');
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        spyLinks.forEach(a => a.classList.toggle('is-active', a.dataset.spy === en.target.id));
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    ['home', 'featured', 'tutorials', 'gallery', 'latest', 'best', 'comments'].forEach(id => {
      const s = document.getElementById(id); s && io.observe(s);
    });
    window.addEventListener('scroll', () => {
      const h = document.documentElement;
      const p = h.scrollTop / (h.scrollHeight - h.clientHeight || 1);
      $('#progress').style.transform = `scaleX(${Math.min(1, Math.max(0, p))})`;
      $('#nav').classList.toggle('scrolled', h.scrollTop > 20);
    }, { passive: true });
  }

  function handleHash() {
    const m = location.hash.match(/^#recipe=(.+)$/);
    if (m) openRecipe(decodeURIComponent(m[1]));
  }
  window.addEventListener('hashchange', handleHash);

  function showError(err) {
    console.error(err);
    $('#loader').classList.add('done');
    $('#main').insertAdjacentHTML('afterbegin', `
      <div class="error-box wrap">
        <h2>داده‌ها بارگذاری نشد</h2>
        <p>اگر فایل index.html را مستقیم در مرورگر باز کرده‌اید، مرورگر خواندن فایل‌های JSON را مسدود می‌کند.</p>
        <p><code>python3 -m http.server 8000</code></p>
      </div>`);
  }

  async function init() {
    try {
      if (!localStorage.getItem('kp-theme') && matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
      }
    } catch (e) {}
    modal.inert = true; sidebar.inert = true; searchLayer.inert = true;
    try { S = await DataAPI.loadAll(); }
    catch (err) { return showError(err); }
    try {
      const local = JSON.parse(localStorage.getItem('kp-comments') || '[]');
      if (local.length) S.comments = [...local, ...(S.comments || [])];
    } catch (e) {}
    renderNav(); renderHero(); renderCategories(); renderFeatured(); renderBrowse();
    renderTutorials(); renderGallery(); renderLatest(); renderBest(); renderStory();
    renderComments(); renderCommentForm(); renderFooter();
    initCarousel(); makeAroma();
    bindEvents(); bindScroll();
    setTimeout(() => $('#loader').classList.add('done'), 350);
    handleHash();
  }

  init();
})();
