import { ChatSidebar } from "./components/ChatSidebar";
import "./App.css";

function App() {
  return (
    <div className="app">
      <ChatSidebar />
      <main className="main-content">
        <div className="welcome-section">
          <h1>Welcome to Xelma</h1>
          <p>Your community-driven prediction platform</p>
        </div>
      </main>
    </div>
  );
}

export default App;
