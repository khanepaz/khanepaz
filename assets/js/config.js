/* ==========================================================
   خانه‌پز | تنظیمات
   ----------------------------------------------------------
   mode: 'json'  → داده‌ها از پوشه‌ی data/ خوانده می‌شوند
                   (مناسب گیت‌هاب پیج‌ها، بدون سرور)
   mode: 'api'   → داده‌ها از یک سرور خوانده می‌شوند
                   GET  {apiBase}/recipes
                   GET  {apiBase}/categories ...
                   POST {apiBase}/comments
   برای رفتن به سرور فقط همین‌جا mode را عوض کنید.
   ========================================================== */
window.KHANEPAZ_CONFIG = {
  mode: 'json',
  dataPath: 'data/',
  apiBase: '/api',
  commentsStorageKey: 'khanepaz_local_comments_v1',
  latestCount: 8,
  bestCount: 6,
  browsePageSize: 9
};
