/* khanepaz admin loader */
(async () => {
  const parts = ['admin-p0.js', 'admin-p1.js'];
  const base = document.currentScript.src.replace(/admin\.js$/, '');
  let code = '';
  for (const p of parts) {
    const res = await fetch(base + p + '?t=' + Date.now(), { cache: 'no-cache' });
    if (!res.ok) throw new Error('load failed: ' + p);
    code += await res.text();
  }
  const s = document.createElement('script');
  s.textContent = code;
  document.body.appendChild(s);
})().catch(e => {
  console.error(e);
  alert('خطا در بارگذاری پنل: ' + e.message);
});
