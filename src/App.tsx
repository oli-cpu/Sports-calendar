import { Navigate, Route, HashRouter, Routes } from 'react-router-dom';
import { ThemeProvider } from './stores/ThemeContext';
import { InterestsProvider, useInterests } from './stores/InterestsContext';
import { CalendarProvider } from './stores/CalendarContext';
import { AppShell } from './layouts/AppShell';
import { LandingPage } from './pages/LandingPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { EventsPage } from './pages/EventsPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { CalendarPage } from './pages/CalendarPage';
import { InterestsPage } from './pages/InterestsPage';
import { SettingsPage } from './pages/SettingsPage';

/** Sends first-time visitors to onboarding and everyone else past it. */
function RequireOnboarding({ children }: { children: React.ReactElement }) {
  const { hasOnboarded } = useInterests();
  if (!hasOnboarded) return <Navigate to="/onboarding" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />

      <Route
        element={
          <RequireOnboarding>
            <AppShell />
          </RequireOnboarding>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:id" element={<EventDetailPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/interests" element={<InterestsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <InterestsProvider>
        <CalendarProvider>
          <HashRouter>
            <AppRoutes />
          </HashRouter>
        </CalendarProvider>
      </InterestsProvider>
    </ThemeProvider>
  );
}
