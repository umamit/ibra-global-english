"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import "./undangan.css";

interface WishItem {
  name: string;
  wish: string;
  attendance: string;
  created_at: string;
}

export default function UndanganClient() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [wishes, setWishes] = useState<WishItem[]>([]);
  const [loadingWishes, setLoadingWishes] = useState(true);
  
  // RSVP Form States
  const [name, setName] = useState("");
  const [attendance, setAttendance] = useState("Hadir");
  const [guests, setGuests] = useState("1");
  const [wishText, setWishText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const playerRef = useRef<any>(null);

  // Initialize Countdown
  useEffect(() => {
    const targetDate = new Date("2026-08-20T09:00:00").getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const diff = targetDate - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Wishes
  const fetchWishes = async () => {
    try {
      const res = await fetch("/api/wedding-rsvp?weddingId=mike-lila");
      if (res.ok) {
        const data = await res.json();
        setWishes(data.data || []);
      }
    } catch (e) {
      console.warn("Gagal memuat ucapan:", e);
    } finally {
      setLoadingWishes(false);
    }
  };

  useEffect(() => {
    fetchWishes();
  }, []);

  // Initialize YouTube Iframe Player
  useEffect(() => {
    const initPlayer = () => {
      if ((window as any).YT && (window as any).YT.Player) {
        playerRef.current = new (window as any).YT.Player("yt-player", {
          events: {
            onStateChange: (event: any) => {
              if (event.data === (window as any).YT.PlayerState.PLAYING) {
                setIsPlaying(true);
              } else {
                setIsPlaying(false);
              }
            }
          }
        });
      }
    };

    if (!(window as any).onYouTubeIframeAPIReady) {
      (window as any).onYouTubeIframeAPIReady = initPlayer;
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    } else {
      initPlayer();
    }
  }, []);

  const handleOpenInvitation = () => {
    setIsOpen(true);
    // Play YouTube music after user interaction to bypass autoplay restrictions
    try {
      if (playerRef.current && typeof playerRef.current.playVideo === "function") {
        playerRef.current.playVideo();
        setIsPlaying(true);
      }
    } catch (e) {
      console.warn("Gagal memutar musik otomatis:", e);
    }
  };

  const toggleMusic = () => {
    try {
      if (playerRef.current && typeof playerRef.current.getPlayerState === "function") {
        const state = playerRef.current.getPlayerState();
        if (state === (window as any).YT.PlayerState.PLAYING) {
          playerRef.current.pauseVideo();
          setIsPlaying(false);
        } else {
          playerRef.current.playVideo();
          setIsPlaying(true);
        }
      }
    } catch (e) {
      console.warn("Gagal mengubah status musik:", e);
    }
  };

  const handleRSVPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    setSubmitMessage(null);

    try {
      const res = await fetch("/api/wedding-rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weddingId: "mike-lila",
          name: name.trim(),
          attendance,
          guests: parseInt(guests) || 1,
          wish: wishText.trim() || null
        })
      });

      if (res.ok) {
        setSubmitMessage({ type: "success", text: "Terima kasih! Konfirmasi kehadiran Anda berhasil dikirim." });
        setName("");
        setWishText("");
        // Refresh wishes list
        fetchWishes();
      } else {
        const data = await res.json();
        throw new Error(data.error || "Gagal mengirim data.");
      }
    } catch (err: any) {
      setSubmitMessage({ type: "error", text: err.message || "Terjadi kesalahan koneksi. Silakan coba lagi." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="undangan-wrapper">
      {/* Invisible YouTube Iframe */}
      <div style={{ position: "absolute", width: "1px", height: "1px", opacity: 0, pointerEvents: "none", overflow: "hidden" }}>
        <iframe
          id="yt-player"
          src="https://www.youtube-nocookie.com/embed/hXb7p6s4C3U?enablejsapi=1&controls=0&rel=0&loop=1&playlist=hXb7p6s4C3U"
          allow="autoplay; encrypted-media"
          title="Bermuara Music Stream"
        />
      </div>

      {/* Cover Overlay Screen */}
      {!isOpen && (
        <div 
          className="cover-overlay" 
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            background: "linear-gradient(135deg, #164d57 0%, #216c7e 100%)",
            color: "#ffffff",
            padding: "2rem",
            fontFamily: "var(--font-outfit), sans-serif"
          }}
        >
          <div style={{ maxWidth: "480px" }}>
            <span style={{ fontSize: "0.875rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#A68849", fontWeight: "700" }}>The Wedding Invitation of</span>
            <h1 style={{ fontSize: "3rem", fontWeight: "800", margin: "1.5rem 0", fontFamily: "var(--font-outfit)" }}>Mike & Lila</h1>
            <p style={{ fontSize: "0.9375rem", color: "#eef6f8", opacity: 0.85, marginBottom: "2.5rem" }}>
              Kepada Bapak/Ibu/Saudara/i,<br />Kami mengundang Anda untuk merayakan momen bahagia pernikahan kami.
            </p>
            <button
              onClick={handleOpenInvitation}
              style={{
                background: "#A68849",
                color: "#ffffff",
                border: "none",
                borderRadius: "30px",
                padding: "1rem 2.25rem",
                fontWeight: "700",
                fontSize: "0.9375rem",
                cursor: "pointer",
                boxShadow: "0 6px 20px rgba(166, 136, 73, 0.3)",
                transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)"
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-3px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
            >
              ✉️ Buka Undangan
            </button>
          </div>
        </div>
      )}

      {/* Floating Music Button */}
      {isOpen && (
        <button className="floating-music-btn" onClick={toggleMusic} aria-label="Kontrol Musik Latar">
          <div className="music-wave">
            <span className={`music-bar ${isPlaying ? "playing" : ""}`} />
            <span className={`music-bar ${isPlaying ? "playing" : ""}`} />
            <span className={`music-bar ${isPlaying ? "playing" : ""}`} />
          </div>
        </button>
      )}

      {/* Main Invitation Layout */}
      {isOpen && (
        <>
          {/* 1. Hero / Cover */}
          <div className="undangan-hero">
            <span className="undangan-subtitle">Walimatul 'Ursy</span>
            <h1 className="undangan-title">Mike</h1>
            <div className="undangan-ampersand">&amp;</div>
            <h1 className="undangan-title">Lila</h1>
            <div className="undangan-date-badge">Kamis, 20 Agustus 2026</div>
          </div>

          <div className="undangan-container">
            {/* 2. Quote */}
            <div className="undangan-card">
              <p style={{ fontStyle: "italic", fontSize: "0.9375rem", color: "var(--color-gray-600)", lineHeight: "1.7", margin: 0 }}>
                "Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang."<br />
                <strong style={{ display: "block", marginTop: "1rem", color: "var(--color-primary-dark)", fontSize: "0.875rem" }}>— QS. Ar-Rum: 21</strong>
              </p>
            </div>

            {/* 3. Countdown Timer */}
            <div className="undangan-card">
              <h3 className="card-title">Menuju Hari Bahagia</h3>
              <div className="countdown-grid">
                <div className="countdown-box">
                  <span className="countdown-num">{timeLeft.days}</span>
                  <span className="countdown-label">Hari</span>
                </div>
                <div className="countdown-box">
                  <span className="countdown-num">{timeLeft.hours}</span>
                  <span className="countdown-label">Jam</span>
                </div>
                <div className="countdown-box">
                  <span className="countdown-num">{timeLeft.minutes}</span>
                  <span className="countdown-label">Menit</span>
                </div>
                <div className="countdown-box">
                  <span className="countdown-num">{timeLeft.seconds}</span>
                  <span className="countdown-label">Detik</span>
                </div>
              </div>
            </div>

            {/* 4. Event Info */}
            <div className="undangan-card">
              <h3 className="card-title">Detail Acara</h3>
              <div style={{ marginBottom: "2rem" }}>
                <span style={{ fontSize: "1.125rem", fontWeight: "800", color: "var(--color-accent)", display: "block", marginBottom: "0.5rem" }}>💍 Akad Nikah</span>
                <p style={{ margin: "0.25rem 0", fontSize: "0.9375rem", fontWeight: "700" }}>Pukul 09:00 WITA - Selesai</p>
              </div>
              <div style={{ marginBottom: "2rem" }}>
                <span style={{ fontSize: "1.125rem", fontWeight: "800", color: "var(--color-accent)", display: "block", marginBottom: "0.5rem" }}>🎉 Resepsi Pernikahan</span>
                <p style={{ margin: "0.25rem 0", fontSize: "0.9375rem", fontWeight: "700" }}>Pukul 11:00 WITA - Selesai</p>
              </div>
              <div>
                <span style={{ fontSize: "1.125rem", fontWeight: "800", color: "var(--color-primary)", display: "block", marginBottom: "0.5rem" }}>📍 Lokasi Acara</span>
                <p style={{ margin: "0.25rem 0", fontSize: "0.9375rem" }}>Waibau, Kecamatan Sanana</p>
                <p style={{ margin: "0.25rem 0", fontSize: "0.875rem", color: "var(--color-gray-500)", fontWeight: "600" }}>Kabupaten Kepulauan Sula, Maluku Utara</p>
                <a
                  href="https://maps.google.com/?q=Waibau,+Sanana,+Kepulauan+Sula,+Maluku+Utara"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-block",
                    marginTop: "1.5rem",
                    background: "rgba(166, 136, 73, 0.1)",
                    color: "var(--color-accent)",
                    border: "1px solid rgba(166, 136, 73, 0.2)",
                    borderRadius: "20px",
                    padding: "0.6rem 1.5rem",
                    fontSize: "0.875rem",
                    fontWeight: "700",
                    textDecoration: "none",
                    transition: "all 0.3s ease"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(166, 136, 73, 0.15)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(166, 136, 73, 0.1)")}
                >
                  🗺️ Buka Google Maps
                </a>
              </div>
            </div>

            {/* 5. RSVP Form */}
            <div className="undangan-card">
              <h3 className="card-title">Konfirmasi Kehadiran</h3>
              <form className="rsvp-form" onSubmit={handleRSVPSubmit}>
                <div className="form-group">
                  <label className="form-label" htmlFor="rsvp-name">Nama Tamu</label>
                  <input
                    id="rsvp-name"
                    className="form-input"
                    type="text"
                    placeholder="Masukkan nama lengkap Anda"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="rsvp-attendance">Konfirmasi Kehadiran</label>
                  <select
                    id="rsvp-attendance"
                    className="form-select"
                    value={attendance}
                    onChange={(e) => setAttendance(e.target.value)}
                    disabled={submitting}
                  >
                    <option value="Hadir">Hadir</option>
                    <option value="Tidak Hadir">Tidak Hadir</option>
                  </select>
                </div>

                {attendance === "Hadir" && (
                  <div className="form-group">
                    <label className="form-label" htmlFor="rsvp-guests">Jumlah Tamu</label>
                    <select
                      id="rsvp-guests"
                      className="form-select"
                      value={guests}
                      onChange={(e) => setGuests(e.target.value)}
                      disabled={submitting}
                    >
                      <option value="1">1 Orang</option>
                      <option value="2">2 Orang</option>
                      <option value="3">3 Orang</option>
                      <option value="4">4 Orang</option>
                    </select>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label" htmlFor="rsvp-wish">Ucapan &amp; Doa Restu</label>
                  <textarea
                    id="rsvp-wish"
                    className="form-textarea"
                    rows={4}
                    placeholder="Tuliskan ucapan selamat dan doa restu Anda"
                    value={wishText}
                    onChange={(e) => setWishText(e.target.value)}
                    disabled={submitting}
                  />
                </div>

                <button className="rsvp-submit-btn" type="submit" disabled={submitting || !name.trim()}>
                  {submitting ? "Mengirim..." : "Kirim Konfirmasi"}
                </button>

                {submitMessage && (
                  <div style={{
                    padding: "0.875rem",
                    borderRadius: "10px",
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    marginTop: "0.5rem",
                    backgroundColor: submitMessage.type === "success" ? "rgba(33, 108, 126, 0.1)" : "rgba(220, 53, 69, 0.1)",
                    color: submitMessage.type === "success" ? "var(--color-primary-dark)" : "#dc3545",
                    textAlign: "center"
                  }}>
                    {submitMessage.text}
                  </div>
                )}
              </form>
            </div>

            {/* 6. Guest Book Wishes Wall */}
            <div className="undangan-card">
              <h3 className="card-title">Doa Restu &amp; Ucapan</h3>
              {loadingWishes ? (
                <p style={{ fontSize: "0.875rem", color: "var(--color-gray-400)" }}>Memuat ucapan...</p>
              ) : wishes.length === 0 ? (
                <p style={{ fontSize: "0.875rem", color: "var(--color-gray-400)", fontStyle: "italic" }}>Belum ada ucapan. Jadilah yang pertama memberikan doa restu!</p>
              ) : (
                <div className="wishes-container">
                  {wishes.map((item, idx) => (
                    <div className="wish-item" key={idx}>
                      <div className="wish-meta">
                        <span className="wish-sender">{item.name}</span>
                        <span className={`wish-badge ${item.attendance === "Hadir" ? "hadir" : "tidak-hadir"}`}>
                          {item.attendance === "Hadir" ? " hadir" : " berhalangan"}
                        </span>
                      </div>
                      <p className="wish-text">{item.wish}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div style={{ textAlign: "center", marginTop: "4rem" }}>
              <Link
                href="/gallery"
                style={{
                  fontSize: "0.8125rem",
                  fontWeight: "700",
                  color: "var(--color-gray-500)",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  transition: "color 0.2s ease"
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-primary)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-gray-500)")}
              >
                ← Kembali ke Galeri Utama
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
