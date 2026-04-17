import { useEffect, useState } from 'react';
import './App.css';

const initialChats = [
  {
    id: 1,
    title: 'Frontend assessment',
    messages: [
      {
        id: 1,
        role: 'user',
        content: 'Build a simple AI-integrated web app using React.',
      },
      {
        id: 2,
        role: 'assistant',
        content:
          'Sure — we can create a clean chat interface with a sidebar, prompt input, loading states, and chat history.',
      },
    ],
  },
  {
    id: 2,
    title: 'Project ideas',
    messages: [
      {
        id: 1,
        role: 'user',
        content: 'Give me some AI web app project ideas.',
      },
      {
        id: 2,
        role: 'assistant',
        content:
          'You could build a document summarizer, interview practice assistant, code explainer, or a course Q&A assistant.',
      },
    ],
  },
  {
    id: 3,
    title: 'React questions',
    messages: [
      {
        id: 1,
        role: 'user',
        content: 'How should I structure a React frontend project?',
      },
      {
        id: 2,
        role: 'assistant',
        content:
          'Start with reusable components, keep state organized, and separate UI from API logic as the app grows.',
      },
    ],
  },
];

function App() {
  const [chats, setChats] = useState(() => {
    const savedChats = localStorage.getItem('ai-chat-chats');
    return savedChats ? JSON.parse(savedChats) : initialChats;
  });

  const [activeChatId, setActiveChatId] = useState(() => {
    const savedActiveChatId = localStorage.getItem('ai-chat-active-chat-id');
    return savedActiveChatId ? Number(savedActiveChatId) : initialChats[0].id;
  });

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const activeChat =
    chats.find((chat) => chat.id === activeChatId) || chats[0] || null;

  useEffect(() => {
    localStorage.setItem('ai-chat-chats', JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    if (activeChatId !== null && activeChatId !== undefined) {
      localStorage.setItem('ai-chat-active-chat-id', String(activeChatId));
    }
  }, [activeChatId]);

  useEffect(() => {
    if (chats.length > 0 && !chats.some((chat) => chat.id === activeChatId)) {
      setActiveChatId(chats[0].id);
    }
  }, [chats, activeChatId]);

  const handleNewChat = () => {
    const newChat = {
      id: Date.now(),
      title: 'New Chat',
      messages: [],
    };

    setChats((prevChats) => [newChat, ...prevChats]);
    setActiveChatId(newChat.id);
    setInputValue('');
  };

  const handleClearChat = () => {
    if (!activeChat) {
      return;
    }

    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat.id !== activeChatId) {
          return chat;
        }

        return {
          ...chat,
          title: 'New Chat',
          messages: [],
        };
      })
    );

    setInputValue('');
  };

  const handleSendMessage = async () => {
    const trimmedMessage = inputValue.trim();

    if (!trimmedMessage || isLoading || !activeChat) {
      return;
    }

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: trimmedMessage,
    };

    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat.id !== activeChatId) {
          return chat;
        }

        const isEmptyChat = chat.messages.length === 0;

        return {
          ...chat,
          title: isEmptyChat ? trimmedMessage.slice(0, 30) || 'New Chat' : chat.title,
          messages: [...chat.messages, userMessage],
        };
      })
    );

    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: trimmedMessage }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response from server');
      }

      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.reply,
      };

      setChats((prevChats) =>
        prevChats.map((chat) => {
          if (chat.id !== activeChatId) {
            return chat;
          }

          return {
            ...chat,
            messages: [...chat.messages, assistantMessage],
          };
        })
      );
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: error.message || 'Something went wrong.',
      };

      setChats((prevChats) =>
        prevChats.map((chat) => {
          if (chat.id !== activeChatId) {
            return chat;
          }

          return {
            ...chat,
            messages: [...chat.messages, errorMessage],
          };
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-header">
          <button className="new-chat-btn" onClick={handleNewChat}>
            + New Chat
          </button>
        </div>

        <div className="chat-list">
          {chats.map((chat) => (
            <button
              key={chat.id}
              className={`chat-item ${chat.id === activeChatId ? 'active' : ''}`}
              onClick={() => setActiveChatId(chat.id)}
            >
              {chat.title}
            </button>
          ))}
        </div>
      </aside>

      <main className="main">
        <div className="top-bar">
          <button
            className="clear-btn"
            onClick={handleClearChat}
            disabled={!activeChat || isLoading}
          >
            Clear Chat
          </button>
        </div>

        <div className="chat-window">
          {activeChat && activeChat.messages.length > 0 ? (
            <div className="messages">
              {activeChat.messages.map((message) => (
                <div
                  key={message.id}
                  className={`message ${message.role === 'user' ? 'user' : 'assistant'}`}
                >
                  <div className="message-role">
                    {message.role === 'user' ? 'You' : 'AI'}
                  </div>
                  <div className="message-content">{message.content}</div>
                </div>
              ))}

              {isLoading && (
                <div className="message assistant">
                  <div className="message-role">AI</div>
                  <div className="message-content">Thinking...</div>
                </div>
              )}
            </div>
          ) : (
            <div className="welcome">
              <h1>What are you working on?</h1>
              <p>Start a conversation with the AI assistant.</p>
            </div>
          )}
        </div>

        <div className="input-area">
          <input
            type="text"
            placeholder="Ask anything"
            className="prompt-input"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <button className="send-btn" onClick={handleSendMessage} disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;