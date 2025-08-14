import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import Footer from './components/layout/Footer';
import Header from './components/layout/Header';
import SignupPage from './pages/Auth/SignupPage';
import LoginPage from './pages/Auth/LoginPage';
import Dashboard from './pages/Dashboard';
import Learn from './pages/Learn';
import LearnDetail from './pages/Learn/Detail';
import Quizzes from './pages/Quizzes';
import QuizDetail from './pages/Quizzes/QuizDetail';
import Challenges from './pages/Challenges';
import ChallengeDetail from './pages/Challenges/ChallengeDetail';
import MyPage from './pages/MyPage';
import { useAuth, AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import AdminPage from './pages/Adimin/AdminPage';
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage';
import FindEmailPage from './pages/Auth/FindEmailPage';

function AppContent() {
  const { isAdmin } = useAuth();

  return (
    <Routes>
      {/* Auth routes without header/footer */}
      <Route path="/auth/signup" element={<SignupPage />} />
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/auth/find-email" element={<FindEmailPage />} />

      {/* Protected routes with header/footer */}

      {/* Dashboard route without header/footer */}
      <Route
        path="/dashboard"
        element={
          <>
            <div className="px-4 sm:px-6 md:px-8 lg:px-10 pt-6 sm:pt-8 md:pt-10 space-y-6 sm:space-y-8">
              <Header mode="dark" fixed={false} />
            </div>
            <Dashboard />
          </>
        }
      />

      {/* Learn route with header only */}
      <Route
        path="/learn"
        element={
          <>
            <div className="px-4 sm:px-6 md:px-8 lg:px-10 pt-6 sm:pt-8 md:pt-10 space-y-6 sm:space-y-8">
              <Header mode="dark" fixed={false} />
            </div>
            <Learn />
          </>
        }
      />

      {/* Learn Detail route with header only */}
      <Route path="/learn/:moduleId" element={<LearnDetail />} />

      {/* Quizzes route with header only */}
      <Route
        path="/quizzes"
        element={
          <>
            <div className="px-4 sm:px-6 md:px-8 lg:px-10 space-y-6 sm:space-y-8">
              <Header mode="dark" fixed={true} />
            </div>
            <Quizzes />
          </>
        }
      />

      {/* Quiz Detail route without header/footer */}
      <Route path="/quiz/:id" element={<QuizDetail />} />

      {/* Challenges route with header only */}
      <Route
        path="/challenges"
        element={
          <>
            <div className="px-4 sm:px-6 md:px-8 lg:px-10 space-y-6 sm:space-y-8">
              <Header mode="dark" fixed={true} />
            </div>
            <Challenges />
          </>
        }
      />

      {/* Challenge Detail route without header/footer */}
      <Route path="/challenge/:moduleId/:challengeId" element={<ChallengeDetail />} />

      {/* MyPage route with header only */}
      <Route
        path="/mypage"
        element={
          <>
            <div className="px-4 sm:px-6 md:px-8 lg:px-10 pt-6 sm:pt-8 md:pt-10 space-y-6 sm:space-y-8">
              <Header mode="dark" fixed={false} />
            </div>
            <MyPage />
          </>
        }
      />

      {/* Home route with header and footer */}
      <Route
        path="/"
        element={
          <>
            <Header mode="light" fixed={true} />
            <Home />
            {/* 관리자일 때는 숨기고, 일반 유저일 때만 노출 */}
            {!isAdmin && <Footer />}
          </>
        }
      />
      {/* Admin Page */}
      <Route
        path="admin"
        element={
          <>
            {/* <ProtectedRoute adminOnly={true}> */}
            <Header mode="light" fixed={false} />
            <AdminPage />
            {/* </ProtectedRoute> */}
          </>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
