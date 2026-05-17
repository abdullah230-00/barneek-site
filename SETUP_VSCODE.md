# دليل نقل مشروع برنيق للطيران إلى VSCode
## خطوة بخطوة — نسخة محدّثة

---

## 📋 البرامج المطلوبة على جهازك

ثبّت هذه البرامج قبل البدء:

| البرنامج | الإصدار المطلوب | رابط التحميل |
|----------|----------------|--------------|
| Node.js  | 18 أو أحدث     | https://nodejs.org |
| pnpm     | أي إصدار       | `npm install -g pnpm` |
| VSCode   | أي إصدار       | https://code.visualstudio.com |

**للتحقق من التثبيت** — افتح Terminal وأكتب:
```bash
node --version    # يجب أن يظهر v18 أو أعلى
pnpm --version    # يجب أن يظهر رقم الإصدار
```

---

## 🚀 خطوات النقل

### الخطوة 1 — تنزيل ملفات المشروع

1. في Figma Make، ابحث عن زر **"Download"** أو **"Export to ZIP"**
2. نزّل الملف المضغوط (.zip)
3. فك ضغطه في مجلد على جهازك، مثل:
   - ويندوز: `C:\Projects\barneek-airlines\`
   - ماك / لينكس: `~/Projects/barneek-airlines/`

---

### الخطوة 2 — فتح المشروع في VSCode

1. ا��تح VSCode
2. اضغط **File → Open Folder**
3. اختر المجلد الذي فككت فيه الملفات
4. اضغط **Select Folder** (أو Open على ماك)

---

### الخطوة 3 — فتح Terminal داخل VSCode

اضغط: **Terminal → New Terminal**  
أو: `` Ctrl + ` `` (ويندوز/لينكس) أو `` Cmd + ` `` (ماك)

---

### الخطوة 4 — تثبيت المكتبات

في Terminal اكتب:

```bash
pnpm install
```

> قد يستغرق دقيقة أو أكثر في أول مرة. انتظر حتى تظهر رسالة النجاح.

---

### الخطوة 5 — إضافة ملف معلومات Supabase

المشروع يحتاج ملف `/utils/supabase/info.tsx` يحتوي على بيانات مشروع Supabase.

أنشئ المجلد والملف يدوياً:

```
utils/
└── supabase/
    └── info.tsx
```

**محتوى الملف** (استبدل القيم بقيم مشروعك):

```typescript
export const projectId  = "ilcbluyhkljehkcgqfjm";
export const publicAnonKey = "sb_publishable_3SouOOm3tvSi_dfzgH9YIw_1VLuki-r";
```

> ⚠️ هذه القيم موجودة في مشروع Supabase الحالي.  
> إذا أردت مشروع Supabase جديد، استبدلها بقيم من **Settings → API** في Supabase.

---

### الخطوة 6 — إعداد متغيرات Supabase للسيرفر

السيرفر (في `supabase/functions/server/`) يحتاج متغيرات بيئية.  
في بيئة Figma Make هذه المتغيرات موجودة تلقائياً، لكن محلياً تحتاجها.

أنشئ ملف `.env.local` في جذر المشروع:

```env
SUPABASE_URL=https://ilcbluyhkljehkcgqfjm.supabase.co
SUPABASE_ANON_KEY=sb_publishable_3SouOOm3tvSi_dfzgH9YIw_1VLuki-r
```

---

### الخطوة 7 — إنشاء جدول قاعدة البيانات

اذهب إلى [Supabase Dashboard](https://supabase.com/dashboard) → مشروعك → **SQL Editor**، ثم نفّذ:

```sql
create table if not exists ticket_prices (
  id uuid default gen_random_uuid() primary key,
  destination text not null default '',
  departure   text not null default '',
  return_date text not null default '',
  adult_price text not null default '',
  child_price text not null default '',
  created_at  timestamptz default now()
);

alter table ticket_prices enable row level security;

create policy "allow_all" on ticket_prices
  for all using (true) with check (true);
