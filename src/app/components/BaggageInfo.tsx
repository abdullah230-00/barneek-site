import { Copy, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

interface BaggageInfoProps {
  showCopyButton?: boolean;
}

/* ─── بيانات الدرجات ──────────────────────────────────────────────── */
const BAGGAGE_CLASSES = [
  {
    code: "C",
    name: "الدرجة الأولى",
    icon: "✈️",
    bags: "حقيبتان × 23KG",
    handbag: "حقيبة يد 7KG",
    detail:
      "مسموح لكل مسافر بحقيبتين كل حقيبة 23KG وحقيبة يد على متن الطائرة لا تتعدى 7KG",
  },
  {
    code: "Y",
    name: "الدرجة السياحية",
    icon: "🌟",
    bags: "حقيبتان × 23KG",
    handbag: "حقيبة يد 7KG",
    detail:
      "مسموح لكل مسافر بحقيبتين كل حقيبة 23KG وحقيبة يد على متن الطائرة لا تتعدى 7KG",
  },
  {
    code: "B",
    name: "الدرجة الاقتصادية",
    icon: "💼",
    bags: "حقيبة واحدة 23KG",
    handbag: "حقيبة يد 7KG",
    detail:
      "مسموح بحقيبة واحدة وزنها 23KG وحقيبة يد على متن الطائرة لا تتعدى 7KG",
  },
  {
    code: "K",
    name: "الدرجة المخفضة",
    icon: "🎫",
    bags: "حقيبة واحدة 23KG",
    handbag: "حقيبة يد 7KG",
    detail:
      "مسموح بحقيبة واحدة وزنها 23KG وحقيبة يد على متن الطائرة لا تتعدى 7KG",
  },
  {
    code: "R",
    name: "الدرجة المخفضة",
    icon: "🏷️",
    bags: "حقيبة واحدة 18KG",
    handbag: "حقيبة يد 7KG",
    detail:
      "مسموح بحقيبة واحدة وزنها 18KG وحقيبة يد على متن الطائرة لا تتعدى 7KG",
  },
];

const BARAK_INFO_FULL = `⚡ خدمة برق ⚡

خدمة مخصصة لاستلام الحقائب من أمام منزلكم وإصدار كروت الصعود قبل موعد الرحلة بـ 24 ساعة.
على المسافر الحضور للمطار قبل الرحلة بساعة ونصف بدلاً من ثلاث ساعات.

للاستفسار:
بنغازي: 0922259955
مصراتة: 0912279955
طرابلس: 0912269955`;

const ARRIVAL_NOTE_FULL = `موعد الحضور : يرجى الحضور قبل موعد الرحلة ب3 ساعات
نتمنى لكم رحلة موفقة ومتيسرة بإذن الرحمن`;

/* ─── دالة النسخ الموثوقة ──────────────────────────���───────────────── */
async function copyText(text: string, successMsg: string) {
  if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(successMsg);
      return;
    } catch (_e) {
      // fallback
    }
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.cssText =
      "position:fixed;top:-9999px;left:-9999px;opacity:0;pointer-events:none;";
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, ta.value.length);
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    if (ok) {
      toast.success(successMsg);
    } else {
      toast.error("❌ فشل النسخ، حاول مرة أخرى");
    }
  } catch (_e2) {
    toast.error("❌ فشل النسخ، حاول مرة أخرى");
  }
}

