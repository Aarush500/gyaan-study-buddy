import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { Component, type ErrorInfo, type ReactNode } from "react";
import { AnimatePresence } from "framer-motion";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { PageTransition } from "@/components/motion/PageTransition";
import Index from "./pages/Index.tsx";
import Login from "./pages/Login.tsx";
import Signup from "./pages/Signup.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Subject from "./pages/Subject.tsx";
import Chapter from "./pages/Chapter.tsx";
import DoubtChat from "./pages/DoubtChat.tsx";
import VerifyNotes from "./pages/VerifyNotes.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

class AppErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('App render failed', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen app-bg flex items-center justify-center px-4">
        <div className="max-w-md rounded-lg border bg-card p-6 text-center shadow-sm">
          <h1 className="font-display text-2xl font-extrabold">Preview recovered</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Something interrupted this screen. Reload once and the app will start fresh.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Reload app
          </button>
        </div>
      </div>
    );
  }
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/signup" element={<PageTransition><Signup /></PageTransition>} />
        <Route path="/dashboard" element={<ProtectedRoute><PageTransition><Dashboard /></PageTransition></ProtectedRoute>} />
        <Route path="/subject/:subjectId" element={<ProtectedRoute><PageTransition><Subject /></PageTransition></ProtectedRoute>} />
        <Route path="/subject/:subjectId/:chapterId" element={<ProtectedRoute><PageTransition><Chapter /></PageTransition></ProtectedRoute>} />
        <Route path="/doubt/:subjectId/:chapterId" element={<ProtectedRoute><PageTransition><DoubtChat /></PageTransition></ProtectedRoute>} />
        <Route path="/verify" element={<ProtectedRoute><PageTransition><VerifyNotes /></PageTransition></ProtectedRoute>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppErrorBoundary>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AnimatedRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </AppErrorBoundary>
  </QueryClientProvider>
);

export default App;
