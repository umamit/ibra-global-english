"use client";

import { useState, useRef, useEffect } from "react";
import { parseMarkdownSecure } from "@/utils/security";
import { useAIChat } from "@/hooks/useAIChat";
import "@/components/AIChatWidget.css";
import posthog from "posthog-js";

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

export default function AIChatWidget() {
  const [unreadCount, setUnreadCount] = useState(1);
  const [activeSpeechId, setActiveSpeechId] = useState(null);

  const {
    isOpen, setIsOpen,
    messages,
    input, setInput,
    isLoading,
    hasOpened,
    messagesEndRef,
    inputRef,
    handleOpen,
    handleClose,
    handleSend,
    handleKeyDown,
    formatTime,
    sendMessage,
  } = useAIChat("/api/ai-chat", "Halo! 👋 Saya **Ibra AI Assistant**, siap membantu kamu!\n\nSaya bisa:\n• 📚 Jelaskan program kursus kami (Kids, Teens, Calistung)\n• 🗣️ Latih percakapan Bahasa Inggris\n• ✅ Koreksi grammar kamu\n• 🎯 Rekomendasikan program yang tepat\n\nMau mulai dari mana?");

  // Cancel speech on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const onOpen = () => {
    handleOpen();
    setUnreadCount(0);
    posthog.capture("ai_chat_opened");
  };

  const onClose = () => {
    handleClose();
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setActiveSpeechId(null);
  };

  const handleToggleSpeech = (msgId, text) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    if (activeSpeechId === msgId) {
      window.speechSynthesis.cancel();
      setActiveSpeechId(null);
      return;
    }

    window.speechSynthesis.cancel();

    const cleanText = text
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/`/g, "")
      .replace(/[👋🤖📚🗣️✅🎯⚠️💡]/g, "")
      .replace(/\n/g, " ");

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const englishWords = ["hello", "english", "program", "course", "teens", "kids", "speaking", "grammar", "vocabulary", "class", "introduce"];
    const isEn = englishWords.some(word => cleanText.toLowerCase().includes(word));
    utterance.lang = isEn ? "en-US" : "id-ID";

    const voices = window.speechSynthesis.getVoices();
    const targetVoice = voices.find(v => v.lang.startsWith(utterance.lang));
    if (targetVoice) utterance.voice = targetVoice;

    utterance.onend = () => setActiveSpeechId(null);
    utterance.onerror = () => setActiveSpeechId(null);

    setActiveSpeechId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const quickReplies = [
    "Program untuk anak usia 7 tahun?",
    "Koreksi: I goes to school",
    "How to introduce myself?",
    "Cara daftar kursus?",
  ];



  return (
    <>
      <div className={`ai-chat-window ${isOpen ? "open" : ""}`} role="dialog" aria-label="Ibra AI Assistant">
        <div className="ai-chat-header">
          <div className="ai-chat-header-info">
            <div className="ai-chat-avatar"><RobotIcon size={20} /></div>
            <div>
              <div className="ai-chat-header-name">Ibra AI Assistant</div>
              <div className="ai-chat-header-status">
                <span className="ai-status-dot"></span>
                Online — Siap Membantu
              </div>
            </div>
          </div>
          <button className="ai-chat-close-btn" onClick={onClose} aria-label="Tutup chat">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="ai-chat-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`ai-chat-msg ${msg.role === "user" ? "user" : "assistant"}`}>
              {msg.role === "assistant" && (
                <div className="ai-msg-avatar"><RobotIcon size={13} /></div>
              )}
              <div className="ai-msg-bubble-wrap">
                <div className="ai-msg-bubble" dangerouslySetInnerHTML={{ __html: parseMarkdownSecure(msg.content) }} />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", marginTop: "4px" }}>
                  <div className="ai-msg-time">{formatTime(msg.timestamp)}</div>
                  {msg.role === "assistant" && (
                    <button
                      onClick={() => handleToggleSpeech(msg.id, msg.content)}
                      style={{
                        background: "none", border: "none", cursor: "pointer",
                        color: activeSpeechId === msg.id ? "var(--color-primary)" : "var(--color-gray-400)",
                        display: "inline-flex", alignItems: "center", padding: "2px",
                        marginRight: msg.role === "assistant" ? "0" : "auto",
                        transition: "color 0.2s",
                      }}
                      title={activeSpeechId === msg.id ? "Hentikan Suara" : "Dengarkan Suara"}
                      aria-label={activeSpeechId === msg.id ? "Hentikan Suara" : "Dengarkan Suara"}
                    >
                      {activeSpeechId === msg.id ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="ai-chat-msg assistant">
              <div className="ai-msg-avatar"><RobotIcon size={13} /></div>
              <div className="ai-msg-bubble-wrap">
                <div className="ai-msg-bubble ai-typing"><span/><span/><span/></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {messages.length === 1 && (
          <div className="ai-quick-replies">
            {quickReplies.map((qr, i) => (
              <button key={i} className="ai-quick-reply-btn" onClick={() => sendMessage(qr)}>{qr}</button>
            ))}
          </div>
        )}

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
            aria-label="Ketik pesan ke AI Assistant"
          />
          <button className="ai-chat-send-btn" onClick={handleSend} disabled={!input.trim() || isLoading} aria-label="Kirim">
            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>

      <button
        className={`ai-chat-fab ${isOpen ? "active" : ""}`}
        onClick={isOpen ? onClose : onOpen}
        aria-label={isOpen ? "Tutup Ibra AI Assistant" : "Buka Ibra AI Assistant"}
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

      {!isOpen && !hasOpened && (
        <div className="ai-chat-tooltip">Tanya AI Asisten kami! 🤖</div>
      )}
    </>
  );
}