# خانه‌پز | khanehpaz.ir

سایت آشپزی و شیرینی‌پزی خانه‌پز. سایت کاملاً **استاتیک** است (HTML + CSS + JS) و همه‌ی محتوا از فایل‌های JSON پوشه‌ی `data/` خوانده می‌شود؛ بدون سرور روی GitHub Pages اجرا می‌شود.

**دامنه:** `khanehpaz.ir`  
**پنل مدیریت:** [admin.html](./admin.html)

## ساختار پروژه

```
khanepaz/
├─ index.html                 صفحه‌ی اصلی (نمایشگر)
├─ admin.html                 پنل مدیریت محتوا
├─ CNAME                      دامنه khanehpaz.ir برای GitHub Pages
├─ .nojekyll
├─ assets/
│  ├─ css/style.css           ظاهر سایت اصلی
│  ├─ css/admin.css           ظاهر پنل مدیریت
│  ├─ js/config.js            تنظیمات (json یا api)
│  ├─ js/api.js               لایه دسترسی به داده
│  ├─ js/app.js               منطق صفحه اصلی
│  ├─ js/admin.js             منطق پنل مدیریت
│  └─ img/                    عکس‌ها
└─ data/
   ├─ site.json               هیرو، داستان، کاروسل، لینک‌ها
   ├─ categories.json         دسته‌بندی‌ها
   ├─ recipes.json            دستورها
   ├─ tutorials.json          آموزش‌ها
   ├─ gallery.json            تصاویر
   └─ comments.json           نظرات
```

## اجرا روی کامپیوتر

```bash
cd khanepaz
python3 -m http.server 8000
# http://localhost:8000
# http://localhost:8000/admin.html
```

## انتشار روی GitHub Pages

1. شاخه `main` را در **Settings → Pages** به عنوان منبع بگذارید (folder: `/ (root)`).
2. فایل `CNAME` حاوی `khanehpaz.ir` است.
3. در DNS دامنه:
   - چهار رکورد **A** برای `@` → `185.199.108.153` ، `185.199.109.153` ، `185.199.110.153` ، `185.199.111.153`
   - یک رکورد **CNAME** برای `www` → `khanepaz.github.io`
4. در Settings → Pages دامنه سفارشی را `khanehpaz.ir` بگذارید و بعد از فعال‌شدن گواهی، **Enforce HTTPS** را بزنید.

## پنل مدیریت (`admin.html`)

بدون نتلیفای کار می‌کند. با **Personal Access Token** گیت‌هاب، فایل‌های JSON را مستقیم commit می‌کند.

### ساخت توکن

1. برو به: https://github.com/settings/tokens?type=beta
2. **Generate new token** (Fine-grained)
3. Repository access: فقط `khanepaz/khanepaz`
4. Permissions → **Contents: Read and write**
5. توکن را کپی کن (فقط یک‌بار نشان داده می‌شود) و در صفحه ورود پنل وارد کن

> نام توکن مهم نیست؛ **خود رشته‌ی توکن** (مثلاً `github_pat_...`) را باید وارد کنی، نه اسمش.

### قابلیت‌های فعلی پنل

- دستورها: افزودن / ویرایش / حذف
- دسته‌بندی‌ها: افزودن / حذف
- نظرات: حذف
- تنظیمات سایت: نام، هیرو
- ذخیره و commit به گیت‌هاب

## ویرایش دستی محتوا

فقط JSON را عوض کن. نمونه دستور جدید در `data/recipes.json`:

```json
{
  "id": "unique-english-id",
  "title": "نام دستور",
  "category": "qazvini-sweets",
  "excerpt": "توضیح کوتاه",
  "time": 60,
  "servings": 6,
  "difficulty": "آسان",
  "rating": 4.5,
  "votes": 10,
  "created": "2026-09-20",
  "featured": false,
  "tags": ["برچسب۱"],
  "art": { "emoji": "🍰", "from": "#f4c26b", "to": "#c9743a" },
  "image": "assets/img/my-photo.jpg",
  "ingredients": ["ماده ۱"],
  "steps": ["مرحله ۱"],
  "tip": "نکته"
}
```

- `category` باید یکی از `slug`های `categories.json` باشد.
- اسلایدهای کاروسل در `site.json` → `carousel` با `recipeId` به دستور وصل می‌شوند.

## ویژگی‌های سایت اصلی

ناوبری چسبان، جستجوی زنده (`/` یا `Ctrl+K`)، کاروسل، دسته‌بندی، ویژه‌ها، آموزش، گالری، نظرات، حالت شب، لینک مستقیم `#recipe=id`، چاپ دستور.
