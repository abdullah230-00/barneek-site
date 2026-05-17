import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Plane, MapPin, Menu, X, Loader2, ShieldAlert } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { projectId, publicAnonKey } from "/utils/supabase/info";

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-58594942`;

/* ─── إعدادات الحماية من Brute Force ─────────────────────────── */
const MAX_ATTEMPTS  = 5;      // حد المحاولات
const LOCKOUT_MS    = 5 * 60 * 1000; // 5 دقائق قفل

/* ─── قائمة المدن الثابتة ─────────────────────────────────────── */
const CITIES = [
  { name: "تونس",        code: "TUN" },
  { name: "القاهرة",     code: "CAI" },
  { name: "الإسكندرية",  code: "HBE" },
  { name: "إسطنبول",     code: "IST" },
  { name: "طرابلس",      code: "MJI" },
  { name: "مصراتة",      code: "MRA" },
  { name: "الكفرة",      code: "AKF" },
  { name: "دبي",         code: "DXB" },
  { name: "سرت",         code: "SRX" },
];

interface NavigationProps {
  onDestinationFilter?: (destination: string) => void;
  selectedDestination?: string;
}

export function Navigation({ onDestinationFilter, selectedDestination }: NavigationProps) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login, isAuthenticated } = useAuth();

  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [selectedView,       setSelectedView]       = useState<string>("");
  const [password,           setPassword]           = useState("");
  const [error,              setError]              = useState("");
  const [verifying,          setVerifying]          = useState(false);
  const [isOpen,             setIsOpen]             = useState(false);

  /* ─── حماية Brute Force ─────────────────────────────────────── */
  const [attempts,    setAttempts]    = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

  const isLocked = lockedUntil !== null && Date.now() < lockedUntil;
  const lockRemaining = isLocked
    ? Math.ceil((lockedUntil! - Date.now()) / 1000)
    : 0;

  const getCurrentValue = () => {
    if (location.pathname === "/call-center") return "callcenter";
    if (location.pathname === "/admin")        return "admin";
    return "public";
  };

  const handleViewChange = (value: string) => {
    if (value === "public") {
      navigate("/");
      return;
    }
    /* إذا كان مصادَقاً مسبقاً انتقل مباشرة */
    if (isAuthenticated(value as "callcenter" | "admin")) {
      navigate(value === "callcenter" ? "/call-center" : "/admin");
      return;
    }
    setSelectedView(value);
    setShowPasswordDialog(true);
    setPassword("");
    setError("");
    setAttempts(0);
  };

  const handlePasswordSubmit = async () => {
    if (!password.trim() || verifying) return;

    /* تحقق من القفل */
    if (isLocked) {
      setError(`تم تجاوز الحد المسموح. انتظر ${lockRemaining} ثانية`);
      return;
    }

    setVerifying(true);
    setError("");
    try {
      const res = await fetch(`${SERVER_URL}/verify-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ type: selectedView, password }),
      });
      const data = await res.json();

      if (data.valid) {
        /* نجاح — حفظ الجلسة وإعادة التوجيه */
        login(selectedView as "callcenter" | "admin");
        setShowPasswordDialog(false);
        setPassword("");
        setError("");
        setAttempts(0);
        setLockedUntil(null);
        navigate(selectedView === "callcenter" ? "/call-center" : "/admin");
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        if (newAttempts >= MAX_ATTEMPTS) {
          const until = Date.now() + LOCKOUT_MS;
          setLockedUntil(until);
          setError(`تم تجاوز ${MAX_ATTEMPTS} محاولات خاطئة. النموذج مقفل 5 دقائق.`);
        } else {
          setError(
            `كلمة السر غير صحيحة — المحاولة ${newAttempts}/${MAX_ATTEMPTS}`
          );
        }
      }
    } catch (err) {
      console.error("خطأ في التحقق:", err);
      setError("تعذّر الاتصال بالخادم، يرجى المحاولة مرة أخرى");
    } finally {
      setVerifying(false);
    }
  };

  const handleCloseDialog = () => {
    if (isLocked) return; /* لا تغلق إذا القفل نشط */
    setShowPasswordDialog(false);
    setPassword("");
    setError("");
  };

  return (
    <>
      {/* زر القائمة على الموبايل */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 right-4 z-50 bg-[#AD1457] text-white p-3 rounded-xl shadow-lg"
      >
        {isOpen ? <X className="size-6" /> : <Menu className="size-6" />}
      </button>

      {/* Overlay الموبايل */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* القائمة الجانبية */}
      <div
        className={`fixed top-0 right-0 h-screen bg-gradient-to-b from-[#AD1457] via-[#C2185B] to-[#AD1457] shadow-2xl z-40 flex flex-col rounded-l-3xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"
        } w-80 md:w-80 lg:w-96`}
      >
        {/* اختيار الواجهة */}
        <div className="p-4 md:p-6 border-b border-white/20">
          <div className="flex items-center justify-center mb-4">
            <Plane className="size-6 md:size-8 text-white ml-2" />
            <h2 className="text-white text-xl md:text-2xl font-bold">برنيق للطيران</h2>
          </div>
          <Select value={getCurrentValue()} onValueChange={handleViewChange}>
            <SelectTrigger className="bg-white text-[#AD1457] border-none h-10 md:h-12 text-base md:text-lg font-medium shadow-lg hover:shadow-xl transition-shadow">
              <SelectValue placeholder="اختر الواجهة" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="public"     className="text-[#AD1457] text-base md:text-lg cursor-pointer hover:bg-pink-50">🌐 عام</SelectItem>
              <SelectItem value="callcenter" className="text-[#AD1457] text-base md:text-lg cursor-pointer hover:bg-pink-50">📞 كول سنتر</SelectItem>
              <SelectItem value="admin"      className="text-[#AD1457] text-base md:text-lg cursor-pointer hover:bg-pink-50">⚙️ أدمن</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* فلتر الوجهات */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <h3 className="text-white text-lg md:text-xl font-bold mb-4 flex items-center">
            <MapPin className="size-4 md:size-5 ml-2" />
            فلتر الوجهات
          </h3>

          {/* جميع الوجهات */}
          <button
            onClick={() => {
              onDestinationFilter?.("");
              setIsOpen(false);
            }}
            className={`w-full p-3 md:p-4 rounded-xl font-bold text-base md:text-lg transition-all transform hover:scale-105 shadow-lg mb-3 ${
              !selectedDestination
                ? "bg-white text-[#AD1457] shadow-xl scale-105"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Plane className="size-4 md:size-5" />
              جميع الوجهات
            </div>
          </button>

          {/* شبكة المدن */}
          <div className="grid grid-cols-2 gap-2 md:gap-3">
            {CITIES.map((city) => (
              <button
                key={city.name}
                onClick={() => {
                  onDestinationFilter?.(city.name);
                  setIsOpen(false);
                }}
                className={`p-2 md:p-3 rounded-xl font-bold text-sm md:text-base transition-all transform hover:scale-105 shadow-lg ${
                  selectedDestination === city.name
                    ? "bg-white text-[#AD1457] shadow-xl scale-105"
                    : "bg-white/20 text-white hover:bg-white/30"
                }`}
              >
                <div className="flex flex-col items-center justify-center gap-0.5 min-h-[48px]">
                  <span className="text-[16px] md:text-[18px] font-bold text-white/90 leading-none tracking-wide">
                    {city.code}
                  </span>
                  <span className="text-center leading-tight text-xs md:text-sm">
                    {city.name}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* التذييل */}
        <div className="p-4 md:p-6 border-t border-white/20">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-4 text-center">
            <p className="text-white text-xs md:text-sm font-medium leading-relaxed">
              تم تطوير الموقع من قبل
              <br />
              <span className="text-base md:text-lg font-bold">إدارة الدعم والتواصل</span>
            </p>
          </div>
        </div>
      </div>

      {/* ─── نافذة كلمة السر ─── */}
      <Dialog
        open={showPasswordDialog}
        onOpenChange={(open) => {
          if (!open) handleCloseDialog();
        }}
      >
        <DialogContent
          className="bg-white border-[#AD1457] sm:max-w-md w-[90%] md:w-full"
          dir="rtl"
        >
          <DialogHeader>
            <DialogTitle className="text-[#AD1457] text-center text-xl md:text-2xl">
              🔐 أدخل كلمة السر
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-center text-sm md:text-base">
              {selectedView === "callcenter"
                ? "الرجاء إدخال كلمة سر الكول سنتر"
                : "الرجاء إدخال كلمة سر الأدمن"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nav-password" className="text-[#AD1457] font-bold">
                كلمة السر
              </Label>
              <Input
                id="nav-password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (!isLocked) setError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isLocked) handlePasswordSubmit();
                }}
                className="border-[#AD1457] focus:ring-[#AD1457]"
                placeholder="أدخل كلمة السر"
                disabled={verifying || isLocked}
                autoComplete="off"
              />

              {/* رسالة الخطأ أو القفل */}
              {error && (
                <div
                  className={`flex items-center gap-2 text-sm text-center font-medium p-2 rounded-lg ${
                    isLocked
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : "text-red-500"
                  }`}
                >
                  {isLocked && <ShieldAlert className="size-4 flex-shrink-0" />}
                  <span>{error}</span>
                </div>
              )}

              {/* عداد المحاولات */}
              {attempts > 0 && !isLocked && (
                <p className="text-xs text-gray-400 text-center">
                  محاولات متبقية: {MAX_ATTEMPTS - attempts}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              onClick={handleCloseDialog}
              variant="outline"
              className="border-[#AD1457] text-[#AD1457] hover:bg-[#AD1457] hover:text-white"
              disabled={verifying || isLocked}
            >
              إلغاء
            </Button>
            <Button
              onClick={handlePasswordSubmit}
              className="bg-[#AD1457] hover:bg-[#8E1144] text-white"
              disabled={verifying || !password.trim() || isLocked}
            >
              {verifying ? (
                <><Loader2 className="size-4 ml-1 animate-spin" /> جاري التحقق...</>
              ) : (
                "دخول"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
