import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { getMe, forceLogout } from "./store/slices/authSlice.js";
import AppRoutes from "./routes/AppRoutes.jsx";
import Sidebar from "./components/common/Sidebar.jsx";
import Navbar from "./components/common/Navbar.jsx";
import Loader from "./components/common/Loader.jsx";
import useSocket from "./hooks/useSocket.js";

// These routes never show the sidebar/navbar shell
const NO_SHELL_ROUTES = ["/", "/login", "/forgot-password"];

const App = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, initialized } = useSelector((state) => state.auth);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useSocket(user);

  // Check session once on mount
  useEffect(() => {
    dispatch(getMe());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Axios interceptor fires this when refresh token fails
  useEffect(() => {
    const handler = () => {
      dispatch(forceLogout());
      navigate("/login", { replace: true });
    };
    window.addEventListener("auth:logout", handler);
    return () => window.removeEventListener("auth:logout", handler);
  }, [dispatch, navigate]);

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <Loader size="lg" />
      </div>
    );
  }

  // No shell for public pages, reset-password, or when not logged in
  const isNoShell =
    NO_SHELL_ROUTES.includes(location.pathname) ||
    location.pathname.startsWith("/reset-password") ||
    !user;

  if (isNoShell) {
    return <AppRoutes />;
  }

  // Authenticated shell: sidebar (desktop) + fixed top navbar + scrollable main
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile sidebar backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Right panel — navbar + main */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Navbar — renders as position:fixed internally, so we add a spacer */}
        <Navbar onMenuClick={() => setMobileSidebarOpen(true)} />

        {/* Main content — scrollable */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <AppRoutes />
        </main>
      </div>
    </div>
  );
};

export default App;
