"use client";

import { useState, useRef, useEffect } from "react";
import { parseMarkdownSecure } from "@/utils/security";
import { useAIChat } from "@/hooks/useAIChat";
import "@/components/AIChatWidget.css";
import posthog from "posthog-js";

const RobotIcon = ({ size = 20 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ overflow: "visible" }}
  >
    {/* Antena */}
    <path d="M12 6V2" />
    <circle cx="12" cy="2" r="1.2" fill="currentColor" />
    
    {/* Telinga / Samping Kepala */}
    <path d="M5 11h-1M19 11h-1" />
    
    {/* Kepala Bulat Robot */}
    <rect x="5" y="6" width="14" height="11" rx="4" fill="none" />
    
    {/* Mata Menyala */}
    <circle cx="9.5" cy="11.5" r="1.5" fill="currentColor" />
    <circle cx="14.5" cy="11.5" r="1.5" fill="currentColor" />
    
    {/* Senyum */}
    <path d="M9.5 14.5c.8 1 2.2 1 3 0" />

    {/* Leher / Badan Penyangga Kecil */}
    <path d="M9 17h6M10 17v2m4-2v2" />
  </svg>
);

export default function AIChatWidget() {
  const [unreadCount, setUnreadCount] = useState(1);
  const [activeSpeechId, setActiveSpeechId] = useState<string | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  const {
    isOpen, setIsOpen,
    messages,
    input, setInput,
    isLoading,
    isStreaming,
    hasOpened,
    messagesEndRef,
    inputRef,
    handleOpen,
    handleClose,
    handleResetChat,
    handleSend,
    handleKeyDown,
    formatTime,
    sendMessage,
  } = useAIChat("/api/ai-chat", "Halo! Saya **Ibra AI Assistant**, siap membantu kamu!\n\nSaya bisa:\n• Jelaskan program kursus kami (Kids, Teens, Calistung)\n• Latih percakapan Bahasa Inggris\n• Koreksi grammar kamu\n• Rekomendasikan program yang tepat\n\nMau mulai dari mana?");

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

  const handleCopyText = (msgId: string, text: string) => {
    const cleanText = text.replace(/\*\*/g, "").replace(/\*/g, "").replace(/`/g, "");
    navigator.clipboard.writeText(cleanText);
    setCopiedMsgId(msgId);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleToggleSpeech = (msgId: string, text: string) => {
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
            <div className="ai-chat-avatar">
              <img 
                src="/assets/chatbot-logo.png" 
                alt="Ibra AI Chatbot Logo" 
                style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} 
              />
            </div>
            <div>
              <div className="ai-chat-header-name">Ibra AI Assistant</div>
              <div className="ai-chat-header-status">
                <span className="ai-status-dot"></span>
                {isStreaming ? "Sedang Mengetik..." : "Online — Siap Membantu"}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <button 
              className="ai-chat-close-btn" 
              onClick={handleResetChat} 
              aria-label="Bersihkan Percakapan"
              title="Reset Chat"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                <path d="M3 3v5h5"/>
              </svg>
            </button>
            <button className="ai-chat-close-btn" onClick={onClose} aria-label="Tutup chat">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="ai-chat-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`ai-chat-msg ${msg.role === "user" ? "user" : "assistant"}`}>
              {msg.role === "assistant" && (
                <div className="ai-msg-avatar">
                  <img 
                    src="/assets/chatbot-logo.png" 
                    alt="Ibra AI Chatbot" 
                    style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} 
                  />
                </div>
              )}
              <div className="ai-msg-bubble-wrap">
                <div className="ai-msg-bubble">
                  <span dangerouslySetInnerHTML={{ __html: parseMarkdownSecure(msg.content) }} />
                  {msg.isStreaming && <span className="ai-typing-cursor">|</span>}
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", marginTop: "4px" }}>
                  <div className="ai-msg-time">{formatTime(msg.timestamp)}</div>
                  {msg.role === "assistant" && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      {/* Copy Button */}
                      <button
                        onClick={() => handleCopyText(msg.id, msg.content)}
                        style={{
                          background: "none", border: "none", cursor: "pointer",
                          color: copiedMsgId === msg.id ? "#10b981" : "var(--color-gray-400)",
                          display: "inline-flex", alignItems: "center", padding: "2px",
                          transition: "color 0.2s",
                        }}
                        title={copiedMsgId === msg.id ? "Tersalin!" : "Salin Teks"}
                        aria-label="Salin jawaban AI"
                      >
                        {copiedMsgId === msg.id ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                        )}
                      </button>
                      {/* Audio Button */}
                      <button
                        onClick={() => handleToggleSpeech(msg.id, msg.content)}
                        style={{
                          background: "none", border: "none", cursor: "pointer",
                          color: activeSpeechId === msg.id ? "var(--color-primary)" : "var(--color-gray-400)",
                          display: "inline-flex", alignItems: "center", padding: "2px",
                          transition: "color 0.2s",
                        }}
                        title={activeSpeechId === msg.id ? "Hentikan Suara" : "Dengarkan Suara"}
                        aria-label={activeSpeechId === msg.id ? "Hentikan Suara" : "Dengarkan Suara"}
                      >
                        {activeSpeechId === msg.id ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/></svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && !isStreaming && (
            <div className="ai-chat-msg assistant">
              <div className="ai-msg-avatar">
                <img 
                  src="/assets/chatbot-logo.png" 
                  alt="Ibra AI Chatbot" 
                  style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} 
                />
              </div>
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
            ref={inputRef as any}
            className="ai-chat-input"
            placeholder="Ketik pesan... (Enter untuk kirim)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={isLoading || isStreaming}
            aria-label="Ketik pesan ke AI Assistant"
          />
          <button className="ai-chat-send-btn" onClick={handleSend} disabled={!input.trim() || isLoading || isStreaming} aria-label="Kirim">
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
          <img 
            src="/assets/chatbot-logo.png" 
            alt="Buka Ibra AI Chatbot" 
            style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} 
          />
        )}
      </button>

      {!isOpen && !hasOpened && (
        <div className="ai-chat-tooltip" style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5.5z"/><path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z"/></svg>
          <span>Tanya AI Asisten kami!</span>
        </div>
      )}
    </>
  );
}