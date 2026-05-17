import { useState, useEffect } from "react";
import { Navigation } from "../components/Navigation";
import { TicketTable } from "../components/TicketTable";
import { TicketFormDialog } from "../components/TicketFormDialog";
import { ticketStoreSupabase as ticketStore } from "../data/ticketStoreSupabase";
import { TicketPrice } from "../types";
import { Button } from "../components/ui/button";
import { Plus, Search, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Input } from "../components/ui/input";
import logoImage from "../../imports/image-1.png";

export function AdminView() {
  const [tickets, setTickets] = useState<TicketPrice[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<TicketPrice | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDestination, setSelectedDestination] = useState("");
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    setLoading(true);
    setDbError(null);
    try {
      const data = await ticketStore.getAll();
      setTickets(data);
    } catch (err: any) {
      console.error("خطأ في جلب التذاكر:", err);
      setDbError(err.message || "فشل الاتصال بقاعدة البيانات");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingTicket(null);
    setDialogOpen(true);
  };

  const handleEdit = (ticket: TicketPrice) => {
    setEditingTicket(ticket);
    setDialogOpen(true);
  };

  const handleSave = async (ticketData: Omit<TicketPrice, "id"> | TicketPrice) => {
    try {
      if ("id" in ticketData) {
        await ticketStore.update(ticketData.id, ticketData);
        toast.success("✅ تم تعديل السعر بنجاح في Supabase");
      } else {
        await ticketStore.add(ticketData);
        toast.success("✅ تمت إضافة السعر بنجاح في Supabase");
      }
      await loadTickets();
    } catch (err: any) {
      console.error("خطأ في الحفظ:", err);
      toast.error(`❌ فشل في الحفظ: ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذا السعر؟")) {
      try {
        await ticketStore.delete(id);
        toast.success("✅ تم حذف السعر بنجاح من Supabase");
        await loadTickets();
      } catch (err: any) {
        toast.error(`❌ فشل في الحذف: ${err.message}`);
      }
    }
  };

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
                لوحة تحكم الأدمن
              </h1>
            </div>
            <p className="text-lg md:text-2xl text-[#AD1457]/70 font-medium mb-4 md:mb-6 px-4">
              إدارة وتعديل أسعار التذاكر
            </p>

            {/* حالة الاتصال بـ Supabase */}
            {dbError ? (
              <div className="flex flex-col items-center gap-3 mb-6">
                <div className="inline-flex items-center gap-2 px-5 py-3 bg-red-50 border border-red-300 text-red-700 rounded-xl shadow text-sm font-medium">
                  <AlertCircle className="size-4 flex-shrink-0" />
                  <span>خطأ في الاتصال بـ Supabase: {dbError}</span>
                </div>
                <div className="bg-white border border-red-200 rounded-xl p-4 max-w-lg text-right text-sm text-gray-700 shadow">
                  <p className="font-bold text-red-600 mb-2">📋 تأكد من إنشاء الجدول في Supabase SQL Editor:</p>
                  <pre className="bg-gray-100 rounded-lg p-3 text-xs text-left overflow-x-auto">{`create table ticket_prices (
  id uuid default gen_random_uuid() primary key,
  destination text not null default '',
  departure text not null default '',
  return_date text not null default '',
  adult_price text not null default '',
  child_price text not null default '',
  created_at timestamptz default now()
);

alter table ticket_prices enable row level security;

create policy "allow_all" on ticket_prices
  for all using (true) with check (true);`}</pre>
                </div>
                <Button
                  onClick={loadTickets}
                  className="bg-[#AD1457] hover:bg-[#8E1144] text-white rounded-xl px-6 h-11"
                >
                  <RefreshCw className="size-4 ml-2" />
                  إعادة المحاولة
                </Button>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 bg-green-50 border border-green-300 text-green-700 rounded-full text-sm font-medium shadow">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                متصل بـ Supabase
              </div>
            )}

            {/* شريط البحث والإجراءات */}
            <div className="max-w-4xl mx-auto mb-6 md:mb-8 px-4">
              <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-stretch md:items-center">
                <div className="relative flex-1">
                  <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#AD1457] size-5" />
                  <Input
                    type="text"
                    placeholder="ابحث عن وجهة أو تاريخ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-12 h-12 md:h-14 text-base md:text-lg border-2 border-[#AD1457] focus:ring-2 focus:ring-[#AD1457] rounded-xl shadow-lg font-medium bg-white"
                  />
                </div>

                <Button
                  onClick={handleAdd}
                  disabled={!!dbError}
                  className="bg-gradient-to-r from-[#AD1457] to-[#C2185B] hover:from-[#8E1144] hover:to-[#AD1457] text-white h-12 md:h-14 px-5 md:px-6 text-base md:text-lg rounded-xl shadow-xl transform hover:scale-105 transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <Plus className="size-5 ml-1" />
                  إضافة سعر جديد
                </Button>
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

          {/* الجدول */}
          <div className="px-2 md:px-0">
            {loading ? (
              <div className="text-center py-16 text-[#AD1457] text-xl font-bold">
                <div className="animate-spin inline-block w-8 h-8 border-4 border-[#AD1457] border-t-transparent rounded-full mb-4"></div>
                <p>جاري الاتصال بـ Supabase...</p>
              </div>
            ) : !dbError ? (
              <TicketTable
                tickets={filteredTickets}
                editable
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ) : null}
          </div>

        </div>
      </div>

      <TicketFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        ticket={editingTicket}
        onSave={handleSave}
      />
    </div>
  );
}