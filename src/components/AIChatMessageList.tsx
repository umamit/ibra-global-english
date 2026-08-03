// AIChatMessageList.tsx - Daftar pesan AI chat
import { parseMarkdownSecure } from "@/utils/security";

interface Message { id: string; role: "user" | "assistant"; content: string; timestamp: Date; isStreaming?: boolean; }
interface Props { messages: Message[]; isLoading: boolean; isStreaming: boolean; copiedMsgId: string | null; activeSpeechId: string | null; messagesEndRef: React.RefObject<HTMLDivElement>; formatTime: (t: Date) => string; onCopy: (id: string, text: string) => void; onToggleSpeech: (id: string, text: string) => void; }

export default function AIChatMessageList({ messages, isLoading, isStreaming, copiedMsgId, activeSpeechId, messagesEndRef, formatTime, onCopy, onToggleSpeech }: Props) {
  const avatar = <div className="ai-msg-avatar"><img src="/assets/chatbot-logo.png" alt="Ibra AI Chatbot" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} /></div>;
  return (
    <div className="ai-chat-messages">
      {messages.map((msg) => (
        <div key={msg.id} className={`ai-chat-msg ${msg.role === "user" ? "user" : "assistant"}`}>
          {msg.role === "assistant" && avatar}
          <div className="ai-msg-bubble-wrap">
            <div className="ai-msg-bubble">
              <span dangerouslySetInnerHTML={{ __html: parseMarkdownSecure(msg.content) }} />
              {msg.isStreaming && <span className="ai-typing-cursor">|</span>}
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", marginTop: "4px" }}>
              <div className="ai-msg-time">{formatTime(msg.timestamp)}</div>
              {msg.role === "assistant" && (
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <button onClick={() => onCopy(msg.id, msg.content)} style={{ background: "none", border: "none", cursor: "pointer", color: copiedMsgId === msg.id ? "#10b981" : "var(--color-gray-400)", display: "inline-flex", alignItems: "center", padding: "2px", transition: "color 0.2s" }} title={copiedMsgId === msg.id ? "Tersalin!" : "Salin Teks"} aria-label="Salin jawaban AI">
                    {copiedMsgId === msg.id ? <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>}
                  </button>
                  <button onClick={() => onToggleSpeech(msg.id, msg.content)} style={{ background: "none", border: "none", cursor: "pointer", color: activeSpeechId === msg.id ? "var(--color-primary)" : "var(--color-gray-400)", display: "inline-flex", alignItems: "center", padding: "2px", transition: "color 0.2s" }} title={activeSpeechId === msg.id ? "Hentikan Suara" : "Dengarkan Suara"} aria-label={activeSpeechId === msg.id ? "Hentikan Suara" : "Dengarkan Suara"}>
                    {activeSpeechId === msg.id ? <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
      {isLoading && !isStreaming && (
        <div className="ai-chat-msg assistant">
          {avatar}
          <div className="ai-msg-bubble-wrap"><div className="ai-msg-bubble ai-typing"><span/><span/><span/></div></div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
