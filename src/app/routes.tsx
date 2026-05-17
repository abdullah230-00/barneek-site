import { createBrowserRouter, Navigate } from "react-router";
import { PublicView } from "./pages/PublicView";
import { CallCenterView } from "./pages/CallCenterView";
import { AdminView } from "./pages/AdminView";
import { ProtectedRoute } from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  /* ─── الصفحة العامة ─── */
  {
    path: "/",
    Component: PublicView,
  },

  /* ─── كول سنتر — محمية بكلمة سر ─── */
  {
    path: "/call-center",
    element: (
      <ProtectedRoute role="callcenter">
        <CallCenterView />
      </ProtectedRoute>
    ),
  },

  /* ─── أدمن — محمية بكلمة سر ─── */
  {
    path: "/admin",
    element: (
      <ProtectedRoute role="admin">
        <AdminView />
      </ProtectedRoute>
    ),
  },

  /* ─── أي مسار غير معروف → الصفحة العامة ─── */
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
