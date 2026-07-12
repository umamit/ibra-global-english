"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import "./undangan.css";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

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

  const [guestName, setGuestName] = useState<string>("");
  const [copiedBank, setCopiedBank] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleCopyAccount = (number: string) => {
    navigator.clipboard.writeText(number);
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2000);
  };

  // Read guest name parameter from URL (safely on client side only to avoid Next.js build bailouts)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const toParam = params.get("to");
      if (toParam) {
        setGuestName(toParam);
        setName(toParam); // Auto-fill RSVP name input
      }
    }
  }, []);

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

  // Initialize HTML5 Audio Player
  useEffect(() => {
    const audio = new Audio("/audio/bermuara.mp3");
    audio.loop = true;
    audio.volume = 0.5;
    audioRef.current = audio;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  const handleOpenInvitation = () => {
    setIsOpen(true);
    // Play HTML5 background music after user interaction
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => {
        console.warn("Autoplay blocked or failed:", e);
      });
    }
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => {
        console.warn("Gagal memutar musik:", e);
      });
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  // GSAP animations for premium transitions
  useEffect(() => {
    if (!isOpen) return;

    // Small delay to ensure browser has rendered DOM
    const timer = setTimeout(() => {
      const isMobile = window.innerWidth <= 991;
      const scroller = isMobile ? window : ".undangan-right-pane";

      // Reset ScrollTrigger instances to prevent duplicates
      ScrollTrigger.getAll().forEach((t) => t.kill());

      // 1. Left overlay fade-in-up (Desktop sticky pane)
      gsap.fromTo(
        ".undangan-left-overlay",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1.2, ease: "power3.out", delay: 0.2 }
      );

      // 2. Card transitions (.scroll-reveal)
      gsap.utils.toArray(".scroll-reveal").forEach((card: any) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              scroller: scroller,
              start: "top 90%",
              toggleActions: "play none none none"
            }
          }
        );
      });

      // 3. Zoom transition (.reveal-zoom)
      gsap.utils.toArray(".reveal-zoom").forEach((card: any) => {
        gsap.fromTo(
          card,
          { opacity: 0, scale: 0.93 },
          {
            opacity: 1,
            scale: 1,
            duration: 1.2,
            ease: "back.out(1.2)",
            scrollTrigger: {
              trigger: card,
              scroller: scroller,
              start: "top 90%",
              toggleActions: "play none none none"
            }
          }
        );
      });

      // 4. Staggered timeline items
      gsap.fromTo(
        ".timeline-item",
        { opacity: 0, x: -30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".timeline-container",
            scroller: scroller,
            start: "top 80%"
          }
        }
      );

      // 5. Staggered gallery photos
      gsap.fromTo(
        ".gallery-item",
        { opacity: 0, scale: 0.9 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".gallery-grid",
            scroller: scroller,
            start: "top 85%"
          }
        }
      );
    }, 150);

    return () => {
      clearTimeout(timer);
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [isOpen]);

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
            <p style={{ fontSize: "0.9375rem", color: "#eef6f8", opacity: 0.85, marginBottom: "0.5rem" }}>
              Kepada Yth. Bapak/Ibu/Saudara/i:
            </p>
            {guestName ? (
              <div style={{ margin: "1rem 0 2.5rem 0" }}>
                <h2 style={{ fontSize: "1.75rem", fontWeight: "700", color: "#A68849", margin: "0 0 0.5rem 0", fontFamily: "var(--font-outfit)" }}>
                  {guestName}
                </h2>
                <span style={{ fontSize: "0.85rem", color: "#eef6f8", opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.05em" }}>Di Tempat</span>
              </div>
            ) : (
              <p style={{ fontSize: "0.9375rem", color: "#eef6f8", opacity: 0.85, marginBottom: "2.5rem" }}>
                Kami mengundang Anda untuk merayakan momen bahagia pernikahan kami.
              </p>
            )}
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
        <div className="undangan-split-layout">
          {/* Left Panel: Static Hero Image */}
          <div className="undangan-left-pane">
            <img 
              src="/assets/wedding_couple_cover.jpg" 
              alt="Mike & Lila" 
              className="undangan-static-img" 
              loading="eager"
            />
            <div className="undangan-left-overlay">
              <span className="left-subtitle">Walimatul 'Ursy</span>
              <h1 className="left-title">Mike &amp; Lila</h1>
              <div className="quote-divider" style={{ margin: "1rem auto", background: "var(--color-accent)" }} />
              <p className="left-date">Kamis, 20 Agustus 2026</p>
            </div>
          </div>

          {/* Right Panel: Scrollable Content */}
          <div className="undangan-right-pane">
            <div className="undangan-container">
            {/* 2. Opening & Quote */}
            <div className="undangan-card text-center scroll-reveal">
              <span className="ornament-floral">🌸</span>
              <h2 className="section-greeting-title">Assalamualaikum Wr. Wb.</h2>
              <p className="section-greeting-intro">
                Dengan memohon rahmat dan ridho Allah SWT, kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri hari bahagia pernikahan kami:
              </p>
              
              <div className="quote-divider" />
              
              <p className="quote-text">
                "Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang. Sungguh, pada yang demikian itu benar-benar terdapat tanda-tanda bagi kaum yang berpikir."
              </p>
              <strong className="quote-ref">— QS. Ar-Rum: 21</strong>
            </div>

            {/* 3. Mempelai / Groom & Bride Details */}
            <div className="mempelai-grid scroll-reveal">
              {/* Mempelai Pria */}
              <div className="undangan-card mempelai-card">
                <div className="avatar-frame">
                  <div className="avatar-initials">M</div>
                </div>
                <h3 className="mempelai-name">Mike Peterson</h3>
                <span className="mempelai-role">Mempelai Pria</span>
                <div className="mempelai-parent">
                  <p>Putra dari:</p>
                  <strong>Bapak Peterson &amp; Ibu Peterson</strong>
                </div>
              </div>

              {/* Mempelai Wanita */}
              <div className="undangan-card mempelai-card">
                <div className="avatar-frame">
                  <div className="avatar-initials">L</div>
                </div>
                <h3 className="mempelai-name">Lila Safitri</h3>
                <span className="mempelai-role">Mempelai Wanita</span>
                <div className="mempelai-parent">
                  <p>Putri dari:</p>
                  <strong>Bapak Safitri &amp; Ibu Safitri</strong>
                </div>
              </div>
            </div>

            {/* 4. Countdown Timer */}
            <div className="undangan-card text-center reveal-zoom">
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

            {/* 5. Detail Acara (Akad & Resepsi) */}
            <div className="undangan-card scroll-reveal">
              <h3 className="card-title text-center">Detail Acara</h3>
              <div className="event-item">
                <span className="event-icon">💍</span>
                <div className="event-info">
                  <h4 className="event-name">Akad Nikah</h4>
                  <p className="event-detail">Kamis, 20 Agustus 2026</p>
                  <p className="event-detail font-bold">Pukul 09:00 WITA - Selesai</p>
                </div>
              </div>

              <div className="event-item">
                <span className="event-icon">🎉</span>
                <div className="event-info">
                  <h4 className="event-name">Resepsi Pernikahan</h4>
                  <p className="event-detail">Kamis, 20 Agustus 2026</p>
                  <p className="event-detail font-bold">Pukul 11:00 WITA - Selesai</p>
                </div>
              </div>

              <div className="venue-section">
                <h4 className="venue-title">📍 Lokasi Acara</h4>
                <p className="venue-address font-bold">Kediaman Mempelai Wanita</p>
                <p className="venue-address-details">Waibau, Kecamatan Sanana, Kabupaten Kepulauan Sula, Maluku Utara</p>
                <a
                  href="https://maps.google.com/?q=Waibau,+Sanana,+Kepulauan+Sula,+Maluku+Utara"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="maps-button"
                >
                  🗺️ Buka Google Maps
                </a>
              </div>
            </div>

            {/* 6. Perjalanan Cinta / Love Story */}
            <div className="undangan-card scroll-reveal">
              <h3 className="card-title text-center">Cerita Cinta</h3>
              <div className="timeline-container">
                <div className="timeline-item">
                  <div className="timeline-badge">2023</div>
                  <div className="timeline-panel">
                    <h4 className="timeline-title">Awal Pertemuan</h4>
                    <p className="timeline-body">Tuhan mempertemukan kami dalam sebuah kesempatan yang tidak terduga, menumbuhkan awal rasa saling percaya.</p>
                  </div>
                </div>

                <div className="timeline-item">
                  <div className="timeline-badge">2025</div>
                  <div className="timeline-panel">
                    <h4 className="timeline-title">Ikatan Suci (Lamaran)</h4>
                    <p className="timeline-body">Dengan restu kedua orang tua, kami memantapkan niat untuk melangkah lebih jauh menuju jenjang ikatan pernikahan.</p>
                  </div>
                </div>

                <div className="timeline-item">
                  <div className="timeline-badge">2026</div>
                  <div className="timeline-panel">
                    <h4 className="timeline-title">Pernikahan</h4>
                    <p className="timeline-body">Hari bersejarah di mana kami berjanji untuk saling setia mendampingi dalam suka maupun duka selamanya.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 7. Galeri Foto */}
            <div className="undangan-card scroll-reveal">
              <h3 className="card-title text-center">Galeri Momen Indah</h3>
              <div className="gallery-grid">
                <div className="gallery-item">
                  <img 
                    src="/assets/prewedding_1.jpg" 
                    alt="Mike & Lila Momen Indah" 
                    className="gallery-img" 
                    loading="lazy" 
                    width={400}
                    height={300}
                    style={{ aspectRatio: "4/3", objectFit: "cover", width: "100%", height: "auto", borderRadius: "10px" }}
                  />
                </div>
                <div className="gallery-item">
                  <img 
                    src="/assets/prewedding_2.jpg" 
                    alt="Mike & Lila Kebersamaan" 
                    className="gallery-img" 
                    loading="lazy" 
                    width={400}
                    height={300}
                    style={{ aspectRatio: "4/3", objectFit: "cover", width: "100%", height: "auto", borderRadius: "10px" }}
                  />
                </div>
                <div className="gallery-item">
                  <img 
                    src="/assets/prewedding_3.jpg" 
                    alt="Cincin Pernikahan Mike & Lila" 
                    className="gallery-img" 
                    loading="lazy" 
                    width={400}
                    height={300}
                    style={{ aspectRatio: "4/3", objectFit: "cover", width: "100%", height: "auto", borderRadius: "10px" }}
                  />
                </div>
                <div className="gallery-item">
                  <img 
                    src="/assets/prewedding_4.jpg" 
                    alt="Mike & Lila Senja Bahagia" 
                    className="gallery-img" 
                    loading="lazy" 
                    width={400}
                    height={300}
                    style={{ aspectRatio: "4/3", objectFit: "cover", width: "100%", height: "auto", borderRadius: "10px" }}
                  />
                </div>
              </div>
            </div>

            {/* 8. Kado Online / Amplop Digital */}
            <div className="undangan-card text-center scroll-reveal">
              <h3 className="card-title">Kado Digital</h3>
              <p className="gift-intro">
                Tanpa mengurangi rasa hormat, bagi Bapak/Ibu/Saudara/i yang ingin memberikan tanda kasih untuk kami, dapat melalui rekening berikut:
              </p>

              <div className="atm-card">
                <div className="atm-card-header">
                  <span className="bank-logo">BANK MANDIRI</span>
                  <span className="chip-logo">📠</span>
                </div>
                <div className="atm-card-number">
                  186-00-0216402-4
                </div>
                <div className="atm-card-holder">
                  AN. LILA SAFITRI
                </div>
              </div>

              <button
                className="copy-btn"
                onClick={() => handleCopyAccount("1860002164024")}
              >
                {copiedBank ? "✓ Nomor Rekening Tersalin!" : "📋 Salin Nomor Rekening"}
              </button>
            </div>

            {/* 9. RSVP Form */}
            <div className="undangan-card scroll-reveal">
              <h3 className="card-title text-center">Konfirmasi Kehadiran</h3>
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

            {/* 10. Guest Book Wishes Wall */}
            <div className="undangan-card scroll-reveal">
              <h3 className="card-title text-center">Doa Restu &amp; Ucapan</h3>
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
          </div>
        </div>
      )}
    </div>
  );
}
