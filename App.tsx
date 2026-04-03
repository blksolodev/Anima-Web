import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { FeaturesPage } from './pages/FeaturesPage';
import { AboutPage } from './pages/AboutPage';
import { DownloadPage } from './pages/DownloadPage';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

// App Pages
import { AppLayout } from './components/AppLayout';
import { Feed } from './pages/app/Feed';
import { Library } from './pages/app/Library';
import { Profile } from './pages/app/Profile';
import { Discover } from './pages/app/Discover';
import { Notifications } from './pages/app/Notifications';
import { Messages } from './pages/app/Messages';
import { Settings } from './pages/app/Settings';
import { PostDetail } from './pages/app/PostDetail';
import { UserProfile } from './pages/app/UserProfile';
import { AnimeDetail } from './pages/app/AnimeDetail';
import { DiscussionRoom } from './pages/app/DiscussionRoom';

import { Onboarding } from './pages/Onboarding';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';
import { CommunityGuidelines } from './pages/CommunityGuidelines';
import { AuthWall } from './components/AuthWall';
import { useAuthStore } from './store/useAuthStore';
import { Loader2 } from 'lucide-react';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

const MarketingLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen text-white relative scanlines">
    <Navbar />
    <main className="relative z-10">{children}</main>
    <Footer />
  </div>
);

// Shows a loading spinner while auth resolves, then renders children regardless of auth state
const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { loading, user } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D14] flex items-center justify-center text-[#FF6B35]">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  // Redirect logged-in users who haven't completed onboarding
  if (user && user.onboardingComplete === false) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

// Requires auth — shows AuthWall instead of redirecting so guests keep context
const RequireAuth: React.FC<{
  children: React.ReactNode;
  title?: string;
  message?: string;
}> = ({ children, title, message }) => {
  const { user, loading } = useAuthStore();
  if (loading) return null;
  if (!user) return <AuthWall title={title} message={message} />;
  return <>{children}</>;
};

// Onboarding requires auth but not completed onboarding
const OnboardingRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuthStore();
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D14] flex items-center justify-center text-[#FF6B35]">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (user.onboardingComplete === true) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const App: React.FC = () => {
  const initializeAuth = useAuthStore((s) => s.initialize);

  useEffect(() => {
    const unsubscribe = initializeAuth();
    return () => unsubscribe();
  }, [initializeAuth]);

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Public Marketing */}
        <Route path="/download" element={<MarketingLayout><DownloadPage /></MarketingLayout>} />
        <Route path="/features" element={<MarketingLayout><FeaturesPage /></MarketingLayout>} />
        <Route path="/about" element={<MarketingLayout><AboutPage /></MarketingLayout>} />
        <Route path="/privacy" element={<MarketingLayout><PrivacyPolicy /></MarketingLayout>} />
        <Route path="/terms" element={<MarketingLayout><TermsOfService /></MarketingLayout>} />
        <Route path="/guidelines" element={<MarketingLayout><CommunityGuidelines /></MarketingLayout>} />

        {/* Auth */}
        <Route path="/login" element={<div className="text-white scanlines"><Login /></div>} />
        <Route path="/register" element={<div className="text-white scanlines"><Register /></div>} />

        {/* Onboarding */}
        <Route path="/onboarding" element={<OnboardingRoute><Onboarding /></OnboardingRoute>} />

        {/* App Shell — accessible to guests, auth resolved before render */}
        <Route
          path="/"
          element={
            <AppShell>
              <div className="scanlines">
                <AppLayout />
              </div>
            </AppShell>
          }
        >
          {/* Public routes — guests can browse */}
          <Route index element={<Feed />} />
          <Route path="feed" element={<Navigate to="/" replace />} />
          <Route path="discover" element={<Discover />} />
          <Route path="post/:postId" element={<PostDetail />} />
          <Route path="user/:userId" element={<UserProfile />} />
          <Route path="anime/:animeId" element={<AnimeDetail />} />
          <Route path="discussion/:discussionId" element={<DiscussionRoom />} />

          {/* Auth-required routes — show AuthWall for guests */}
          <Route path="profile" element={
            <RequireAuth title="Your Profile" message="Sign in to view and manage your profile.">
              <Profile />
            </RequireAuth>
          } />
          <Route path="library" element={
            <RequireAuth title="Your Library" message="Sign in to track your anime and manage your watchlist.">
              <Library />
            </RequireAuth>
          } />
          <Route path="notifications" element={
            <RequireAuth title="Notifications" message="Sign in to see your likes, replies, and follows.">
              <Notifications />
            </RequireAuth>
          } />
          <Route path="messages" element={
            <RequireAuth title="Messages" message="Sign in to send and receive direct messages.">
              <Messages />
            </RequireAuth>
          } />
          <Route path="settings/*" element={
            <RequireAuth title="Settings" message="Sign in to manage your account settings.">
              <Settings />
            </RequireAuth>
          } />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
