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
        <Toaster position="top-center" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

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
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