```

> إذا كان الجدول موجوداً بالفعل من Figma Make، تجاهل هذه الخطوة.

---

### الخطوة 8 — إضافة صورة برق (اختياري)

إذا كان لديك ملف صورة برق، ضعه في:

```
public/
└── barq-logo.png
```

> إذا لم تضعه، سيظهر مكوّن جميل بديل يعرض ⚡ برق تلقائياً.

---

### الخطوة 9 — تشغيل الموقع محلياً

```bash
pnpm dev
```

افتح المتصفح على: **http://localhost:5173**

---

### الخطوة 10 — بناء نسخة الإنتاج (عند الرفع للاستضافة)

```bash
pnpm build
```

ملفات النشر ستكون في مجلد `dist/`

---

## 🔑 كلمات السر (محفوظة في Supabase KV)

> ⚠️ كلمات السر لا تُكتَب في الكود، بل تُحفظ في قاعدة بيانات Supabase تلقائياً عند تشغيل السيرفر أول مرة.

| الواجهة   | كلمة السر           |
|-----------|---------------------|
| كول سنتر  | `callcenter20@99`   |
| أدمن      | `abdullah@barq@20@10` |

---

## 📁 هيكل ملفات المشروع

```
barneek-airlines/
│
├── public/
│   └── barq-logo.png                 ← شعار خدمة برق (اختياري)
│
├── utils/
│   └── supabase/
│       └── info.tsx                  ← بيانات الاتصال بـ Supabase ⚠️
│
├── supabase/
│   └── functions/
│       └── server/
│           ├── index.tsx             ← السيرفر (Hono + Deno)
│           └── kv_store.tsx          ← التخزين المفتاحي (لا تعدّله)
│
├── src/
│   ├── app/
│   │   ├── App.tsx                   ← نقطة بدء التطبيق
│   │   ├── routes.tsx                ← إعداد المسارات (/, /call-center, /admin)
│   │   ├── types.ts                  ← تعريفات TypeScript
│   │   │
│   │   ├── components/
│   │   │   ├── BaggageInfo.tsx       ← إرشادات الأوزان + خدمة برق
│   │   │   ├── Navigation.tsx        ← القائمة الجانبية + كلمات السر
│   │   │   ├── TicketFormDialog.tsx  ← نموذج إضافة/تعديل التذاكر
│   │   │   └── TicketTable.tsx       ← جدول عرض الأسعار
│   │   │
│   │   ├── data/
│   │   │   └── ticketStoreSupabase.ts  ← CRUD مع جدول ticket_prices
│   │   │
│   │   ├── lib/
│   │   │   └── supabaseClient.ts     ← إنشاء عميل Supabase
│   │   │
│   │   └── pages/
│   │       ├── PublicView.tsx        ← الواجهة العامة (قراءة فقط)
│   │       ├── CallCenterView.tsx    ← كول سنتر (قراءة + نسخ)
│   │       └── AdminView.tsx         ← أدمن (إضافة + تعديل + حذف)
│   │
│   └── styles/
│       ├── theme.css                 ← متغيرات الألوان (#AD1457)
│       └── fonts.css                 ← استيراد الخطوط
│
├── package.json                      ← قائمة المكتبات
├── vite.config.ts                    ← إعداد Vite
└── SETUP_VSCODE.md                   ← هذا الملف
```

---

## 🛠️ إضافات VSCode الموصى بها

اضغط `Ctrl+Shift+X` وابحث عن:

1. **ES7+ React/Redux/React-Native snippets** — اختصارات React
2. **Tailwind CSS IntelliSense** — إكمال تلقائي لـ Tailwind
3. **Prettier - Code formatter** — تنسيق الكود تلقائياً
4. **Error Lens** — عرض الأخطاء في السطر مباشرة

---

## 🔗 المسارات في الموقع

| المسار | الواجهة | كلمة السر |
|--------|---------|-----------|
| `/` | عام — عرض الأسعار فقط | لا تحتاج |
| `/call-center` | كول سنتر — عرض + نسخ | `callcenter20@99` |
| `/admin` | أدمن — إضافة + تعديل + حذف | `abdullah@barq@20@10` |

---

## ❓ مشاكل شائعة وحلولها

| المشكلة | السبب المحتمل | الحل |
|---------|--------------|------|
| `pnpm: command not found` | pnpm غير مثبت | `npm install -g pnpm` |
| `Cannot find module '/utils/supabase/info'` | الملف غير موجود | أنشئ `utils/supabase/info.tsx` |
| البيانات لا تظهر | الجدول غير منشأ أو خطأ في المفاتيح | راجع الخطوتين 5 و7 |
| كلمة السر لا تعمل | السيرفر لم يُشغَّل بعد | شغّل السيرفر Supabase Edge Function |
| `Port 5173 is in use` | المنفذ مشغول | `pnpm dev --port 3000` |
| الصورة لا تظهر | الملف غير موجود في `public/` | ضع `barq-logo.png` في مجلد `public/` أو اتركه ويظهر البديل التلقائي |

---

## ℹ️ ملاحظات مهمة

- **السيرفر** (`supabase/functions/server/index.tsx`) يعمل كـ **Supabase Edge Function** وليس محلياً.  
  للتشغيل المحلي الكامل تحتاج [Supabase CLI](https://supabase.com/docs/guides/cli).
- **كلمات السر** تُحفظ في جدول `kv_store` في Supabase تلقائياً عند أول تشغيل للسيرفر.
- **لا يوجد تخزين محلي** — كل البيانات في Supabase فقط.

---

*تم تطوير الموقع من قبل إدارة الدعم والتواصل — برنيق للطيران*
