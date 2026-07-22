"use client";
import React, { useState } from "react";
import "./InteractiveMap.css";

interface RoomDetail {
  id: string;
  name: string;
  type: string;
  desc: string;
  capacity?: string;
}

const LANTAI_1_ROOMS: RoomDetail[] = [
  {
    id: "l1-teras",
    name: "Teras & Ruang Tunggu",
    type: "Lobi Publik",
    desc: "Teras semi-terbuka di lantai 1 yang nyaman, dilengkapi dengan meja dan kursi tunggu kayu untuk orang tua wali murid yang sedang menjemput."
  },
  {
    id: "l1-parkir",
    name: "Area Parkir Utama",
    type: "Fasilitas Bersama",
    desc: "Halaman paving block depan gedung yang luas dan aman untuk memarkir sepeda motor dan sepeda roda dua.",
    capacity: "Hingga 12 Motor / Sepeda"
  },
  {
    id: "l1-rumah",
    name: "Area Kediaman Rumah Tinggal",
    type: "Area Privat",
    desc: "Bagian dalam lantai 1 yang digunakan sebagai kediaman pribadi pemilik gedung."
  },
  {
    id: "l1-tangga",
    name: "Akses Tangga Kayu",
    type: "Penghubung Lantai",
    desc: "Tangga kayu luar dengan handrail kokoh di sisi kiri gedung untuk akses langsung ke indekos dan kelas di lantai 2."
  }
];

const LANTAI_2_ROOMS: RoomDetail[] = [
  {
    id: "l2-kamar10",
    name: "Kamar 10 (Kelas Ibra Global English)",
    type: "Ruang Kelas Utama",
    desc: "Pusat pembelajaran interaktif Ibra Global English. Didesain ramah anak, ber-AC, dan menggunakan metode Speaking-First.",
    capacity: "Maksimal 10 Siswa per Kelas"
  },
  {
    id: "l2-kos",
    name: "Kamar Indekos (1 - 9)",
    type: "Hunian Semi-Privat",
    desc: "Kamar-kamar sewa indekos harian/bulanan di lantai 2 dengan akses koridor luar yang sejuk."
  },
  {
    id: "l2-koridor",
    name: "Koridor & Balkon Luar",
    type: "Akses Publik Lantai 2",
    desc: "Selasar luar berpagar pengaman besi di lantai 2, tempat jemuran pakaian, pot tanaman hijau, dan area bersantai menghadap pemandangan."
  }
];

