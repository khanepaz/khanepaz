/* خانه‌پز admin loader */
(async () => {
  const parts = ['admin-p0.js', 'admin-p1.js', 'admin-p2.js', 'admin-p3.js'];
  const base = document.currentScript.src.replace(/admin\.js$/, '');
  let code = '';
  for (const p of parts) {
    const res = await fetch(base + p, { cache: 'no-cache' });
    if (!res.ok) throw new Error('بارگذاری ' + p + ' ناموفق');
    code += await res.text();
  }
  const s = document.createElement('script');
  s.textContent = code;
  document.body.appendChild(s);
})().catch(e => {
  console.error(e);
  alert('خطا در بارگذاری پنل مدیریت: ' + e.message);
});