/* ─── زر النسخ مع تأثير التأكيد ──────────────────────────────────── */
function CopyButton({
  text,
  successMsg,
  label = "نسخ",
  large = false,
}: {
  text: string;
  successMsg: string;
  label?: string;
  large?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handle = async () => {
    await copyText(text, successMsg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (large) {
    return (
      <button
        type="button"
        onClick={handle}
        className="flex items-center gap-2 bg-[#AD1457] hover:bg-[#8E1144] active:bg-[#6D0D38] text-white rounded-xl px-4 py-2 font-bold shadow-lg transition-all cursor-pointer select-none"
      >
        {copied ? (
          <CheckCheck className="size-4 text-green-300" />
        ) : (
          <Copy className="size-4" />
        )}
        <span>{copied ? "تم النسخ ✓" : label}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handle}
      className="flex items-center gap-1 bg-[#AD1457] hover:bg-[#8E1144] active:bg-[#6D0D38] text-white rounded-lg px-2 py-1 text-xs font-bold shadow transition-all flex-shrink-0 cursor-pointer select-none"
    >
      {copied ? (
        <CheckCheck className="size-3 text-green-300" />
      ) : (
        <Copy className="size-3" />
      )}
      <span>{copied ? "✓" : label}</span>
    </button>
  );
}

/* ─── مكوّن صورة برق: يعرض الصورة إن وُجدت وإلا يعرض مكوّن جميل ─── */
function BarqLogoDisplay() {
  const [imgState, setImgState] = useState<"loading" | "loaded" | "failed">("loading");
  const [pathIdx, setPathIdx] = useState(0);

  // مسارات متعددة نجربها بالترتيب
  const paths = [
    `${import.meta.env.BASE_URL}barq-logo.png`,
    "/barq-logo.png",
    "barq-logo.png",
    `${window.location.origin}/barq-logo.png`,
  ];

  const handleError = () => {
    const next = pathIdx + 1;
    if (next < paths.length) {
      setPathIdx(next);
    } else {
      setImgState("failed");
    }
  };

  // المكوّن الجميل عند الفشل أو أثناء التحميل
  const StyledFallback = () => (
    <div className="w-48 md:w-64 lg:w-72 flex flex-col items-center justify-center bg-gradient-to-br from-[#AD1457] via-[#C2185B] to-[#8E1144] rounded-2xl shadow-xl p-6 md:p-8">
      {/* أيقونة البرق */}
      <div className="flex items-center justify-center w-20 h-20 md:w-24 md:h-24 bg-white/20 rounded-full mb-4">
        <span className="text-5xl md:text-6xl">⚡</span>
      </div>
      {/* اسم الخدمة */}
      <div className="text-center">
        <p className="text-white font-bold text-3xl md:text-4xl tracking-wider mb-1">
          بَـرق
        </p>
        <div className="h-0.5 bg-white/40 rounded-full w-full mb-2" />
        <p className="text-white/90 text-sm md:text-base font-medium">
          خدمة برنيق للطيران
        </p>
        <p className="text-white/70 text-xs mt-1">Barneek Fast Service</p>
      </div>
    </div>
  );

  if (imgState === "failed") {
    return <StyledFallback />;
  }

  return (
    <div className="relative w-48 md:w-64 lg:w-80">
      {/* المكوّن الجميل يظهر دائماً خلف الصورة */}
      <div
        className={`transition-opacity duration-300 ${
          imgState === "loaded" ? "opacity-0 absolute inset-0" : "opacity-100"
        }`}
      >
        <StyledFallback />
      </div>

      {/* الصورة الحقيقية تظهر عند تحميلها */}
      <img
        key={pathIdx}
        src={paths[pathIdx]}
        alt="خدمة برق"
        className={`object-contain rounded-xl shadow-lg transition-opacity duration-300 ${
          imgState === "loaded"
            ? "opacity-100 w-full h-auto"
            : "opacity-0 absolute inset-0 w-0 h-0"
        }`}
        onLoad={() => setImgState("loaded")}
        onError={handleError}
      />
    </div>
  );
}

/* ─── المكوّن الرئيسي ──────────────────────────────────────────────── */
export function BaggageInfo({ showCopyButton = false }: BaggageInfoProps) {
  return (
    <div
      className={`mt-6 md:mt-8 mx-2 md:mx-0 space-y-4 ${
        !showCopyButton ? "select-none" : ""
      }`}
    >
      {/* عنوان القسم */}
      <div className="bg-gradient-to-r from-[#AD1457] to-[#C2185B] text-white rounded-2xl p-4 md:p-6 shadow-xl">
        <h2 className="text-xl md:text-2xl font-bold text-center mb-1">
          🧳 إرشادات الأوزان والدرجات
        </h2>
        <p className="text-center text-white/80 text-sm md:text-base">
          الحقيبة يجب ألا تتعدى{" "}
          <span className="font-bold text-yellow-300">30KG</span> كحدٍّ أقصى
        </p>
      </div>

      {/* بطاقات الدرجات + موعد الحضور */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {BAGGAGE_CLASSES.map((cls) => (
          <div
            key={cls.code}
            className="bg-white border-2 border-[#AD1457] rounded-xl p-4 md:p-5 shadow-lg"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{cls.icon}</span>
                <div className="flex items-center gap-2">
                  <span className="bg-[#AD1457] text-white font-bold px-2 py-0.5 rounded-lg text-sm">
                    {cls.code}
                  </span>
                  <span className="font-bold text-sm md:text-base text-[#AD1457]">
                    {cls.name}
                  </span>
                </div>
              </div>
              {showCopyButton && (
                <CopyButton
                  text={`${cls.name} (${cls.code}): ${cls.detail}\nالحقيبة يجب ألا تتعدى 30 kg كحد أقصى`}
                  successMsg={`✅ تم نسخ ${cls.name}`}
                />
              )}
            </div>
            <div className="space-y-2 text-sm md:text-base">
              <div className="flex items-center gap-2 bg-pink-50 rounded-lg px-3 py-2">
                <span>🧳</span>
                <span className="font-medium text-gray-800">{cls.bags}</span>
              </div>
              <div className="flex items-center gap-2 bg-pink-50 rounded-lg px-3 py-2">
                <span>👜</span>
                <span className="font-medium text-gray-800">{cls.handbag}</span>
              </div>
            </div>
          </div>
        ))}

        {/* بطاقة موعد الحضور */}
        <div className="bg-gradient-to-br from-pink-50 to-white border-2 border-[#AD1457] rounded-xl p-4 md:p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🕐</span>
                <h3 className="text-[#AD1457] font-bold text-sm md:text-base">
                  موعد الحضور
                </h3>
              </div>
              {showCopyButton && (
                <CopyButton
                  text={ARRIVAL_NOTE_FULL}
                  successMsg="✅ تم نسخ ملاحظة الحضور بالكامل"
                />
              )}
            </div>
            <div className="bg-[#AD1457]/10 border border-[#AD1457]/30 rounded-lg px-3 py-2 mb-3">
              <p className="text-gray-800 text-xs md:text-sm font-bold text-center">
                ⏰ يرجى الحضور قبل موعد الرحلة بـ
                <span className="text-[#AD1457] text-base md:text-lg block mt-1">
                  3 ساعات
                </span>
              </p>
            </div>
          </div>
          <div className="bg-gradient-to-r from-[#AD1457] to-[#C2185B] text-white rounded-lg p-2.5 text-center">
            <p className="text-xs md:text-sm font-bold">
              نتمنى لكم رحلة موفقة 🤲
            </p>
          </div>
        </div>
      </div>

      {/* ─── قسم خدمة برق الكامل ─────────────────────────────────────── */}
      <div className="bg-white border-2 border-[#AD1457] rounded-2xl p-5 md:p-8 shadow-2xl">
        <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-10">

          {/* اللوقو / المكوّن البصري */}
          <div className="flex-shrink-0 lg:order-2 flex items-center justify-center">
            <BarqLogoDisplay />
          </div>

          {/* المحتوى النصي */}
          <div className="flex-1 lg:order-1 w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl md:text-3xl font-bold flex items-center gap-3 text-[#AD1457]">
                <span className="text-4xl">⚡</span> خدمة برق
              </h3>
              {showCopyButton && (
                <CopyButton
                  text={BARAK_INFO_FULL}
                  successMsg="✅ تم نسخ معلومات خدمة برق بالكامل"
                  label="نسخ الكل"
                  large
                />
              )}
            </div>

            <div className="bg-pink-50 rounded-xl p-4 md:p-5 mb-4 border border-[#AD1457]/30">
              <p className="text-base md:text-lg leading-relaxed mb-3 text-gray-800">
                خدمة مخصصة لاستلام الحقائب من أمام منزلكم وإصدار كروت الصعود
                قبل موعد الرحلة بـ{" "}
                <span className="font-bold text-[#AD1457] text-xl">24 ساعة</span>
              </p>
              <p className="text-base md:text-lg leading-relaxed text-gray-800">
                على المسافر الحضور للمطار قبل الرحلة بـ{" "}
                <span className="font-bold text-[#AD1457] text-xl">ساعة ونصف</span>{" "}
                بدلاً من ثلاث ساعات
              </p>
            </div>

            <div>
              <p className="text-[#AD1457] font-bold text-lg mb-3">
                📞 للاستفسار:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { city: "بنغازي", phone: "0922259955" },
                  { city: "مصراتة", phone: "0912279955" },
                  { city: "طرابلس", phone: "0912269955" },
                ].map((item) => (
                  <div
                    key={item.city}
                    className="bg-gradient-to-br from-[#AD1457] to-[#C2185B] hover:from-[#C2185B] hover:to-[#AD1457] text-white rounded-lg px-3 py-3 transition-all shadow"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className="font-bold text-sm">{item.city}</span>
                      <span className="font-bold text-base md:text-lg" dir="ltr">
                        {item.phone}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}