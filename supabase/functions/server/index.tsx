import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Avoid logging request/headers/body to prevent leaking sensitive data.
// If debugging is needed, enable locally with a safer logger.
// app.use("*", logger(console.log));



app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check
app.get("/make-server-58594942/health", (c) => {
  return c.json({ status: "ok" });
});

/* ─── مفاتيح KV ──────────────────────────────────────────────────── */
const KV_KEY_CALLCENTER = "password:callcenter";
const KV_KEY_ADMIN      = "password:admin";
const KV_VERSION_KEY    = "password:version";
const CURRENT_VERSION   = "v3";

/* ─── إعدادات Rate Limiting على السيرفر ──────────────────────────── */
const MAX_SERVER_ATTEMPTS = 10;         // محاولات مسموحة
const SERVER_LOCKOUT_MS   = 10 * 60 * 1000; // قفل 10 دقائق

function rateLimitKey(ip: string, type: string) {
  return `ratelimit:${type}:${ip}`;
}
function rateLimitTsKey(ip: string, type: string) {
  return `ratelimit_ts:${type}:${ip}`;
}

/** تنظيف مفتاح IP من الهيدرز */
function getClientIP(c: any): string {
  return (
    c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ||
    c.req.header("cf-connecting-ip") ||
    "unknown"
  );
}

/**
 * تهيئة كلمات السر عند بدء السيرفر.
 * يستخدم نظام الإصدارات لتحديث الكلمات فقط عند الحاجة.
 */
async function initPasswords() {
  try {
    const storedVersion = await kv.get(KV_VERSION_KEY);
    if (storedVersion !== CURRENT_VERSION) {
      // Initialize passwords from environment variables if provided.
      // This prevents hard-coded secrets in the deployed function.
      const callcenterInit = (globalThis as any).Deno?.env?.get("CALLCENTER_INIT_PASSWORD") ?? null;
      const adminInit      = (globalThis as any).Deno?.env?.get("ADMIN_INIT_PASSWORD") ?? null;

      // If env vars are not set, do not overwrite existing KV values.
      // This avoids locking everyone out on deploy.
      if (!callcenterInit || !adminInit) {
        console.log("⚠️ env vars غير موجودة — لن يتم overwrite لكلمات السر.");
        return;
      }

      await kv.set(KV_KEY_CALLCENTER, callcenterInit);
      await kv.set(KV_KEY_ADMIN,      adminInit);
      await kv.set(KV_VERSION_KEY,    CURRENT_VERSION);
      console.log("✅ تم تحديث كلمات السر — الإصدار:", CURRENT_VERSION);
    } else {
      console.log("✅ كلمات السر محدّثة — الإصدار:", CURRENT_VERSION);
    }

  } catch (err) {
    console.log("❌ خطأ في تهيئة كلمات السر:", err);
  }
}

initPasswords();

