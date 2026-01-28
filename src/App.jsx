import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthProvider"; // Import Provider yang Benar

import ProtectedRoute from "./components/layout/ProtectedRoute";
import Navbar from "./components/layout/Navbar";
import Login from "./pages/auth/Login";

import QuizList from "./pages/quiz/QuizList"; // Buat file ini (mirip Dashboard)
import QuizPlay from "./pages/quiz/QuizPlay";
import History from "./pages/dashboard/History"; // Buat file ini (mapping api.getHistory)
import Friends from "./pages/social/Friends"; // Buat file ini
import Leaderboard from "./pages/social/Leaderboard"; // Buat file ini
import Dashboard from "./pages/dashboard/Dashboard";
import ReviewPage from "./pages/dashboard/ReviewPage";

// New Features
import GlobalLeaderboard from "./pages/social/GlobalLeaderboard";
// Survival imports deprecated (moved to QuizPlay)
import ClassroomList from "./pages/classroom/ClassroomList";
import ClassroomDetail from "./pages/classroom/ClassroomDetail";
import Register from "./pages/auth/Register";
import ChallengeList from "./pages/social/ChallengeList";
import LobbyPage from "./pages/social/LobbyPage"; // NEW
// import JoinLobbyPage from "./pages/social/JoinLobbyPage"; // REMOVED
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

const MainLayout = ({ children }) => (
  <>
    <Navbar />
    <div className="container mx-auto px-4 py-8">{children}</div>
  </>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <Toaster position="top-center" />
        <EmailAlert />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/whats-new" element={<WhatsNew />} />
          <Route element={<ProtectedRoute />}>
            <Route
              path="/dashboard"
              element={
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              }
            />
            <Route
              path="/topic/:slug"
              element={
                <MainLayout>
                  <QuizList />
                </MainLayout>
              }
            />
            <Route
              path="/history"
              element={
                <MainLayout>
                  <History />
                </MainLayout>
              }
            />
            <Route
              path="/history/review/:historyId"
              element={
                <MainLayout>
                  <ReviewPage />
                </MainLayout>
              }
            />
            <Route
              path="/friends"
              element={
                <MainLayout>
                  <Friends />
                </MainLayout>
              }
            />

            <Route
              path="/notifications"
              element={
                <MainLayout>
                  <Notifications />
                </MainLayout>
              }
            />
            {/* <Route path="/profile" element={<Navigate to="/" replace />} /> */}

            {/* ROUTE BARU: Format Instagram */}
            <Route
              path="/:username"
              element={
                <MainLayout>
                  <Profile />
                </MainLayout>
              }
            />
            <Route
              path="/leaderboard/global"
              element={
                <MainLayout>
                  <GlobalLeaderboard />
                </MainLayout>
              }
            />
            <Route
              path="/leaderboard/:slug"
              element={
                <MainLayout>
                  <Leaderboard />
                </MainLayout>
              }
            />
            <Route
              path="/challenges"
              element={
                <MainLayout>
                  <ChallengeList />
                </MainLayout>
              }
            />
            {/* <Route
              path="/challenges/join"
              element={
                <MainLayout>
                  <JoinLobbyPage />
                </MainLayout>
              }
            /> */}
            <Route
              path="/lobby/:id"
              element={
                <MainLayout>
                  <LobbyPage />
                </MainLayout>
              }
            />
            {/* Gameplay Fullscreen */}
            <Route path="/play/:quizId" element={<QuizPlay />} />

            {/* <Route
              path="/about"
              element={
                <MainLayout>
                  <About />
                </MainLayout>
              }
            /> */}
            <Route
              path="/settings"
              element={
                <MainLayout>
                  <Settings />
                </MainLayout>
              }
            />

            <Route
              path="/shop"
              element={
                <MainLayout>
                  <Shop />
                </MainLayout>
              }
            />
            <Route
              path="/inventory"
              element={
                <MainLayout>
                  <Inventory />
                </MainLayout>
              }
            />
            <Route
              path="/community"
              element={
                <MainLayout>
                  <Community />
                </MainLayout>
              }
            />

            {/* Repurposed Survival Route -> QuizPlay */}
            <Route path="/play/survival" element={<QuizPlay />} />
            <Route
              path="/play/survival/game"
              element={<Navigate to="/play/survival" replace />}
            />

            {/* Classrooms */}
            <Route
              path="/classrooms"
              element={
                <MainLayout>
                  <ClassroomList />
                </MainLayout>
              }
            />
            <Route
              path="/classrooms/:id"
              element={
                <MainLayout>
                  <ClassroomDetail />
                </MainLayout>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
