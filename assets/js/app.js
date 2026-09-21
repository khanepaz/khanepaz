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
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  // یکسان‌سازی حروف عربی/فارسی و نیم‌فاصله برای جستجو
  const norm = s => String(s || '')
    .replace(/[يى]/g, 'ی').replace(/ك/g, 'ک')
    .replace(/[\u064B-\u065F\u0640]/g, '')
    .replace(/[\u200c\u200f]/g, ' ')
    .replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
    .replace(/\s+/g, ' ').toLowerCase().trim();
  const rand = (a, b) => Math.random() * (b - a) + a;

  let S = {};                 // state: site, categories, recipes, ...
  let filter = 'all';
  let page = 1;
  let rate = 5;

  const catBy = slug => S.categories.find(c => c.slug === slug);
  const recipeBy = id => S.recipes.find(r => r.id === id);
  const countIn = slug => S.recipes.filter(r => r.category === slug).length;

  /* ---------- تصویر: عکس واقعی یا طرح گرادیان + ایموجی ---------- */
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

  /* ---------- رندر بخش‌ها ---------- */
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

  /* ---------- کاروسل ---------- */
  function initCarousel() {
    const el = $('#carouselEl');
    const items = (S.site.carousel || []).map(s => ({ ...s, r: recipeBy(s.recipeId) })).filter(s => s.r);
    if (!items.length) { $('#carousel').hidden = true; return; }
    el.innerHTML = items.map((s, i) => {
      const a = s.r.art || {};
      const visual = s.r.image
        ? `<img src="${esc(s.r.image)}" alt="${esc(s.r.title)}">`
        : `<span class="big" aria-hidden="true">${a.emoji || '🍰'}</span><i class="wisp w1"></i><i class="wisp w2"></i><i class="wisp w3"></i>`;
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
      if (Math.abs(dx) > 50) { go(dx < 0 ? i + 1 : i - 1); play(); }   // راست‌به‌چپ: کشیدن به چپ = بعدی
    });
    document.addEventListener('visibilitychange', () => document.hidden ? stop() : play());
    go(0); play();
  }

  /* ---------- ذرات عطر در هیرو ---------- */
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

  /* ---------- پنجره‌ی مودال ---------- */
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
    openModal(`
      ${CLOSE_BTN}
      <div class="m-head"><div class="art" style="--a:${esc(t.color)};--b:#2f4a3a"><span class="art-emoji">${t.icon}</span></div>
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

  /* ---------- جستجو ---------- */
  const searchLayer = $('#searchLayer'), searchInput = $('#searchInput'), searchResults = $('#searchResults');

  function openSearch(q = '') {
    closeSidebar(); closeDD();
    searchLayer.inert = false;
    searchLayer.classList.add('open');
    searchLayer.setAttribute('aria-hidden', 'false');
    searchInput.value = q;
    runSearch(q);
    setTimeout(() => searchInput.focus(), 60);
    lockScroll();
  }
  function closeSearch() {
    searchLayer.classList.remove('open');
    searchLayer.setAttribute('aria-hidden', 'true');
    searchLayer.inert = true;
    lockScroll();
  }
  function runSearch(q) {
    const n = norm(q);
    if (!n) {
      const freq = {};
      S.recipes.forEach(r => (r.tags || []).forEach(t => freq[t] = (freq[t] || 0) + 1));
      const tags = Object.keys(freq).slice(0, 10);
      searchResults.innerHTML = `<p class="sr-hint">چیزی بنویسید، یا یکی از این‌ها را امتحان کنید:</p>
        <div class="sr-tags">${tags.map(t => `<button class="tag" data-search="${esc(t)}">${esc(t)}</button>`).join('')}</div>`;
      return;
    }
    const words = n.split(' ');
    const scored = [];
    S.recipes.forEach(r => {
      const cat = catBy(r.category);
      const title = norm(r.title);
      const hay = norm([r.title, r.excerpt, cat && cat.name, (r.tags || []).join(' '), (r.ingredients || []).join(' ')].join(' '));
      if (!words.every(w => hay.includes(w))) return;
      const score = (title.includes(n) ? 6 : 0) + words.filter(w => title.includes(w)).length * 2 + ((r.tags || []).some(t => norm(t).includes(n)) ? 3 : 0) + r.rating / 5;
      scored.push({ kind: 'r', item: r, score });
    });
    S.tutorials.forEach(t => {
      const hay = norm([t.title, t.summary, t.steps.join(' ')].join(' '));
      if (words.every(w => hay.includes(w))) scored.push({ kind: 't', item: t, score: norm(t.title).includes(n) ? 5 : 1 });
    });
    scored.sort((a, b) => b.score - a.score);
    const out = scored.slice(0, 8).map(({ kind, item }) => kind === 'r'
      ? `<button class="sr-item" data-recipe="${esc(item.id)}"><span class="sr-thumb">${art(item)}</span>
           <span><span class="sr-title">${esc(item.title)}</span><br><span class="sr-sub">${esc((catBy(item.category) || {}).name || '')} | ${fa(item.time)} دقیقه</span></span></button>`
      : `<button class="sr-item" data-tutorial="${esc(item.id)}"><span class="sr-thumb"><span class="art" style="--a:${esc(item.color)};--b:#2f4a3a"><span class="art-emoji">${item.icon}</span></span></span>
           <span><span class="sr-title">${esc(item.title)}</span><br><span class="sr-sub">آموزش</span></span></button>`);
    searchResults.innerHTML = out.length ? out.join('') : `<p class="sr-empty">چیزی برای «${esc(q)}» پیدا نشد. نام یک مادهٔ اولیه (مثل «هل») یا نوع شیرینی را امتحان کنید.</p>`;
  }

  /* ---------- سایدبار و منو ---------- */
  const sidebar = $('#sidebar'), scrim = $('#scrim');
  function openSidebar() {
    sidebar.inert = false;
    sidebar.classList.add('open'); scrim.classList.add('open');
    sidebar.setAttribute('aria-hidden', 'false');
    lockScroll();
    $('#closeSidebar').focus({ preventScroll: true });
  }
  function closeSidebar() {
    if (!sidebar.classList.contains('open')) return;
    sidebar.classList.remove('open'); scrim.classList.remove('open');
    sidebar.setAttribute('aria-hidden', 'true');
    sidebar.inert = true;
    lockScroll();
  }
  const dd = $('#catDD');
  function closeDD() { dd.classList.remove('open'); $('.dd-btn', dd).setAttribute('aria-expanded', 'false'); }

  function goCat(slug) {
    closeSidebar(); closeDD(); closeSearch();
    filter = slug; page = 1;
    renderBrowse();
    $('#browse').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove('show'), 2600);
  }

  /* ---------- رویدادها ---------- */
  function bindEvents() {
    document.addEventListener('click', e => {
      const t = e.target.closest('[data-recipe],[data-cat],[data-tutorial],[data-gallery],[data-search],[data-action],[data-close]');
      if (!t) return;
      if (t.matches('a[data-recipe]')) e.preventDefault();

      if (t.dataset.close !== undefined) return closeModal();
      if (t.dataset.action === 'share') {
        const url = location.href;
        (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(() => toast('پیوند کپی شد')).catch(() => toast(url));
        return;
      }
      if (t.dataset.action === 'print') return window.print();
      if (t.dataset.cat) return goCat(t.dataset.cat);
      if (t.dataset.search !== undefined) return openSearch(t.dataset.search);
      if (t.dataset.recipe) { closeSearch(); return openRecipe(t.dataset.recipe); }
      if (t.dataset.tutorial) { closeSearch(); return openTutorial(t.dataset.tutorial); }
      if (t.dataset.gallery) return openGallery(t.dataset.gallery);
    });

    document.addEventListener('keydown', e => {
      const t = e.target;
      if ((e.key === 'Enter' || e.key === ' ') && t.matches && t.matches('article[data-recipe]')) {
        e.preventDefault(); openRecipe(t.dataset.recipe); return;
      }
      if (e.key === 'Escape') { closeModal(); closeSearch(); closeSidebar(); closeDD(); return; }
      const typing = /INPUT|TEXTAREA|SELECT/.test(t.tagName);
      if (!typing && (e.key === '/' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k'))) { e.preventDefault(); openSearch(); }
    });

    $('#openSearch').onclick = () => openSearch();
    $('#closeSearch').onclick = closeSearch;
    searchLayer.addEventListener('mousedown', e => { if (e.target === searchLayer) closeSearch(); });
    searchInput.addEventListener('input', () => runSearch(searchInput.value));
    $('#heroSearch').addEventListener('submit', e => { e.preventDefault(); openSearch($('#heroInput').value); });

    $('#openSidebar').onclick = openSidebar;
    $('#closeSidebar').onclick = closeSidebar;
    scrim.onclick = closeSidebar;
    sidebar.addEventListener('click', e => { if (e.target.closest('a[href^="#"]')) closeSidebar(); });

    $('.dd-btn', dd).onclick = () => {
      const open = dd.classList.toggle('open');
      $('.dd-btn', dd).setAttribute('aria-expanded', String(open));
    };
    document.addEventListener('click', e => { if (!e.target.closest('#catDD')) closeDD(); });

    $('#moreBtn').onclick = () => { page++; renderBrowse(); };
    $('#toTop').onclick = () => scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });

    $('#themeBtn').onclick = () => {
      const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      document.querySelector('meta[name="theme-color"]').content = next === 'dark' ? '#16201a' : '#fff4ee';
      try { localStorage.setItem('kp-theme', next); } catch (e) {}
    };

    // امتیاز و ارسال نظر
    $('#rateStars').addEventListener('click', e => { const b = e.target.closest('button'); if (b) setRate(Number(b.dataset.v)); });
    $('#cmForm').addEventListener('submit', async e => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const c = {
        name: String(fd.get('name')).trim(),
        text: String(fd.get('text')).trim(),
        recipeId: fd.get('recipeId') || '',
        rating: rate,
        date: new Date().toISOString().slice(0, 10)
      };
      if (!c.name || !c.text) return;
      try {
        const saved = await DataAPI.addComment(c);
        S.comments.unshift(saved);
        renderComments();
        e.target.reset(); setRate(5);
        toast('نظر شما ثبت شد');
      } catch (err) {
        toast('ثبت نظر انجام نشد. دوباره تلاش کنید.');
      }
    });

    window.addEventListener('hashchange', handleHash);
  }

  function handleHash() {
    const h = decodeURIComponent(location.hash || '');
    if (h.startsWith('#recipe=')) openRecipe(h.slice(8));
    else if (h.startsWith('#cat=')) goCat(h.slice(5));
  }

  /* ---------- اسکرول: نوار پیشرفت، سایه‌ی منو، بخش فعال ---------- */
  function bindScroll() {
    const nav = $('#nav'), bar = $('#progress');
    let ticking = false;
    const update = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? Math.min(scrollY / max, 1) : 0})`;
      nav.classList.toggle('scrolled', scrollY > 12);
      ticking = false;
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();

    const links = $$('[data-spy]');
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        links.forEach(a => a.classList.toggle('is-active', a.dataset.spy === en.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['home', 'featured', 'tutorials', 'gallery', 'latest', 'best', 'comments'].forEach(id => { const s = document.getElementById(id); s && io.observe(s); });
  }

  /* ---------- راه‌اندازی ---------- */
  function showError(err) {
    console.error(err);
    $('#loader').classList.add('done');
    $('#main').insertAdjacentHTML('afterbegin', `
      <div class="error-box wrap">
        <h2>داده‌ها بارگذاری نشد</h2>
        <p>اگر فایل index.html را مستقیم در مرورگر باز کرده‌اید، مرورگر خواندن فایل‌های JSON را مسدود می‌کند. در پوشه‌ی پروژه این دستور را اجرا کنید و آدرس زیر را باز کنید:</p>
        <p><code>python3 -m http.server 8000</code> ← <code>http://localhost:8000</code></p>
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
