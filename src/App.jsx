import './App.css'
import ChatWindow from './components/chat_window.jsx'
import Sidebar from './components/siderbar.jsx'
import Sheader from './components/sheader.jsx'
import { ChatProvider } from './contexts/ChatContext.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <Sheader />
        <div className="app-layout">
          <Sidebar />
          <ChatWindow />
        </div>
      </ChatProvider>
    </AuthProvider>
  )
}




export default App;