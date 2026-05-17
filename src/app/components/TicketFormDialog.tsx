import { useState, useEffect } from "react";
import { TicketPrice } from "../types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";

/* ─── درجات التذاكر المتاحة ─────────────────────────────────────── */
const TICKET_CLASSES = [
  { code: "C", nameAr: "درجة أولى",      label: "درجة أولى C"      },
  { code: "J", nameAr: "درجة أولى",      label: "درجة أولى J"      },
  { code: "Y", nameAr: "درجة سياحية",    label: "درجة سياحية Y"    },
  { code: "B", nameAr: "درجة اقتصادية",  label: "درجة اقتصادية B"  },
  { code: "K", nameAr: "درجة مخفضة",     label: "درجة مخفضة K"     },
  { code: "R", nameAr: "درجة مخفضة",     label: "درجة مخفضة R"     },
  { code: "S", nameAr: "درجة مخفضة",     label: "درجة مخفضة S"     },
];

interface TicketFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket?: TicketPrice | null;
  onSave: (ticket: Omit<TicketPrice, "id"> | TicketPrice) => void;
}

export function TicketFormDialog({
  open,
  onOpenChange,
  ticket,
  onSave,
}: TicketFormDialogProps) {
  const [formData, setFormData] = useState({
    destination: "",
    departure: "",
    return: "",
    adultPrice: "",
    childPrice: "",
  });

  useEffect(() => {
    if (ticket) {
      setFormData({
        destination: ticket.destination,
        departure: ticket.departure,
        return: ticket.return,
        adultPrice: String(ticket.adultPrice),
        childPrice: String(ticket.childPrice),
      });
    } else {
      setFormData({
        destination: "",
        departure: "",
        return: "",
        adultPrice: "",
        childPrice: "",
      });
    }
  }, [ticket, open]);

  const handleSubmit = () => {
    const ticketData = {
      destination: formData.destination.trim(),
      departure: formData.departure,
      return: formData.return,
      adultPrice: formData.adultPrice.trim(),
      childPrice: formData.childPrice.trim(),
    };

    if (ticket) {
      onSave({ ...ticketData, id: ticket.id });
    } else {
      onSave(ticketData);
    }

    onOpenChange(false);
  };

  const isValid =
    formData.destination.trim() &&
    formData.departure &&
    formData.return !== "" &&
    formData.adultPrice.trim() &&
    formData.childPrice.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="bg-white border-[#AD1457] w-[95%] sm:max-w-lg max-h-[90vh] overflow-y-auto"
        dir="rtl"
      >
        <DialogHeader>
          <DialogTitle className="text-[#AD1457] text-center text-xl md:text-2xl">
            {ticket ? "✏️ تعديل سعر التذكرة" : "➕ إضافة سعر جديد"}
          </DialogTitle>
          <DialogDescription className="text-gray-600 text-center text-sm md:text-base">
            {ticket
              ? "قم بتعديل بيانات التذكرة ثم اضغط حفظ"
              : "أدخل بيانات السعر الجديد ثم اضغط إضافة"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* الوجهة */}
          <div className="space-y-2">
            <Label htmlFor="destination" className="text-[#AD1457] font-bold">
              🗺️ الوجهة
            </Label>
            <Input
              id="destination"
              value={formData.destination}
              onChange={(e) =>
                setFormData({ ...formData, destination: e.target.value })
              }
              className="border-[#AD1457] focus:ring-[#AD1457] h-11"
              placeholder="مثال: بنغازي - القاهرة"
            />
          </div>

          {/* الذهاب والعودة - قوائم منسدلة */}
          <div className="grid grid-cols-2 gap-4">
            {/* الذهاب */}
            <div className="space-y-2">
              <Label className="text-[#AD1457] font-bold">🛫 الذهاب</Label>
              <Select
                value={formData.departure}
                onValueChange={(val) =>
                  setFormData({ ...formData, departure: val })
                }
              >
                <SelectTrigger
                  className="border-[#AD1457] focus:ring-[#AD1457] h-11 text-right"
                  dir="rtl"
                >
                  <SelectValue placeholder="اختر الدرجة" />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  {TICKET_CLASSES.map((cls) => (
                    <SelectItem
                      key={`dep-${cls.code}`}
                      value={cls.label}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="bg-[#AD1457] text-white rounded px-1.5 py-0.5 text-xs font-bold">
                          {cls.code}
                        </span>
                        <span>{cls.nameAr}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* العودة */}
            <div className="space-y-2">
              <Label className="text-[#AD1457] font-bold">🛬 العودة</Label>
              <Select
                value={formData.return}
                onValueChange={(val) =>
                  setFormData({ ...formData, return: val })
                }
              >
                <SelectTrigger
                  className="border-[#AD1457] focus:ring-[#AD1457] h-11 text-right"
                  dir="rtl"
                >
                  <SelectValue placeholder="اختر الدرجة" />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  <SelectItem value="-" className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">-</span>
                      <span>ذهاب فقط</span>
                    </div>
                  </SelectItem>
                  {TICKET_CLASSES.map((cls) => (
                    <SelectItem
                      key={`ret-${cls.code}`}
                      value={cls.label}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="bg-[#AD1457] text-white rounded px-1.5 py-0.5 text-xs font-bold">
                          {cls.code}
                        </span>
                        <span>{cls.nameAr}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* عرض معاينة الاختيار */}
          {(formData.departure || formData.return) && (
            <div className="bg-pink-50 border border-[#AD1457]/30 rounded-xl p-3">
              <p className="text-xs text-[#AD1457]/70 mb-1 font-medium">
                معاينة ما سيظهر في الموقع:
              </p>
              <div className="flex gap-4 text-sm">
                {formData.departure && (
                  <span className="flex items-center gap-1">
                    <span className="text-[#AD1457]">ذهاب:</span>
                    <span className="font-bold text-gray-800">
                      {formData.departure}
                    </span>
                  </span>
                )}
                {formData.return && formData.return !== "-" && (
                  <span className="flex items-center gap-1">
                    <span className="text-[#AD1457]">عودة:</span>
                    <span className="font-bold text-gray-800">
                      {formData.return}
                    </span>
                  </span>
                )}
                {formData.return === "-" && (
                  <span className="flex items-center gap-1 text-green-700 font-semibold">
                    <span className="text-[#AD1457]">🛫 </span>
                    <span>ذهاب فقط</span>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* الأسعار */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="adultPrice" className="text-[#AD1457] font-bold">
                👤 سعر البالغ
              </Label>
              <Input
                id="adultPrice"
                type="text"
                value={formData.adultPrice}
                onChange={(e) =>
                  setFormData({ ...formData, adultPrice: e.target.value })
                }
                className="border-[#AD1457] focus:ring-[#AD1457] h-11"
                placeholder="مثال: 1500 دينار"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="childPrice" className="text-[#AD1457] font-bold">
                👦 سعر الطفل
              </Label>
              <Input
                id="childPrice"
                type="text"
                value={formData.childPrice}
                onChange={(e) =>
                  setFormData({ ...formData, childPrice: e.target.value })
                }
                className="border-[#AD1457] focus:ring-[#AD1457] h-11"
                placeholder="مثال: 750 دينار"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-3 pt-2">
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="border-[#AD1457] text-[#AD1457] hover:bg-[#AD1457] hover:text-white flex-1"
          >
            إلغاء
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!isValid}
            className="bg-[#AD1457] hover:bg-[#8E1144] text-white flex-1 disabled:opacity-50"
          >
            {ticket ? "💾 حفظ التعديلات" : "✅ إضافة"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
