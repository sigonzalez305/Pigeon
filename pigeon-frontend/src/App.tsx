import { BrowserRouter, HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AppShell } from './components/layout/AppShell';
import { Login } from './pages/Login';
import { OverworldHome } from './pages/OverworldHome';
import { Inbox } from './pages/Inbox';
import { ConversationThread } from './pages/ConversationThread';
import { SendFlow } from './pages/SendFlow';
import { FlightView } from './pages/FlightView';
import { Profile } from './pages/Profile';
import { useAuthStore } from './store/authStore';
import { useConversationStore } from './store/conversationStore';
import { connectWebSocket } from './services/websocket';
import { DEMO_MODE } from './config';

// A static host serves one file, so a deep link like /inbox would 404 on
// reload. Hash routing keeps every route inside index.html.
const Router = DEMO_MODE ? HashRouter : BrowserRouter;

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

function App() {
  const { token, isAuthenticated } = useAuthStore();
  const { fetchConversations } = useConversationStore();

  useEffect(() => {
    if (token && isAuthenticated) {
      connectWebSocket(token);
      fetchConversations();
    }
  }, [token, isAuthenticated]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/home" replace />} />
          <Route path="home" element={<OverworldHome />} />
          <Route path="inbox" element={<Inbox />} />
          <Route path="conversation/:conversationId" element={<ConversationThread />} />
          <Route path="send" element={<SendFlow />} />
          <Route path="flight" element={<FlightView />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
