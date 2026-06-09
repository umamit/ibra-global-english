"use client";

import { useState, useRef, useEffect } from "react";

const WELCOME_MESSAGE = {
  id: "welcome",
  role: "assistant",
  content: "Halo! 👋 Saya **Ibra AI Assistant**, siap membantu kamu!\n\nSaya bisa:\n• 📚 Jelaskan program kursus kami (Kids, Teens, Calistung)\n• 🗣️ Latih percakapan Bahasa Inggris\n• ✅ Koreksi grammar kamu\n• 🎯 Rekomendasikan program yang tepat\n\nMau mulai dari mana?",
  timestamp: new Date(),
};

function parseMarkdown(text) {
  if (!text) return "";
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/\n/g, "<br/>");
}

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);
  const [hasOpened, setHasOpened] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    setHasOpened(true);
    setUnreadCount(0);
  };

  const handleClose = () => setIsOpen(false);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const apiMessages = updatedMessages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }));

      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || "Gagal mendapat respons AI.");
      }

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.reply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `⚠️ ${err.message}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickReplies = [
    "Program untuk anak usia 7 tahun?",
    "Koreksi: I goes to school",
    "How to introduce myself?",
    "Cara daftar kursus?",
  ];

  const handleQuickReply = (text) => {
    setInput(text);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

  const RobotIcon = ({ size = 20 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      <line x1="8" y1="16" x2="8" y2="16"/>
      <line x1="16" y1="16" x2="16" y2="16"/>
      <circle cx="8" cy="16" r="1" fill="currentColor"/>
      <circle cx="16" cy="16" r="1" fill="currentColor"/>
    </svg>
  );

  return (
    <>
      {/* Jendela Chat */}
      <div className={`ai-chat-window ${isOpen ? "open" : ""}`} role="dialog" aria-label="Ibra AI Assistant">
        {/* Header */}
        <div className="ai-chat-header">
          <div className="ai-chat-header-info">
            <div className="ai-chat-avatar">
              <RobotIcon size={20} />
            </div>
            <div>
              <div className="ai-chat-header-name">Ibra AI Assistant</div>
              <div className="ai-chat-header-status">
                <span className="ai-status-dot"></span>
                Online — Siap Membantu
              </div>
            </div>
          </div>
          <button className="ai-chat-close-btn" onClick={handleClose} aria-label="Tutup chat">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Pesan */}
        <div className="ai-chat-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`ai-chat-msg ${msg.role === "user" ? "user" : "assistant"}`}>
              {msg.role === "assistant" && (
                <div className="ai-msg-avatar">
                  <RobotIcon size={13} />
                </div>
              )}
              <div className="ai-msg-bubble-wrap">
                <div className="ai-msg-bubble" dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.content) }} />
                <div className="ai-msg-time">{formatTime(msg.timestamp)}</div>
              </div>
            </div>
          ))}

          {/* Animasi mengetik */}
          {isLoading && (
            <div className="ai-chat-msg assistant">
              <div className="ai-msg-avatar"><RobotIcon size={13} /></div>
              <div className="ai-msg-bubble-wrap">
                <div className="ai-msg-bubble ai-typing">
                  <span/><span/><span/>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Replies */}
        {messages.length <= 1 && (
          <div className="ai-quick-replies">
            {quickReplies.map((qr, i) => (
              <button key={i} className="ai-quick-reply-btn" onClick={() => handleQuickReply(qr)}>
                {qr}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="ai-chat-input-area">
          <textarea
            ref={inputRef}
            className="ai-chat-input"
            placeholder="Ketik pesan... (Enter untuk kirim)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={isLoading}
          />
          <button
            className="ai-chat-send-btn"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            aria-label="Kirim"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>

        <div className="ai-chat-footer">
          Didukung oleh <strong>Google Gemini AI</strong>
        </div>
      </div>

      {/* Tombol FAB */}
      <button
        className={`ai-chat-fab ${isOpen ? "active" : ""}`}
        onClick={isOpen ? handleClose : handleOpen}
        aria-label="Buka Ibra AI Assistant"
        id="ai-chat-fab-btn"
      >
        {!isOpen && unreadCount > 0 && !hasOpened && (
          <span className="ai-chat-badge">{unreadCount}</span>
        )}
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <RobotIcon size={26} />
        )}
      </button>

      {/* Tooltip */}
      {!isOpen && !hasOpened && (
        <div className="ai-chat-tooltip">Tanya AI Asisten kami! 🤖</div>
      )}
    </>
  );
}
