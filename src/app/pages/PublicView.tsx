import { useState, useEffect } from "react";
import { Navigation } from "../components/Navigation";
import { TicketTable } from "../components/TicketTable";
import { BaggageInfo } from "../components/BaggageInfo";
import { ticketStoreSupabase as ticketStore } from "../data/ticketStoreSupabase";
import { TicketPrice } from "../types";
import { Input } from "../components/ui/input";
import { Search } from "lucide-react";
import logoImage from "../../imports/image-1.png";

export function PublicView() {
  const [tickets,             setTickets]             = useState<TicketPrice[]>([]);
  const [searchTerm,          setSearchTerm]          = useState("");
  const [selectedDestination, setSelectedDestination] = useState("");
  const [loading,             setLoading]             = useState(true);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-50" dir="rtl">
      <Navigation
        onDestinationFilter={setSelectedDestination}
        selectedDestination={selectedDestination}
      />

      <div className="md:mr-80 lg:mr-96 p-4 md:p-8 lg:p-12 pt-16 md:pt-12">
        <div className="max-w-7xl mx-auto">

          {/* ─── العنوان الرئيسي ─────────────────────────────────────── */}
          <div className="text-center mb-6 md:mb-8">

            {/* لوقو الشركة — يظهر على الموبايل والتابلت فقط */}
            <div className="md:hidden flex justify-center mb-2">
              <img
                src={logoImage}
                alt="شركة برنيق للطيران"
                className="h-20 w-auto object-contain drop-shadow-md"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            </div>

            {/* بطاقة العنوان */}
            <div className="inline-block bg-gradient-to-r from-[#AD1457] to-[#C2185B] text-white px-6 md:px-12 py-4 md:py-6 rounded-2xl md:rounded-3xl shadow-2xl mb-4 md:mb-6 transform hover:scale-105 transition-transform">
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-1 md:mb-2">
                أسعار تذاكر شركة برنيق للطيران
              </h1>
            </div>

            <p className="text-lg md:text-2xl text-[#AD1457]/70 font-medium mb-4 md:mb-8 px-4">
              عرض الأسعار الحالية لجميع الوجهات
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

            {/* الفلتر المحدد */}
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

          {/* ─── الجدول ─────────────────────────────────────────────── */}
          <div className="px-0 md:px-0 select-none">
            {loading ? (
              <div className="text-center py-16 text-[#AD1457] text-xl font-bold">
                <div className="animate-spin inline-block w-8 h-8 border-4 border-[#AD1457] border-t-transparent rounded-full mb-4"></div>
                <p>جاري تحميل البيانات...</p>
              </div>
            ) : (
              <TicketTable tickets={filteredTickets} />
            )}
          </div>

          {/* ─── إرشادات الأمتعة ─────────────────────────────────────── */}
          <BaggageInfo showCopyButton={false} />

          {/* ─── قسم التواصل ─────────────────────────────────────────── */}
          <div className="mt-6 md:mt-8 mx-0 select-none">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* للحجز والاستفسار */}
              <div className="bg-white border-2 border-[#AD1457] rounded-xl p-4 shadow-lg">
                <h3 className="text-[#AD1457] font-bold text-base md:text-lg mb-3 text-center">
                  📞 للحجز والاستفسار
                </h3>
                <p className="text-gray-600 text-xs md:text-sm text-center mb-3">
                  يرجى التواصل مع خدمة العملاء
                </p>
                <div className="flex flex-col gap-2">
                  <a
                    href="tel:0922009955"
                    className="bg-gradient-to-r from-[#AD1457] to-[#C2185B] text-white px-4 py-2.5 rounded-xl text-base md:text-lg font-bold shadow hover:shadow-lg transform hover:scale-105 transition-all flex items-center gap-2 justify-center"
                  >
                    <span>📞</span>
                    <span dir="ltr">0922009955</span>
                  </a>
                  <a
                    href="tel:0912009955"
                    className="bg-gradient-to-r from-[#C2185B] to-[#AD1457] text-white px-4 py-2.5 rounded-xl text-base md:text-lg font-bold shadow hover:shadow-lg transform hover:scale-105 transition-all flex items-center gap-2 justify-center"
                  >
                    <span>📞</span>
                    <span dir="ltr">0912009955</span>
                  </a>
                </div>
              </div>

              {/* خدمة برق */}
              <div className="bg-gradient-to-br from-[#AD1457] to-[#C2185B] text-white rounded-xl p-4 shadow-lg">
                <h3 className="font-bold text-base md:text-lg mb-3 text-center flex items-center justify-center gap-2">
                  <span>⚡</span> خدمة برق
                </h3>
                <p className="text-white/80 text-xs md:text-sm text-center mb-3 leading-relaxed" dir="rtl">
                  استلام الحقائب من المنزل وإصدار كروت الصعود مسبقاً قبل الإقلاع
                </p>
                <div className="space-y-2">
                  {[
                    { city: "بنغازي", phone: "0922259955" },
                    { city: "مصراتة", phone: "0912279955" },
                    { city: "طرابلس", phone: "0912269955" },
                  ].map((item) => (
                    <a
                      key={item.city}
                      href={`tel:${item.phone}`}
                      className="flex items-center justify-between bg-white/15 hover:bg-white/25 rounded-lg px-3 py-2 transition-all"
                    >
                      <span className="font-bold text-sm">{item.city}:</span>
                      <span className="font-bold text-sm" dir="ltr">{item.phone}</span>
                    </a>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