export default function InteractiveMap() {
  const [activeFloor, setActiveFloor] = useState<1 | 2>(2);
  const [selectedRoom, setSelectedRoom] = useState<RoomDetail>(LANTAI_2_ROOMS[0]);
  const [hoveredRoomId, setHoveredRoomId] = useState<string | null>(null);

  const handleRoomClick = (room: RoomDetail) => {
    setSelectedRoom(room);
  };

  return (
    <section id="interactive-map" className="map-section scroll-fade-up">
      <div className="container">
        <div className="section-header">
          <h2>Denah Gedung Interaktif</h2>
          <p>Jelajahi tata letak fisik Ibra Global English Bobong dari lantai 1 hingga lantai 2</p>
        </div>

        <div className="map-floor-switcher">
          <button 
            type="button" 
            className={`floor-btn ${activeFloor === 1 ? "active" : ""}`}
            onClick={() => {
              setActiveFloor(1);
              setSelectedRoom(LANTAI_1_ROOMS[0]);
            }}
          >
            Lantai 1: Rumah Tinggal
          </button>
          <button 
            type="button" 
            className={`floor-btn ${activeFloor === 2 ? "active" : ""}`}
            onClick={() => {
              setActiveFloor(2);
              setSelectedRoom(LANTAI_2_ROOMS[0]);
            }}
          >
            Lantai 2: Kelas IGE & Kos
          </button>
        </div>

        <div className="map-grid-layout">
          {/* Left Side: SVG Map representation */}
          <div className="map-canvas-container">
            {activeFloor === 1 ? (
              <svg viewBox="0 0 600 350" className="svg-map-canvas" xmlns="http://www.w3.org/2000/svg">
                {/* Background Grid */}
                <rect width="100%" height="100%" fill="var(--color-bg-teal-50)" rx="14" />
                
                {/* Main House Footprint */}
                <g 
                  className={`map-interactive-group ${selectedRoom.id === "l1-rumah" ? "selected" : ""} ${hoveredRoomId === "l1-rumah" ? "hovered" : ""}`}
                  onClick={() => handleRoomClick(LANTAI_1_ROOMS[2])}
                  onMouseEnter={() => setHoveredRoomId("l1-rumah")}
                  onMouseLeave={() => setHoveredRoomId(null)}
                >
                  <rect x="150" y="60" width="300" height="200" rx="10" className="room-poly house-main" />
                  <text x="300" y="160" textAnchor="middle" className="room-label">Kediaman Rumah Tinggal</text>
                </g>

                {/* Parent Waiting Area / Front Terrace */}
                <g 
                  className={`map-interactive-group ${selectedRoom.id === "l1-teras" ? "selected" : ""} ${hoveredRoomId === "l1-teras" ? "hovered" : ""}`}
                  onClick={() => handleRoomClick(LANTAI_1_ROOMS[0])}
                  onMouseEnter={() => setHoveredRoomId("l1-teras")}
                  onMouseLeave={() => setHoveredRoomId(null)}
                >
                  <rect x="450" y="80" width="100" height="160" rx="10" className="room-poly lobby-area" />
                  <text x="500" y="150" textAnchor="middle" className="room-label">Teras &</text>
                  <text x="500" y="170" textAnchor="middle" className="room-label">R. Tunggu</text>
                </g>

                {/* Parking Lot */}
                <g 
                  className={`map-interactive-group ${selectedRoom.id === "l1-parkir" ? "selected" : ""} ${hoveredRoomId === "l1-parkir" ? "hovered" : ""}`}
                  onClick={() => handleRoomClick(LANTAI_1_ROOMS[1])}
                  onMouseEnter={() => setHoveredRoomId("l1-parkir")}
                  onMouseLeave={() => setHoveredRoomId(null)}
                >
                  <rect x="350" y="270" width="200" height="60" rx="10" className="room-poly parking-area" />
                  <text x="450" y="305" textAnchor="middle" className="room-label">Area Parkir Utama</text>
                </g>

                {/* Left Side Outdoor Staircase */}
                <g 
                  className={`map-interactive-group ${selectedRoom.id === "l1-tangga" ? "selected" : ""} ${hoveredRoomId === "l1-tangga" ? "hovered" : ""}`}
                  onClick={() => handleRoomClick(LANTAI_1_ROOMS[3])}
                  onMouseEnter={() => setHoveredRoomId("l1-tangga")}
                  onMouseLeave={() => setHoveredRoomId(null)}
                >
                  <rect x="50" y="60" width="80" height="200" rx="10" className="room-poly stair-area" />
                  <text x="90" y="160" textAnchor="middle" className="room-label stair-label">Tangga</text>
                  {/* Stair steps lines */}
                  {Array.from({ length: 8 }).map((_, i) => (
                    <line key={i} x1="55" y1={80 + i * 20} x2="125" y2={80 + i * 20} stroke="var(--color-primary-dark)" strokeWidth="1" opacity="0.3" />
                  ))}
                </g>
              </svg>
            ) : (
              <svg viewBox="0 0 600 350" className="svg-map-canvas" xmlns="http://www.w3.org/2000/svg">
                {/* Background Grid */}
                <rect width="100%" height="100%" fill="var(--color-bg-teal-50)" rx="14" />

                {/* Corridor in the middle */}
                <g 
                  className={`map-interactive-group ${selectedRoom.id === "l2-koridor" ? "selected" : ""} ${hoveredRoomId === "l2-koridor" ? "hovered" : ""}`}
                  onClick={() => handleRoomClick(LANTAI_2_ROOMS[2])}
                  onMouseEnter={() => setHoveredRoomId("l2-koridor")}
                  onMouseLeave={() => setHoveredRoomId(null)}
                >
                  <rect x="130" y="145" width="420" height="30" rx="4" className="room-poly corridor-area" style={{ fill: "rgba(33, 108, 126, 0.08)" }} />
                  <text x="340" y="164" textAnchor="middle" className="room-label">Koridor Tengah & Selasar</text>
                </g>

                {/* Stairs on left */}
                <g className="map-static-group">
                  <rect x="50" y="55" width="80" height="210" rx="10" className="room-poly stair-disabled" />
                  <text x="90" y="160" textAnchor="middle" className="room-label stair-label" opacity="0.6">Tangga</text>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <line key={i} x1="55" y1={75 + i * 22} x2="125" y2={75 + i * 22} stroke="var(--color-gray-400)" strokeWidth="1" opacity="0.2" />
                  ))}
                </g>

                {/* Indekos Rooms 1 to 5 (top row) */}
                <g 
                  className={`map-interactive-group ${selectedRoom.id === "l2-kos" ? "selected" : ""} ${hoveredRoomId === "l2-kos" ? "hovered" : ""}`}
                  onClick={() => handleRoomClick(LANTAI_2_ROOMS[1])}
                  onMouseEnter={() => setHoveredRoomId("l2-kos")}
                  onMouseLeave={() => setHoveredRoomId(null)}
                >
                  <rect x="150" y="55" width="70" height="80" rx="6" className="room-poly kos-room" />
                  <rect x="230" y="55" width="70" height="80" rx="6" className="room-poly kos-room" />
                  <rect x="310" y="55" width="70" height="80" rx="6" className="room-poly kos-room" />
                  <rect x="390" y="55" width="70" height="80" rx="6" className="room-poly kos-room" />
                  <rect x="470" y="55" width="70" height="80" rx="6" className="room-poly kos-room" />
                  
                  <text x="325" y="100" textAnchor="middle" className="room-label">Kamar Kos 1 - 5</text>
                </g>

                {/* Indekos Rooms 6 to 9 (bottom row, except left-most which is Room 10) */}
                <g 
                  className={`map-interactive-group ${selectedRoom.id === "l2-kos" ? "selected" : ""} ${hoveredRoomId === "l2-kos" ? "hovered" : ""}`}
                  onClick={() => handleRoomClick(LANTAI_2_ROOMS[1])}
                  onMouseEnter={() => setHoveredRoomId("l2-kos")}
                  onMouseLeave={() => setHoveredRoomId(null)}
                >
                  <rect x="230" y="185" width="70" height="80" rx="6" className="room-poly kos-room" />
                  <rect x="310" y="185" width="70" height="80" rx="6" className="room-poly kos-room" />
                  <rect x="390" y="185" width="70" height="80" rx="6" className="room-poly kos-room" />
                  <rect x="470" y="185" width="70" height="80" rx="6" className="room-poly kos-room" />
                  
                  <text x="365" y="230" textAnchor="middle" className="room-label">Kamar Kos 6 - 9</text>
                </g>

                {/* Classroom - Room 10 (Gold highlighted block on far left bottom / kiri depan) */}
                <g 
                  className={`map-interactive-group highlighted-group ${selectedRoom.id === "l2-kamar10" ? "selected" : ""} ${hoveredRoomId === "l2-kamar10" ? "hovered" : ""}`}
                  onClick={() => handleRoomClick(LANTAI_2_ROOMS[0])}
                  onMouseEnter={() => setHoveredRoomId("l2-kamar10")}
                  onMouseLeave={() => setHoveredRoomId(null)}
                >
                  <rect x="150" y="185" width="70" height="80" rx="8" className="room-poly class-room-10" />
                  <text x="185" y="225" textAnchor="middle" className="room-label text-bold gold-text" style={{ fontSize: "9px" }}>KAMAR 10</text>
                  <text x="185" y="238" textAnchor="middle" className="room-label text-bold gold-text" style={{ fontSize: "9px" }}>KELAS IGE</text>
                  <circle cx="185" cy="200" r="4" fill="var(--color-accent)" className="pulsing-dot" />
                </g>
              </svg>
            )}
          </div>

          {/* Right Side: Information details card */}
          <div className={`map-info-card ${selectedRoom.id === "l2-kamar10" ? "accent-border" : ""}`}>
            <span className={`info-badge-tag ${selectedRoom.id === "l2-kamar10" ? "accent-tag" : "primary-tag"}`}>
              {selectedRoom.type}
            </span>
            <h3>{selectedRoom.name}</h3>
            <p className="info-desc">{selectedRoom.desc}</p>



            {selectedRoom.capacity && (
              <div className="info-capacity">
                <h4>Kapasitas Maksimal:</h4>
                <p>{selectedRoom.capacity}</p>
              </div>
            )}

            {selectedRoom.id === "l2-kamar10" && (
              <div className="info-action-block">
                <a href="#contact" className="map-action-btn">
                  Daftar Kelas Sekarang
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
