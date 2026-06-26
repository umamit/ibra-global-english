"use client";

import { parseMarkdownSecure } from "@/utils/security";
import { useAIChat } from "@/hooks/useAIChat";
import "@/components/AIChatWidget.css";

export default function AICopilotWidget() {
  const {
    isOpen,
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
  } = useAIChat("/api/admin/ai-assist", "Halo Coach! 👋 Saya **Ibra AI Admin Copilot**, siap asisten harian Anda!\n\nBagaimana saya bisa membantu Anda hari ini?\n• 📢 **Ide Draf Pengumuman**: Tulis ide pesan baru untuk wali siswa\n• 📚 **Tips Mengajar**: Metode fun-learning Kids/Calistung\n• 📊 **Bantuan Administrasi**: Pertanyaan operasional kelas");

  const quickReplies = [
    "Draf pengumuman libur kelas?",
    "Ide game seru kelas Kids?",
    "Cara asyik mengajar membaca?",
  ];

  const RobotIcon = ({ size = 20 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
      <rect x="4" y="8" width="16" height="12" rx="2" />
      <line x1="9" y1="13" x2="9.01" y2="13" />
      <line x1="15" y1="13" x2="15.01" y2="13" />
      <path d="M9 17h6" />
    </svg>
  );

  const sendWithMode = (text) => {
    sendMessage(text);
  };

  return (
    <>
      <div className={`ai-chat-window ${isOpen ? "open" : ""}`} style={{ left: "20px", right: "auto", border: "1px solid rgba(166, 136, 73, 0.2)", boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }} role="dialog" aria-label="Ibra AI Admin Copilot">
        <div className="ai-chat-header" style={{ backgroundColor: "var(--color-primary-dark)" }}>
          <div className="ai-chat-header-info">
            <div className="ai-chat-avatar" style={{ backgroundColor: "var(--color-accent)", color: "white" }}>
              <RobotIcon size={20} />
            </div>
            <div>
              <div className="ai-chat-header-name">Ibra AI Admin Copilot</div>
              <div className="ai-chat-header-status">
                <span className="ai-status-dot" style={{ backgroundColor: "#22c55e" }}></span>
                Online — Siap Membantu Coach
              </div>
            </div>
          </div>
          <button className="ai-chat-close-btn" onClick={handleClose} aria-label="Tutup chat">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="ai-chat-messages" style={{ backgroundColor: "#fcfbf7" }}>
          {messages.map((msg) => (
            <div key={msg.id} className={`ai-chat-msg ${msg.role === "user" ? "user" : "assistant"}`}>
              {msg.role === "assistant" && (
                <div className="ai-msg-avatar" style={{ backgroundColor: "var(--color-primary)", color: "white" }}>
                  <RobotIcon size={13} />
                </div>
              )}
              <div className="ai-msg-bubble-wrap">
                <div className="ai-msg-bubble" style={{ 
                  backgroundColor: msg.role === "user" ? "var(--color-primary-dark)" : "white",
                  color: msg.role === "user" ? "white" : "var(--color-gray-800)",
                  border: msg.role === "user" ? "none" : "1px solid var(--color-gray-150)"
                }} dangerouslySetInnerHTML={{ __html: parseMarkdownSecure(msg.content) }} />
                <div className="ai-msg-time">{formatTime(msg.timestamp)}</div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="ai-chat-msg assistant">
              <div className="ai-msg-avatar" style={{ backgroundColor: "var(--color-primary)", color: "white" }}><RobotIcon size={13} /></div>
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
              <button key={i} className="ai-quick-reply-btn" onClick={() => sendWithMode(qr)}>{qr}</button>
            ))}
          </div>
        )}

        <div className="ai-chat-input-area" style={{ borderTop: "1px solid var(--color-gray-150)" }}>
          <textarea
            ref={inputRef}
            className="ai-chat-input"
            placeholder="Tanyakan ide, tips mengajar, dll..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={isLoading}
            aria-label="Ketik pesan ke Copilot AI"
          />
          <button className="ai-chat-send-btn" onClick={handleSend} disabled={!input.trim() || isLoading} aria-label="Kirim" style={{ color: "var(--color-primary-dark)" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>

      <button
        className={`ai-chat-fab ${isOpen ? "active" : ""}`}
        onClick={isOpen ? handleClose : handleOpen}
        aria-label={isOpen ? "Tutup Ibra AI Admin Copilot" : "Buka Ibra AI Admin Copilot"}
        id="ai-copilot-fab-btn"
        style={{ left: "20px", right: "auto", backgroundColor: "var(--color-primary-dark)", color: "white" }}
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <RobotIcon size={26} />
        )}
      </button>

      {!isOpen && !hasOpened && (
        <div className="ai-chat-tooltip" style={{ left: "80px", right: "auto" }}>Tanya Admin Copilot! 🤖</div>
      )}
    </>
  );
}