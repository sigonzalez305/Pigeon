import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AppShell } from './components/layout/AppShell';
import { Login } from './pages/Login';
import { OverworldHome } from './pages/OverworldHome';
import { Inbox } from './pages/Inbox';
import { ConversationThread } from './pages/ConversationThread';
import { SendFlow } from './pages/SendFlow';
import { Profile } from './pages/Profile';
import { useAuthStore } from './store/authStore';
import { useConversationStore } from './store/conversationStore';
import { connectWebSocket } from './services/websocket';

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
    <BrowserRouter>
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
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
