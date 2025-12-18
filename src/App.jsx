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
import Register from "./pages/auth/Register";
import ChallengeList from "./pages/social/ChallengeList";
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
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/whats-new" element={<WhatsNew />} />
          <Route element={<ProtectedRoute />}>
            <Route
              path="/"
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
            {/* Gameplay Fullscreen */}
            <Route path="/play/:quizId" element={<QuizPlay />} />
            <Route
              path="/about"
              element={
                <MainLayout>
                  <About />
                </MainLayout>
              }
            />
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
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