/* ─── نقطة التحقق من كلمة السر ─────────────────────────────────── */
app.post("/make-server-58594942/verify-password", async (c) => {
  try {
    const body = await c.req.json();
    const { type, password } = body;

    if (!type || !password || typeof type !== "string" || typeof password !== "string") {
      return c.json({ valid: false, error: "بيانات ناقصة أو غير صحيحة" }, 400);
    }

    if (!["callcenter", "admin"].includes(type)) {
      return c.json({ valid: false, error: "نوع غير مسموح" }, 400);
    }

    /* ─── Rate Limiting ─── */
    const ip       = getClientIP(c);
    const rlKey    = rateLimitKey(ip, type);
    const rlTsKey  = rateLimitTsKey(ip, type);

    const rawAttempts  = await kv.get(rlKey);
    const rawTimestamp = await kv.get(rlTsKey);
    const attempts     = rawAttempts ? parseInt(rawAttempts as string, 10) : 0;
    const lockStart    = rawTimestamp ? parseInt(rawTimestamp as string, 10) : 0;
    const now          = Date.now();

    /* هل الـ IP مقفل؟ */
    if (attempts >= MAX_SERVER_ATTEMPTS && now - lockStart < SERVER_LOCKOUT_MS) {
      const remaining = Math.ceil((SERVER_LOCKOUT_MS - (now - lockStart)) / 60000);
      console.log(`🔒 IP مقفل: ${ip} — متبقي ${remaining} دقيقة`);
      return c.json(
        { valid: false, error: `تم تجاوز الحد المسموح. حاول بعد ${remaining} دقيقة.`, locked: true },
        429
      );
    }

    /* إعادة تعيين العداد إذا انتهت مدة القفل */
    if (attempts >= MAX_SERVER_ATTEMPTS && now - lockStart >= SERVER_LOCKOUT_MS) {
      await kv.set(rlKey, "0");
      await kv.set(rlTsKey, "0");
    }

    /* ─── التحقق من كلمة السر ─── */
    const kvKey        = type === "callcenter" ? KV_KEY_CALLCENTER : KV_KEY_ADMIN;
    const storedPassword = await kv.get(kvKey);

    if (!storedPassword) {
      console.log(`❌ كلمة السر غير موجودة في KV: ${kvKey}`);
      return c.json({ valid: false, error: "خطأ في النظام" }, 500);
    }

    const isValid = password === storedPassword;

    if (isValid) {
      /* نجاح — إعادة تعيين العداد */
      await kv.set(rlKey, "0");
      await kv.set(rlTsKey, "0");
      console.log(`✅ دخول ناجح — النوع: ${type} — IP: ${ip}`);
    } else {
      /* فشل — زيادة العداد */
      const newAttempts = (attempts >= MAX_SERVER_ATTEMPTS ? 1 : attempts + 1);
      await kv.set(rlKey, String(newAttempts));
      if (newAttempts === 1 || attempts === 0) {
        await kv.set(rlTsKey, String(now));
      }
      if (newAttempts >= MAX_SERVER_ATTEMPTS) {
        await kv.set(rlTsKey, String(now)); /* بدء ساعة القفل */
        console.log(`🔒 تم قفل IP: ${ip} — تجاوز ${MAX_SERVER_ATTEMPTS} محاولات`);
      }
      console.log(`❌ كلمة سر خاطئة — النوع: ${type} — المحاولة: ${newAttempts}/${MAX_SERVER_ATTEMPTS} — IP: ${ip}`);
    }

    return c.json({ valid: isValid });
  } catch (err) {
    console.log("❌ خطأ في التحقق:", err);
    return c.json({ valid: false, error: String(err) }, 500);
  }
});

/* ─── تحديث كلمة السر (للأدمن فقط) ─────────────────────────────── */
app.post("/make-server-58594942/update-password", async (c) => {
  try {
    const body = await c.req.json();
    const { type, newPassword, adminPassword } = body;

    if (!type || !newPassword || !adminPassword) {
      return c.json({ success: false, error: "بيانات ناقصة" }, 400);
    }

    if (!["callcenter", "admin"].includes(type)) {
      return c.json({ success: false, error: "نوع غير مسموح" }, 400);
    }

    if (typeof newPassword !== "string" || newPassword.length < 6) {
      return c.json({ success: false, error: "كلمة السر الجديدة قصيرة جداً (6 أحرف على الأقل)" }, 400);
    }

    const storedAdminPass = await kv.get(KV_KEY_ADMIN);
    if (!storedAdminPass || adminPassword !== storedAdminPass) {
      return c.json({ success: false, error: "كلمة سر الأدمن غير صحيحة" }, 401);
    }

    const kvKey = type === "callcenter" ? KV_KEY_CALLCENTER : KV_KEY_ADMIN;
    await kv.set(kvKey, newPassword);

    console.log(`✅ تم تحديث كلمة سر "${type}" بنجاح`);
    return c.json({ success: true });
  } catch (err) {
    console.log("❌ خطأ في تحديث كلمة السر:", err);
    return c.json({ success: false, error: String(err) }, 500);
  }
});

Deno.serve(app.fetch);
