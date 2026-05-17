/**
 * ProtectedRoute — حارس المسارات المحمية
 * يعيد التوجيه إلى الصفحة الرئيسية إذا لم يكن المستخدم مصادَقاً
 */
import { Navigate } from "react-router";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  role: "callcenter" | "admin";
  children: React.ReactNode;
}

export function ProtectedRoute({ role, children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated(role)) {
    /* إعادة توجيه فورية إلى الصفحة العامة */
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
