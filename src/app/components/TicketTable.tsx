import { TicketPrice } from "../types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Button } from "./ui/button";
import { Pencil, Trash2, Copy, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useMemo, useState } from "react";

interface TicketTableProps {
  tickets: TicketPrice[];
  editable?: boolean;
  showCopyButton?: boolean;
  onEdit?: (ticket: TicketPrice) => void;
  onDelete?: (id: string) => void;
}

/* ─── دالة النسخ الموثوقة ──────────────────────────────────────── */
async function copyTicket(ticket: TicketPrice) {
  const message =
    `الوجهة: ${ticket.destination}\n` +
    `الذهاب: ${ticket.departure}\n` +
    `العودة: ${ticket.return}\n` +
    `بالغ: ${ticket.adultPrice}\n` +
    `طفل: ${ticket.childPrice}`;

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(message);
      toast.success("✅ تم نسخ البيانات");
      return;
    } catch {/* fallback */}
  }
  const el = document.createElement("textarea");
  el.value = message;
  el.style.cssText = "position:fixed;top:0;left:0;width:2em;height:2em;opacity:0;";
  document.body.appendChild(el);
  el.focus();
  el.select();
  try {
    const ok = document.execCommand("copy");
    ok ? toast.success("✅ تم نسخ البيانات") : toast.error("❌ فشل النسخ");
  } catch {
    toast.error("❌ فشل النسخ");
  }
  document.body.removeChild(el);
}

