import { useEffect, useRef, useState } from 'react';
import './App.css';

const initialChats = [];

function App() {
  const [chats, setChats] = useState(() => {
    const savedChats = localStorage.getItem('ai-chat-chats');
    return savedChats ? JSON.parse(savedChats) : initialChats;
  });

  const [activeChatId, setActiveChatId] = useState(() => {
    const savedActiveChatId = localStorage.getItem('ai-chat-active-chat-id');
    return savedActiveChatId ? Number(savedActiveChatId) : null;
  });

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDraftChat, setIsDraftChat] = useState(false);
  const messagesEndRef = useRef(null);

  const activeChat =
    chats.find((chat) => chat.id === activeChatId) || null;

  useEffect(() => {
    if (activeChat) {
      setIsDraftChat(false);
    }
  }, [activeChat]);

  useEffect(() => {
    localStorage.setItem('ai-chat-chats', JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    if (activeChatId !== null && activeChatId !== undefined) {
      localStorage.setItem('ai-chat-active-chat-id', String(activeChatId));
    }
  }, [activeChatId]);


  useEffect(() => {
    if (isDraftChat) {
      return;
    }

    if (chats.length > 0 && !chats.some((chat) => chat.id === activeChatId)) {
      setActiveChatId(chats[0].id);
    }
  }, [chats, activeChatId, isDraftChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat, isLoading]);

  const handleNewChat = () => {
    if (isDraftChat) {
      return;
    }

    setActiveChatId(null);
    setIsDraftChat(true);
    setInputValue('');
  };

  const handleClearChat = () => {
    if (!activeChat) {
      return;
    }

    setChats((prevChats) => prevChats.filter((chat) => chat.id !== activeChatId));
    setActiveChatId(null);
    setIsDraftChat(true);
    setInputValue('');
  };

  const handleSendMessage = async () => {
    const trimmedMessage = inputValue.trim();

    if (!trimmedMessage || isLoading) {
      return;
    }

    let targetChatId = activeChatId;
    let creatingNewChat = false;

    if (isDraftChat || !activeChat) {
      targetChatId = Date.now();
      creatingNewChat = true;

      const nextTitle =
        trimmedMessage.length > 30
          ? `${trimmedMessage.slice(0, 30)}...`
          : trimmedMessage;

      const userMessage = {
        id: Date.now() + 1,
        role: 'user',
        content: trimmedMessage,
      };

      const newChat = {
        id: targetChatId,
        title: nextTitle || 'New Chat',
        messages: [userMessage],
      };

      setChats((prevChats) => [newChat, ...prevChats]);
      setActiveChatId(targetChatId);
      setIsDraftChat(false);
      setInputValue('');
      setIsLoading(true);

      try {
        const response = await fetch('http://localhost:5001/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [
              {
                role: 'user',
                content: trimmedMessage,
              },
            ],
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to get response from server');
        }

        const assistantMessage = {
          id: Date.now() + 2,
          role: 'assistant',
          content: data.reply,
        };

        setChats((prevChats) =>
          prevChats.map((chat) => {
            if (chat.id !== targetChatId) {
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
          id: Date.now() + 2,
          role: 'assistant',
          content: error.message || 'Something went wrong.',
        };

        setChats((prevChats) =>
          prevChats.map((chat) => {
            if (chat.id !== targetChatId) {
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

      return;
    }

    const userMessage = {
      id: Date.now() + 1,
      role: 'user',
      content: trimmedMessage,
    };

    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat.id !== targetChatId) {
          return chat;
        }

        const isEmptyChat = chat.messages.length === 0;
        const nextTitle =
          trimmedMessage.length > 30
            ? `${trimmedMessage.slice(0, 30)}...`
            : trimmedMessage;

        return {
          ...chat,
          title: isEmptyChat ? nextTitle || 'New Chat' : chat.title,
          messages: [...chat.messages, userMessage],
        };
      })
    );

    setInputValue('');
    setIsLoading(true);

    const conversationHistory = [
      ...activeChat.messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
      {
        role: 'user',
        content: trimmedMessage,
      },
    ];

    try {
      const response = await fetch('http://localhost:5001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: conversationHistory,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response from server');
      }

      const assistantMessage = {
        id: Date.now() + 2,
        role: 'assistant',
        content: data.reply,
      };

      setChats((prevChats) =>
        prevChats.map((chat) => {
          if (chat.id !== targetChatId) {
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
        id: Date.now() + 2,
        role: 'assistant',
        content: error.message || 'Something went wrong.',
      };

      setChats((prevChats) =>
        prevChats.map((chat) => {
          if (chat.id !== targetChatId) {
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
              onClick={() => {
                setActiveChatId(chat.id);
                setIsDraftChat(false);
              }}
              title={chat.title}
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
            disabled={!activeChat || isDraftChat || isLoading}
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

              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="welcome">
              <h1>
                {isDraftChat || chats.length === 0
                  ? 'Start a new conversation'
                  : 'What are you working on?'}
              </h1>
              <p>
                {isDraftChat || chats.length === 0
                  ? 'Type a message below to begin.'
                  : 'Start a conversation with the AI assistant.'}
              </p>
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