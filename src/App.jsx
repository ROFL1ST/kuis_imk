import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthProvider";

import ProtectedRoute from "./components/layout/ProtectedRoute";
import Sidebar from "./components/layout/Sidebar";
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

// ── MainLayout: sidebar + scrollable content area ──────────────────────────
const MainLayout = ({ children }) => (
  <div
    style={{
      display: "flex",
      minHeight: "100dvh",
      background: "var(--color-canvas)",
    }}
  >
    <Sidebar />
    {/* 240px = sidebar width; content scrolls independently */}
    <main
      style={{
        flex: 1,
        marginLeft: 240,
        minHeight: "100dvh",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          maxWidth: 960,
          margin: "0 auto",
          padding: "2rem 2rem 4rem",
        }}
      >
        {children}
      </div>
    </main>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              fontFamily: "var(--font-sans)",
              fontSize: "0.875rem",
              color: "var(--color-ink)",
              background: "var(--color-surface)",
              border: "1px solid oklch(0.2 0.005 60 / 0.10)",
              boxShadow: "var(--shadow-panel)",
              borderRadius: "0.75rem",
              padding: "0.75rem 1rem",
            },
          }}
        />
        <EmailAlert />
        <Routes>
          {/* Public routes — no sidebar */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/whats-new" element={<WhatsNew />} />

          {/* Protected routes — wrapped in MainLayout (sidebar) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard"          element={<MainLayout><Dashboard /></MainLayout>} />
            <Route path="/topic/:slug"         element={<MainLayout><QuizList /></MainLayout>} />
            <Route path="/history"             element={<MainLayout><History /></MainLayout>} />
            <Route path="/history/review/:historyId" element={<MainLayout><ReviewPage /></MainLayout>} />
            <Route path="/friends"             element={<MainLayout><Friends /></MainLayout>} />
            <Route path="/notifications"       element={<MainLayout><Notifications /></MainLayout>} />
            <Route path="/:username"           element={<MainLayout><Profile /></MainLayout>} />
            <Route path="/leaderboard/global"  element={<MainLayout><GlobalLeaderboard /></MainLayout>} />
            <Route path="/leaderboard/:slug"   element={<MainLayout><Leaderboard /></MainLayout>} />
            <Route path="/challenges"          element={<MainLayout><ChallengeList /></MainLayout>} />
            <Route path="/lobby/:id"           element={<MainLayout><LobbyPage /></MainLayout>} />
            <Route path="/settings"            element={<MainLayout><Settings /></MainLayout>} />
            <Route path="/shop"                element={<MainLayout><Shop /></MainLayout>} />
            <Route path="/inventory"           element={<MainLayout><Inventory /></MainLayout>} />
            <Route path="/community"           element={<MainLayout><Community /></MainLayout>} />
            <Route path="/classrooms"          element={<MainLayout><ClassroomList /></MainLayout>} />
            <Route path="/classrooms/:id"      element={<MainLayout><ClassroomDetail /></MainLayout>} />

            {/* Gameplay — fullscreen, no sidebar */}
            <Route path="/play/:quizId"        element={<QuizPlay />} />
            <Route path="/play/survival"       element={<QuizPlay />} />
            <Route path="/play/survival/game"  element={<Navigate to="/play/survival" replace />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
