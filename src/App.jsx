import { lazy } from 'react';
import * as React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { AdminProvider } from './contexts/AdminContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { LoadingProvider } from './contexts/LoadingContext';
import ErrorBoundary from './components/ErrorBoundary';
import LazyLoad from './components/LazyLoad';
import Header from './components/Header';
import SiteFooter from './components/SiteFooter';
import AppLoadingScreen from './components/AppLoadingScreen';
import Home from './pages/Home';
import AdminProtected from './components/admin/AdminProtected';
import ScrollToTop from "./components/ScrollToTop";
import { resetBodyScroll } from './utils/dom';


const routePrefetchers = {
  '/about': () => import('./pages/About'),
  '/team': () => import('./pages/Teams'),
  '/fun-events': () => import('./pages/FunEvents'),
  '/categories': () => import('./pages/Categories'),
  '/guidelines': () => import('./pages/Guidelines'),
  '/faq': () => import('./pages/FAQ'),
  '/schedule': () => import('./pages/Schedule'),
  '/login': () => import('./pages/Login'),
  '/register': () => import('./pages/Register'),
  '/submit': () => import('./pages/Submit'),
  '/dashboard': () => import('./pages/Dashboard'),
  '/payment': () => import('./pages/Payment'),
  '/admin/login': () => import('./pages/admin/AdminLogin'),
};

const prefetchedRoutes = new Set();

export const prefetchRoute = (path) => {
  const prefetch = routePrefetchers[path];
  if (!prefetch || prefetchedRoutes.has(path)) return;
  prefetchedRoutes.add(path);
  prefetch().catch(() => {
    prefetchedRoutes.delete(path);
  });
};


// Lazy load pages for better performance
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Submit = lazy(() => import('./pages/Submit'));
const WorkshopSubmit = lazy(() => import('./pages/WorkshopSubmit'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Payment = lazy(() => import('./pages/Payment'));
const About = lazy(() => import('./pages/About'));
const Team = lazy(() => import('./pages/Teams'));
const Categories = lazy(() => import('./pages/Categories'));
const Schedule = lazy(() => import('./pages/Schedule'));
const Guidelines = lazy(() => import('./pages/Guidelines'));
const FAQ = lazy(() => import('./pages/FAQ'));
const FunEvents = lazy(() => import('./pages/FunEvents'));

// Admin pages
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const Registrations = lazy(() => import('./pages/admin/Registrations'));
const ManageEvents = lazy(() => import('./pages/admin/ManageEvents'));
const Events = lazy(() => import('./pages/admin/Events'));
const Discounts = lazy(() => import('./pages/admin/Discounts'));
const TeamPageEditor = lazy(() => import('./pages/admin/TeamPageEditor'));
const DecorativeEffects = lazy(() => import('./components/DecorativeEffects'));

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <AppLoadingScreen message="Checking your account..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <LazyLoad fallback={<AppLoadingScreen />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/team" element={<Team />} />
        <Route
          path="/categories"
          element={<Categories />}
        />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/guidelines" element={<Guidelines />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/fun-events" element={<FunEvents />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/submit" 
          element={
            <ProtectedRoute>
              <Submit />
            </ProtectedRoute>
          } 
        />
        <Route
          path="/submit/workshop"
          element={
            <ProtectedRoute>
              <WorkshopSubmit />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/payment" 
          element={
            <ProtectedRoute>
              <Payment />
            </ProtectedRoute>
          } 
        />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route 
          path="/admin" 
          element={
            <AdminProtected>
              <AdminDashboard />
            </AdminProtected>
          } 
        />
        <Route 
          path="/admin/registrations" 
          element={
            <AdminProtected>
              <Registrations />
            </AdminProtected>
          } 
        />
        <Route 
          path="/admin/submission-events" 
          element={
            <AdminProtected>
              <Events />
            </AdminProtected>
          } 
        />
        <Route 
          path="/admin/events" 
          element={
            <AdminProtected>
              <ManageEvents />
            </AdminProtected>
          } 
        />
        <Route 
          path="/admin/discounts" 
          element={
            <AdminProtected>
              <Discounts />
            </AdminProtected>
          } 
        />
        <Route
          path="/admin/team"
          element={
            <AdminProtected>
              <TeamPageEditor />
            </AdminProtected>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </LazyLoad>
  );
}

function AppShell({ showDecorativeEffects }) {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      {showDecorativeEffects ? (
        <React.Suspense fallback={null}>
          <DecorativeEffects />
        </React.Suspense>
      ) : null}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {!isAdminRoute && <Header />}
        <AppRoutes />
        {!isAdminRoute && <SiteFooter />}
      </div>
    </>
  );
}

export default function App() {
  const [showDecorativeEffects, setShowDecorativeEffects] = React.useState(false);

  React.useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const isSmallViewport = window.innerWidth < 768;

    if (prefersReducedMotion || isCoarsePointer || isSmallViewport) return;

    const revealEffects = () => setShowDecorativeEffects(true);

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(revealEffects, { timeout: 1800 });
    } else {
      window.setTimeout(revealEffects, 300);
    }
  }, []);

  React.useEffect(() => {
    const forceUnlockScroll = () => {
      const hasActiveOverlay = Boolean(document.querySelector('.modal, .mobile-popup.open'));
      if (hasActiveOverlay) return;

      resetBodyScroll();
      document.documentElement.style.overflowY = 'auto';
      document.body.style.overflowY = 'auto';
    };

    forceUnlockScroll();
    window.addEventListener('focus', forceUnlockScroll);
    window.addEventListener('pageshow', forceUnlockScroll);
    document.addEventListener('visibilitychange', forceUnlockScroll);

    return () => {
      window.removeEventListener('focus', forceUnlockScroll);
      window.removeEventListener('pageshow', forceUnlockScroll);
      document.removeEventListener('visibilitychange', forceUnlockScroll);
    };
  }, []);

  React.useEffect(() => {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const effectiveType = connection?.effectiveType || '';
    const shouldSkipPrefetch = connection?.saveData || ['slow-2g', '2g'].includes(effectiveType);

    if (shouldSkipPrefetch) return;

    const prefetchCommonRoutes = () => {
      prefetchRoute('/about');
      prefetchRoute('/categories');
      prefetchRoute('/guidelines');
    };

    let prefetched = false;

    const runPrefetchOnce = () => {
      if (prefetched) return;
      prefetched = true;
      prefetchCommonRoutes();
    };

    const onFirstInteraction = () => {
      runPrefetchOnce();
    };

    window.addEventListener('pointerdown', onFirstInteraction, { once: true, passive: true });
    window.addEventListener('keydown', onFirstInteraction, { once: true });

    const fallbackTimer = window.setTimeout(runPrefetchOnce, 4500);

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(runPrefetchOnce, { timeout: 3500 });
    } else {
      window.setTimeout(runPrefetchOnce, 1600);
    }

    return () => {
      window.removeEventListener('pointerdown', onFirstInteraction);
      window.removeEventListener('keydown', onFirstInteraction);
      window.clearTimeout(fallbackTimer);
    };
  }, []);

  return (
    <ErrorBoundary>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <ScrollToTop />
        <NotificationProvider>
          <LoadingProvider>
            <AuthProvider>
              <AdminProvider>
                <AppShell showDecorativeEffects={showDecorativeEffects} />
              </AdminProvider>
            </AuthProvider>
          </LoadingProvider>
        </NotificationProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

