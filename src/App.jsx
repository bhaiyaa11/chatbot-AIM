import './App.css'
import ChatWindow from './components/chat_window.jsx'
import Ssidebar from './components/siderbar.jsx'
import Sheader from './components/sheader.jsx'
import { ChatProvider } from './contexts/ChatContext.jsx'
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx'
import Login from './user_login/login.jsx'

function App() {
  const { session, loading } = useAuth();

  // if (loading) {
  //   return <div style={{ padding: "2rem" }}>Loading...</div>;
  // }

  // 🔒 NOT LOGGED IN
  if (!session) {
    return <Login />;
  }

  // ✅ LOGGED IN
  return (
    <AuthProvider>
      <ChatProvider>
        <Sheader />
        <div className="app-layout">
          <Ssidebar />
          <ChatWindow />
        </div>
      </ChatProvider>
    </AuthProvider>
  );
}

export default App;





