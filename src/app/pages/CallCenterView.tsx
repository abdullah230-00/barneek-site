import { useState, useEffect } from "react";
import { Navigation } from "../components/Navigation";
import { TicketTable } from "../components/TicketTable";
import { BaggageInfo } from "../components/BaggageInfo";
import { ticketStoreSupabase as ticketStore } from "../data/ticketStoreSupabase";
import { TicketPrice } from "../types";
import { Input } from "../components/ui/input";
import { Search, Copy } from "lucide-react";
import { toast } from "sonner";
import logoImage from "../../imports/image-1.png";

/** نسخ نص بطريقة موثوقة مع fallback كامل */
async function copyText(text: string, successMsg: string) {
  if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(successMsg);
      return;
    } catch (_e) {
      // نكمل إلى الـ fallback
    }
  }
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.cssText =
      "position:fixed;top:-9999px;left:-9999px;opacity:0;pointer-events:none;";
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);
    const success = document.execCommand("copy");
    document.body.removeChild(textarea);
    if (success) {
      toast.success(successMsg);
    } else {
      toast.error("❌ فشل النسخ، حاول مرة أخرى");
    }
  } catch (_e2) {
    toast.error("❌ فشل النسخ، حاول مرة أخرى");
  }
}

export function CallCenterView() {
  const [tickets, setTickets] = useState<TicketPrice[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDestination, setSelectedDestination] = useState("");
  const [loading, setLoading] = useState(true);

  const loadTickets = async () => {
    try {
      const data = await ticketStore.getAll();
      setTickets(data);
    } catch (err: any) {
      console.error("خطأ في جلب التذاكر:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
    const interval = setInterval(loadTickets, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.departure.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.return.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDestination = selectedDestination
      ? ticket.destination.includes(selectedDestination)
      : true;

    return matchesSearch && matchesDestination;
  });

  const copyContactInfo = () => {
    const text = `للحجز والاستفسار - برنيق للطيران:\n0922009955\n0912009955\n\nخدمة برق:\nبنغازي: 0922259955\nمصراتة: 0912279955\nطرابلس: 0912269955`;
    copyText(text, "✅ تم نسخ معلومات التواصل");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-50" dir="rtl">
      <Navigation
        onDestinationFilter={setSelectedDestination}
        selectedDestination={selectedDestination}
      />

      <div className="md:mr-80 lg:mr-96 p-4 md:p-8 lg:p-12 pt-20 md:pt-12">
        <div className="max-w-7xl mx-auto">

          {/* العنوان */}
          <div className="text-center mb-6 md:mb-8">

            {/* لوقو الشركة — موبايل وتابلت فقط */}
            <div className="md:hidden flex justify-center mb-4">
              <img
                src={logoImage}
                alt="شركة برنيق للطيران"
                className="h-16 w-auto object-contain drop-shadow-md"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
            </div>

            <div className="inline-block bg-gradient-to-r from-[#AD1457] to-[#C2185B] text-white px-6 md:px-12 py-4 md:py-6 rounded-2xl md:rounded-3xl shadow-2xl mb-4 md:mb-6">
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-1 md:mb-2">
                كول سنتر - عرض الأسعار
              </h1>
            </div>
            <p className="text-lg md:text-2xl text-[#AD1457]/70 font-medium mb-4 md:mb-8 px-4">
              البحث والاستعلام عن أسعار التذاكر
            </p>

            {/* خانة البحث */}
            <div className="max-w-xl mx-auto mb-6 md:mb-8 px-4">
              <div className="relative">
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#AD1457] size-5 md:size-6" />
                <Input
                  type="text"
                  placeholder="ابحث عن وجهة أو تاريخ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-12 h-12 md:h-14 text-base md:text-lg border-2 border-[#AD1457] focus:ring-2 focus:ring-[#AD1457] rounded-xl shadow-lg font-medium bg-white"
                />
              </div>
            </div>

            {/* عرض الفلتر المحدد */}
            {selectedDestination && (
              <div className="mb-4 md:mb-6 px-4">
                <div className="inline-flex items-center bg-[#AD1457] text-white px-4 md:px-6 py-2 md:py-3 rounded-full shadow-lg">
                  <span className="text-base md:text-lg font-bold">
                    الوجهة المحددة: {selectedDestination}
                  </span>
                  <button
                    onClick={() => setSelectedDestination("")}
                    className="mr-2 md:mr-3 bg-white text-[#AD1457] rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center hover:bg-pink-100 transition-colors text-sm"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* الجدول مع نسخ */}
          <div className="px-2 md:px-0">
            {loading ? (
              <div className="text-center py-16 text-[#AD1457] text-xl font-bold">
                <div className="animate-spin inline-block w-8 h-8 border-4 border-[#AD1457] border-t-transparent rounded-full mb-4"></div>
                <p>جاري تحميل البيانات...</p>
              </div>
            ) : (
              <TicketTable tickets={filteredTickets} showCopyButton={true} />
            )}
          </div>

          {/* إرشادات الأمتعة مع نسخ */}
          <BaggageInfo showCopyButton={true} />

          {/* قسم التواصل مع نسخ */}
          <div className="mt-6 md:mt-8 mx-2 md:mx-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* للحجز والاستفسار */}
              <div className="bg-white border-2 border-[#AD1457] rounded-xl p-4 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[#AD1457] font-bold text-base md:text-lg">
                    📞 للحجز والاستفسار
                  </h3>
                  <button
                    onClick={copyContactInfo}
                    type="button"
                    className="flex items-center gap-1 bg-[#AD1457] hover:bg-[#8E1144] active:bg-[#6D0D38] text-white rounded-lg px-2 py-1 text-xs transition-all cursor-pointer"
                    title="نسخ أرقام التواصل"
                  >
                    <Copy className="size-3" />
                    <span>نسخ الكل</span>
                  </button>
                </div>
                <p className="text-gray-600 text-xs text-center mb-3">
                  خدمة العملاء - برنيق للطيران
                </p>
                <div className="flex flex-col gap-2">
                  {[
                    { phone: "0922009955" },
                    { phone: "0912009955" },
                  ].map((item) => (
                    <div key={item.phone} className="flex items-center justify-between bg-pink-50 rounded-xl px-3 py-2.5">
                      <span className="font-bold text-gray-800 text-base md:text-lg" dir="ltr">{item.phone}</span>
                      <button
                        type="button"
                        onClick={() => copyText(item.phone, "✅ تم نسخ الرقم")}
                        className="text-[#AD1457] hover:text-[#8E1144] transition-colors cursor-pointer p-1"
                        title="نسخ الرقم"
                      >
                        <Copy className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* خدمة برق */}
              <div className="bg-gradient-to-br from-[#AD1457] to-[#C2185B] text-white rounded-xl p-4 shadow-lg">
                <h3 className="font-bold text-base md:text-lg mb-1 flex items-center gap-2">
                  <span>⚡</span> خدمة برق
                </h3>
                <p className="text-white/80 text-xs mb-3 leading-relaxed">
                  استلام الحقائب من المنزل وإصدار كروت الصعود مسبقاً
                </p>
                <div className="space-y-2">
                  {[
                    { city: "بنغازي", phone: "0922259955" },
                    { city: "مصراتة", phone: "0912279955" },
                    { city: "طرابلس", phone: "0912269955" },
                  ].map((item) => (
                    <div key={item.city} className="flex items-center justify-between bg-white/15 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{item.city}:</span>
                        <span className="font-bold text-sm" dir="ltr">{item.phone}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyText(item.phone, `✅ تم نسخ رقم ${item.city}`)}
                        className="text-white/70 hover:text-white transition-colors cursor-pointer p-1"
                        title="نسخ الرقم"
                      >
                        <Copy className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* ملاحظة الكول سنتر */}
            <div className="mt-4 bg-white border-2 border-[#AD1457] rounded-xl p-4 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-[#AD1457] text-white rounded-full w-7 h-7 flex items-center justify-center text-sm">⚠</span>
                <h3 className="text-[#AD1457] font-bold text-base md:text-lg">ملاحظة للكول سنتر:</h3>
              </div>
              <p className="text-[#AD1457]/80 text-sm md:text-base">
                هذه الواجهة للعرض والاستعلام فقط. استخدم أزرار{" "}
                <span className="font-bold">📋 النسخ</span> في كل صف وبطاقة لنسخ البيانات بسرعة.
                للتعديل على الأسعار، استخدم واجهة الأدمن.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}