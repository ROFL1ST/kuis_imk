import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthProvider";

import ProtectedRoute from "./components/layout/ProtectedRoute";
import Navbar from "./components/layout/Navbar";
import Login from "./pages/auth/Login";

import QuizList from "./pages/quiz/QuizList";
import QuizPlay from "./pages/quiz/QuizPlay";
import History from "./pages/dashboard/History";
import Friends from "./pages/social/Friends";
import Leaderboard from "./pages/social/Leaderboard";
import Dashboard from "./pages/dashboard/Dashboard";
import ReviewPage from "./pages/dashboard/ReviewPage";

import GlobalLeaderboard from "./pages/social/GlobalLeaderboard";
import ClassroomList from "./pages/classroom/ClassroomList";
import ClassroomDetail from "./pages/classroom/ClassroomDetail";
import Register from "./pages/auth/Register";
import ChallengeList from "./pages/social/ChallengeList";
import LobbyPage from "./pages/social/LobbyPage";
import Profile from "./pages/profile/Profile";
import About from "./pages/about/About";
import Settings from "./pages/profile/Settings";
import VerifyEmail from "./pages/auth/VerifyEmail";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import EmailAlert from "./components/ui/EmailAlert";
import Notifications from "./pages/dashboard/Notifications";
import WhatsNew from "./pages/about/WhatsNew";
import ScrollToTop from "./components/layout/ScrollToTop";
import Shop from "./pages/shop/Shop";
import Inventory from "./pages/shop/Inventory";
import Community from "./pages/community/Community";
import LandingPage from "./pages/landing/LandingPage";
import { getUser } from "./services/auth";

// Dark toast style constants
const TOAST_STYLE = {
  background: "var(--color-surface-800, #1e1e2e)",
  color: "var(--color-surface-50, #f8fafc)",
  border: "1px solid var(--color-surface-700, #2d2d3f)",
  borderRadius: "14px",
  fontSize: "13px",
  fontWeight: "600",
  boxShadow: "0 8px 32px rgb(0 0 0 / 0.40)",
  padding: "12px 16px",
};

const MainLayout = ({ children }) => (
  <>
    <Navbar />
    <div className="container mx-auto px-4 py-8">{children}</div>
  </>
);

/**
 * RootRedirect:
 * - Jika ada data user di localStorage (pernah login sebelumnya) → /login
 * - Jika belum pernah login sama sekali (pengunjung baru) → LandingPage
 */
const RootRedirect = () => {
  const hasVisited = !!getUser();
  return hasVisited ? <Navigate to="/login" replace /> : <LandingPage />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <Toaster
          position="top-center"
          toastOptions={{
            style: TOAST_STYLE,
            success: {
              style: TOAST_STYLE,
              iconTheme: { primary: "#4ade80", secondary: "var(--color-surface-800, #1e1e2e)" },
            },
            error: {
              style: TOAST_STYLE,
              iconTheme: { primary: "#f87171", secondary: "var(--color-surface-800, #1e1e2e)" },
            },
            loading: {
              style: TOAST_STYLE,
              iconTheme: { primary: "#818cf8", secondary: "var(--color-surface-800, #1e1e2e)" },
            },
            duration: 3500,
          }}
        />
        <EmailAlert />
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/whats-new" element={<WhatsNew />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
            <Route path="/topic/:slug" element={<MainLayout><QuizList /></MainLayout>} />
            <Route path="/history" element={<MainLayout><History /></MainLayout>} />
            <Route path="/history/review/:historyId" element={<MainLayout><ReviewPage /></MainLayout>} />
            <Route path="/friends" element={<MainLayout><Friends /></MainLayout>} />
            <Route path="/notifications" element={<MainLayout><Notifications /></MainLayout>} />
            <Route path="/:username" element={<MainLayout><Profile /></MainLayout>} />
            <Route path="/leaderboard/global" element={<MainLayout><GlobalLeaderboard /></MainLayout>} />
            <Route path="/leaderboard/:slug" element={<MainLayout><Leaderboard /></MainLayout>} />
            <Route path="/challenges" element={<MainLayout><ChallengeList /></MainLayout>} />
            <Route path="/lobby/:id" element={<MainLayout><LobbyPage /></MainLayout>} />
            <Route path="/play/:quizId" element={<QuizPlay />} />
            <Route path="/settings" element={<MainLayout><Settings /></MainLayout>} />
            <Route path="/shop" element={<MainLayout><Shop /></MainLayout>} />
            <Route path="/inventory" element={<MainLayout><Inventory /></MainLayout>} />
            <Route path="/community" element={<MainLayout><Community /></MainLayout>} />
            <Route path="/play/survival" element={<QuizPlay />} />
            <Route path="/play/survival/game" element={<Navigate to="/play/survival" replace />} />
            <Route path="/classrooms" element={<MainLayout><ClassroomList /></MainLayout>} />
            <Route path="/classrooms/:id" element={<MainLayout><ClassroomDetail /></MainLayout>} />
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
