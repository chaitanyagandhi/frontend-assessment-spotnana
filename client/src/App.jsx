import './App.css';

function App() {
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-header">
          <button className="new-chat-btn">+ New Chat</button>
        </div>

        <div className="chat-list">
          <div className="chat-item active">Frontend assessment chat</div>
          <div className="chat-item">Project ideas</div>
          <div className="chat-item">React questions</div>
        </div>
      </aside>

      <main className="main">
        <div className="chat-window">
          <div className="welcome">
            <h1>What are you working on?</h1>
            <p>Start a conversation with the AI assistant.</p>
          </div>
        </div>

        <div className="input-area">
          <input
            type="text"
            placeholder="Ask anything"
            className="prompt-input"
          />
          <button className="send-btn">Send</button>
        </div>
      </main>
    </div>
  );
}

export default App;