/* ─── بطاقة الموبايل لكل تذكرة ─────────────────────────────────── */
function TicketCard({
  ticket,
  index,
  editable,
  showCopyButton,
  onEdit,
  onDelete,
}: {
  ticket: TicketPrice;
  index: number;
  editable?: boolean;
  showCopyButton?: boolean;
  onEdit?: (t: TicketPrice) => void;
  onDelete?: (id: string) => void;
}) {
  return (
    <div
      className={`rounded-2xl border-2 border-[#AD1457] shadow-md p-4 ${
        index % 2 === 0 ? "bg-pink-50" : "bg-white"
      }`}
    >
      {/* الوجهة + أزرار */}
      <div className="flex items-start justify-between mb-3 gap-2">
        <span className="text-[#AD1457] font-bold text-base leading-tight">
          {ticket.destination}
        </span>
        <div className="flex gap-1 flex-shrink-0">
          {showCopyButton && !editable && (
            <button
              onClick={() => copyTicket(ticket)}
              className="bg-[#AD1457] hover:bg-[#8E1144] text-white rounded-lg p-1.5 transition-colors"
              title="نسخ"
            >
              <Copy className="size-3.5" />
            </button>
          )}
          {editable && (
            <>
              <Button
                onClick={() => onEdit?.(ticket)}
                size="sm"
                className="bg-[#AD1457] hover:bg-[#8E1144] text-white h-8 px-2"
              >
                <Pencil className="size-3.5" />
              </Button>
              <Button
                onClick={() => onDelete?.(ticket.id)}
                size="sm"
                variant="destructive"
                className="bg-red-500 hover:bg-red-600 h-8 px-2"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* تفاصيل الدرجات والأسعار */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="bg-white/70 rounded-xl px-3 py-2 border border-[#AD1457]/20">
          <p className="text-gray-500 text-xs mb-0.5">🛫 الذهاب</p>
          <p className="text-gray-800 font-bold leading-tight">{ticket.departure}</p>
        </div>
        <div className="bg-white/70 rounded-xl px-3 py-2 border border-[#AD1457]/20">
          <p className="text-gray-500 text-xs mb-0.5">🛬 العودة</p>
          <p className="text-gray-800 font-bold leading-tight">{ticket.return}</p>
        </div>
        <div className="bg-[#AD1457]/10 rounded-xl px-3 py-2 border border-[#AD1457]/20">
          <p className="text-gray-500 text-xs mb-0.5">👤 بالغ</p>
          <p className="text-[#AD1457] font-bold">{ticket.adultPrice}</p>
        </div>
        <div className="bg-[#AD1457]/10 rounded-xl px-3 py-2 border border-[#AD1457]/20">
          <p className="text-gray-500 text-xs mb-0.5">👦 طفل</p>
          <p className="text-[#AD1457] font-bold">{ticket.childPrice}</p>
        </div>
      </div>
    </div>
  );
}

/* ─── المكوّن الرئيسي ──────────────────────────────────────────── */
export function TicketTable({
  tickets,
  editable = false,
  showCopyButton = false,
  onEdit,
  onDelete,
}: TicketTableProps) {
  const colSpan = editable || showCopyButton ? 8 : 7;

  const pageSize = 11;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(tickets.length / pageSize));
  }, [tickets.length]);

  useEffect(() => {
    // إعادة الترقيم لبداية القائمة عند أي تغيير في البيانات
    setCurrentPage(1);
  }, [tickets]);

  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedTickets = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return tickets.slice(start, start + pageSize);
  }, [tickets, safeCurrentPage]);

  if (tickets.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border-2 border-[#AD1457] p-12 text-center">
        <p className="text-[#AD1457] text-lg md:text-xl font-medium">
          لا توجد أسعار متاحة حالياً
        </p>
      </div>
    );
  }

  return (
    <>
      {/* placeholder to keep fragment formatting stable */}
      {/* ─── جدول على جميع الشاشات ─── */}
      <div className="block bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-[#AD1457]">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#AD1457] hover:bg-[#AD1457]">
                <TableHead className="text-white text-center text-xs md:text-sm lg:text-base font-bold border-l border-white/30 whitespace-nowrap px-1 sm:px-2 md:px-3 lg:px-4">
                  الوجهة
                </TableHead>
                <TableHead className="text-white text-center text-xs md:text-sm lg:text-base font-bold border-l border-white/30 whitespace-nowrap px-1 sm:px-2 md:px-3 lg:px-4">
                  الذهاب
                </TableHead>
                <TableHead className="text-white text-center text-xs md:text-sm lg:text-base font-bold border-l border-white/30 whitespace-nowrap px-1 sm:px-2 md:px-3 lg:px-4">
                  العودة
                </TableHead>
                <TableHead className="text-white text-center text-[10px] sm:text-xs font-bold border-l border-white/30 whitespace-nowrap px-0.5 sm:px-1 md:px-2">
                  بالغ
                </TableHead>
                <TableHead className="text-white text-center text-[10px] sm:text-xs font-bold border-l border-white/30 whitespace-nowrap px-0.5 sm:px-1 md:px-2">
                  السعر
                </TableHead>
                <TableHead className="text-white text-center text-[10px] sm:text-xs font-bold border-l border-white/30 whitespace-nowrap px-0.5 sm:px-1 md:px-2">
                  طفل
                </TableHead>
                <TableHead className="text-white text-center text-xs md:text-sm lg:text-base font-bold whitespace-nowrap px-1 sm:px-2 md:px-3 lg:px-4">
                  السعر
                </TableHead>
                {(editable || showCopyButton) && (
                  <TableHead className="text-white text-center text-xs md:text-sm lg:text-base font-bold border-r border-white/30 whitespace-nowrap px-1 sm:px-2 md:px-3 lg:px-4">
                    {editable ? "الإجراءات" : "نسخ"}
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTickets.map((ticket, index) => (
                <TableRow
                  key={ticket.id}
                  className={`${
                    index % 2 === 0 ? "bg-pink-50" : "bg-white"
                  } hover:bg-pink-100 transition-colors`}
                >
                  <TableCell className="text-center text-[#AD1457] font-semibold text-xs md:text-sm lg:text-base border-l border-[#AD1457]/20 px-1 sm:px-2 md:px-3 lg:px-4 whitespace-nowrap">
                    {ticket.destination}
                  </TableCell>
                  <TableCell className="text-center text-[#AD1457] text-xs md:text-sm lg:text-base border-l border-[#AD1457]/20 px-1 sm:px-2 md:px-3 lg:px-4">
                    {ticket.departure}
                  </TableCell>
                  <TableCell className="text-center text-[#AD1457] text-xs md:text-sm lg:text-base border-l border-[#AD1457]/20 px-1 sm:px-2 md:px-3 lg:px-4">
                    {ticket.return}
                  </TableCell>
                  <TableCell className="text-center text-[#AD1457] text-xs md:text-sm lg:text-base border-l border-[#AD1457]/20 px-1 sm:px-2 md:px-3 lg:px-4 font-medium">
                    بالغ
                  </TableCell>
                  <TableCell className="text-center text-[#AD1457] font-bold text-xs md:text-sm lg:text-base border-l border-[#AD1457]/20 px-1 sm:px-2 md:px-3 lg:px-4">
                    {ticket.adultPrice}
                  </TableCell>
                  <TableCell className="text-center text-[#AD1457] text-xs md:text-sm lg:text-base border-l border-[#AD1457]/20 px-1 sm:px-2 md:px-3 lg:px-4 font-medium">
                    طفل
                  </TableCell>
                  <TableCell className="text-center text-[#AD1457] font-bold text-xs md:text-sm lg:text-base px-1 sm:px-2 md:px-3 lg:px-4">
                    {ticket.childPrice}
                  </TableCell>
                  {editable && (
                    <TableCell className="text-center border-r border-[#AD1457]/20 px-0.5">
                      <div className="flex gap-0.5 justify-center">
                        <Button
                          onClick={() => onEdit?.(ticket)}
                          size="sm"
                          className="bg-[#AD1457] hover:bg-[#8E1144] text-white text-xs px-1 h-6"
                        >
                          <Pencil className="size-2.5" />
                        </Button>
                        <Button
                          onClick={() => onDelete?.(ticket.id)}
                          size="sm"
                          variant="destructive"
                          className="bg-red-500 hover:bg-red-600 text-xs px-2 md:px-3"
                        >
                          <Trash2 className="size-3 md:size-4" />
                          <span className="hidden md:inline mr-1">حذف</span>
                        </Button>
                      </div>
                    </TableCell>
                  )}
                  {showCopyButton && !editable && (
                    <TableCell className="text-center border-r border-[#AD1457]/20 px-2 md:px-4">
                      <Button
                        onClick={() => copyTicket(ticket)}
                        size="sm"
                        className="bg-[#AD1457] hover:bg-[#8E1144] text-white h-8 w-8 p-0"
                        title="نسخ البيانات"
                      >
                        <Copy className="size-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* ─── Pagination ─── */}
        <div className="w-full flex items-center justify-center gap-3 bg-[#AD1457] p-3">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={safeCurrentPage <= 1}
            className="disabled:opacity-50 disabled:cursor-not-allowed text-white hover:text-white/80 active:text-white/60 transition-colors"
            aria-label="الصفحة السابقة"
            title="السابق"
          >
            <ChevronRight className="size-6" />
          </button>


          <div className="flex items-center gap-2 flex-wrap justify-center">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                aria-current={page === safeCurrentPage ? "page" : undefined}
                className={`rounded-xl px-3 py-1.5 text-sm font-bold border-2 transition-colors ${
                  page === safeCurrentPage
                    ? "border-white bg-white text-[#AD1457]"
                    : "border-white/50 bg-transparent text-white hover:bg-white/20"
                }`}
              >
                {page}
              </button>

            ))}
          </div>

          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={safeCurrentPage >= totalPages}
            className="disabled:opacity-50 disabled:cursor-not-allowed text-white hover:text-white/80 active:text-white/60 transition-colors"
            aria-label="الصفحة التالية"
            title="التالي"
          >
            <ChevronLeft className="size-6" />
          </button>
        </div>
      </div>
    </>
  );
}
