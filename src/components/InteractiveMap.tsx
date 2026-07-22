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
    id: "l1-rumah",
    name: "Area Kediaman Rumah Tinggal",
    type: "Area Privat",
    desc: "Bagian dalam lantai 1 yang digunakan sebagai kediaman pribadi pemilik gedung."
  },
  {
    id: "l1-teras",
    name: "Teras & Ruang Tunggu",
    type: "Lobi Publik",
    desc: "Teras semi-terbuka di lantai 1 yang nyaman, dilengkapi dengan meja dan kursi tunggu kayu untuk orang tua wali murid yang sedang menjemput."
  },
  {
    id: "l1-tangga",
    name: "Akses Tangga Kayu",
    type: "Penghubung Lantai",
    desc: "Tangga kayu luar di posisi bawah gedung untuk akses langsung naik ke indekos dan kelas di lantai 2."
  }
];

const LANTAI_2_ROOMS: RoomDetail[] = [
  {
    id: "l2-kamar10",
    name: "Kamar 10 (Kelas Ibra Global English)",
    type: "Ruang Kelas Utama",
    desc: "Pusat pembelajaran interaktif Ibra Global English di posisi kanan atas (sisi depan), bersebelahan langsung dengan Teras Lantai 2.",
    capacity: "Maksimal 10 Siswa per Kelas"
  },
  {
    id: "l2-teras",
    name: "Teras Lantai 2",
    type: "Balkon Depan",
    desc: "Area teras dan balkon terbuka di bagian depan lantai 2 dengan akses sejuk dan pemandangan luar."
  },
  {
    id: "l2-kos",
    name: "Kamar Indekos (1 - 9)",
    type: "Hunian Indekos",
    desc: "Kamar-kamar indekos di lantai 2 (Kamar 1-5 di baris depan & Kamar 6-9 di baris belakang) dengan akses koridor tengah."
  },
  {
    id: "l2-koridor",
    name: "Koridor Tengah",
    type: "Akses Utama",
    desc: "Selasar lorong tengah yang menghubungkan seluruh kamar indekos, kelas Kamar 10, tangga luar, dan Teras Lantai 2."
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
                  onClick={() => handleRoomClick(LANTAI_1_ROOMS[0])}
                  onMouseEnter={() => setHoveredRoomId("l1-rumah")}
                  onMouseLeave={() => setHoveredRoomId(null)}
                >
                  <rect x="50" y="50" width="410" height="215" rx="10" className="room-poly house-main" />
                  <text x="255" y="162" textAnchor="middle" className="room-label">Kediaman Rumah Tinggal</text>
                </g>

                {/* Parent Waiting Area / Front Terrace (Right side) */}
                <g 
                  className={`map-interactive-group ${selectedRoom.id === "l1-teras" ? "selected" : ""} ${hoveredRoomId === "l1-teras" ? "hovered" : ""}`}
                  onClick={() => handleRoomClick(LANTAI_1_ROOMS[1])}
                  onMouseEnter={() => setHoveredRoomId("l1-teras")}
                  onMouseLeave={() => setHoveredRoomId(null)}
                >
                  <rect x="470" y="50" width="75" height="215" rx="10" className="room-poly lobby-area" />
                  <text x="507" y="150" textAnchor="middle" className="room-label">Teras &</text>
                  <text x="507" y="170" textAnchor="middle" className="room-label">R. Tunggu</text>
                </g>

                {/* Outdoor Staircase (Horizontal along bottom) */}
                <g 
                  className={`map-interactive-group ${selectedRoom.id === "l1-tangga" ? "selected" : ""} ${hoveredRoomId === "l1-tangga" ? "hovered" : ""}`}
                  onClick={() => handleRoomClick(LANTAI_1_ROOMS[2])}
                  onMouseEnter={() => setHoveredRoomId("l1-tangga")}
                  onMouseLeave={() => setHoveredRoomId(null)}
                >
                  <rect x="50" y="280" width="495" height="45" rx="8" className="room-poly stair-area" />
                  <text x="297" y="307" textAnchor="middle" className="room-label stair-label">Tangga (Akses Naik ke Lt. 2)</text>
                  {/* Stair steps lines */}
                  {Array.from({ length: 15 }).map((_, i) => (
                    <line key={i} x1={75 + i * 28} y1="280" x2={75 + i * 28} y2="325" stroke="var(--color-primary-dark)" strokeWidth="1" opacity="0.25" />
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
                  onClick={() => handleRoomClick(LANTAI_2_ROOMS[3])}
                  onMouseEnter={() => setHoveredRoomId("l2-koridor")}
                  onMouseLeave={() => setHoveredRoomId(null)}
                >
                  <rect x="50" y="138" width="410" height="25" rx="4" className="room-poly corridor-area" style={{ fill: "rgba(33, 108, 126, 0.08)" }} />
                  <text x="255" y="155" textAnchor="middle" className="room-label" style={{ fontSize: "11px" }}>Koridor Tengah</text>
                </g>

                {/* Teras LT 2 on right */}
                <g 
                  className={`map-interactive-group ${selectedRoom.id === "l2-teras" ? "selected" : ""} ${hoveredRoomId === "l2-teras" ? "hovered" : ""}`}
                  onClick={() => handleRoomClick(LANTAI_2_ROOMS[1])}
                  onMouseEnter={() => setHoveredRoomId("l2-teras")}
                  onMouseLeave={() => setHoveredRoomId(null)}
                >
                  <rect x="470" y="50" width="75" height="215" rx="8" className="room-poly terrace-l2" style={{ fill: "rgba(166, 136, 73, 0.06)", stroke: "var(--color-accent)" }} />
                  <text x="507" y="160" textAnchor="middle" className="room-label text-bold" transform="rotate(-90 507 160)" style={{ fill: "var(--color-primary-dark)", letterSpacing: "1px", fontSize: "11px" }}>TERAS LT 2</text>
                </g>

                {/* Top Row Rooms (6, 7, 8, 9, IBRA 10) */}
                <g 
                  className={`map-interactive-group ${selectedRoom.id === "l2-kos" ? "selected" : ""} ${hoveredRoomId === "l2-kos" ? "hovered" : ""}`}
                  onClick={() => handleRoomClick(LANTAI_2_ROOMS[2])}
                  onMouseEnter={() => setHoveredRoomId("l2-kos")}
                  onMouseLeave={() => setHoveredRoomId(null)}
                >
                  <rect x="50" y="50" width="78" height="80" rx="6" className="room-poly kos-room" />
                  <text x="89" y="95" textAnchor="middle" className="room-label" style={{ fontSize: "14px", fontWeight: "800" }}>6</text>

                  <rect x="133" y="50" width="78" height="80" rx="6" className="room-poly kos-room" />
                  <text x="172" y="95" textAnchor="middle" className="room-label" style={{ fontSize: "14px", fontWeight: "800" }}>7</text>

                  <rect x="216" y="50" width="78" height="80" rx="6" className="room-poly kos-room" />
                  <text x="255" y="95" textAnchor="middle" className="room-label" style={{ fontSize: "14px", fontWeight: "800" }}>8</text>

                  <rect x="299" y="50" width="78" height="80" rx="6" className="room-poly kos-room" />
                  <text x="338" y="95" textAnchor="middle" className="room-label" style={{ fontSize: "14px", fontWeight: "800" }}>9</text>
                </g>

                {/* IBRA 10 (Kamar 10 - Kelas IGE) */}
                <g 
                  className={`map-interactive-group highlighted-group ${selectedRoom.id === "l2-kamar10" ? "selected" : ""} ${hoveredRoomId === "l2-kamar10" ? "hovered" : ""}`}
                  onClick={() => handleRoomClick(LANTAI_2_ROOMS[0])}
                  onMouseEnter={() => setHoveredRoomId("l2-kamar10")}
                  onMouseLeave={() => setHoveredRoomId(null)}
                >
                  <rect x="382" y="50" width="78" height="80" rx="8" className="room-poly class-room-10" />
                  <text x="421" y="86" textAnchor="middle" className="room-label text-bold gold-text" style={{ fontSize: "9px" }}>IBRA 10</text>
                  <text x="421" y="100" textAnchor="middle" className="room-label text-bold gold-text" style={{ fontSize: "8px" }}>KELAS IGE</text>
                  <circle cx="421" cy="67" r="4" fill="var(--color-accent)" className="pulsing-dot" />
                </g>

                {/* Bottom Row Rooms (5, 4, 3, 2, 1) */}
                <g 
                  className={`map-interactive-group ${selectedRoom.id === "l2-kos" ? "selected" : ""} ${hoveredRoomId === "l2-kos" ? "hovered" : ""}`}
                  onClick={() => handleRoomClick(LANTAI_2_ROOMS[2])}
                  onMouseEnter={() => setHoveredRoomId("l2-kos")}
                  onMouseLeave={() => setHoveredRoomId(null)}
                >
                  <rect x="50" y="170" width="78" height="95" rx="6" className="room-poly kos-room" />
                  <text x="89" y="222" textAnchor="middle" className="room-label" style={{ fontSize: "14px", fontWeight: "800" }}>5</text>

                  <rect x="133" y="170" width="78" height="95" rx="6" className="room-poly kos-room" />
                  <text x="172" y="222" textAnchor="middle" className="room-label" style={{ fontSize: "14px", fontWeight: "800" }}>4</text>

                  <rect x="216" y="170" width="78" height="95" rx="6" className="room-poly kos-room" />
                  <text x="255" y="222" textAnchor="middle" className="room-label" style={{ fontSize: "14px", fontWeight: "800" }}>3</text>

                  <rect x="299" y="170" width="78" height="95" rx="6" className="room-poly kos-room" />
                  <text x="338" y="222" textAnchor="middle" className="room-label" style={{ fontSize: "14px", fontWeight: "800" }}>2</text>

                  <rect x="382" y="170" width="78" height="95" rx="6" className="room-poly kos-room" />
                  <text x="421" y="222" textAnchor="middle" className="room-label" style={{ fontSize: "14px", fontWeight: "800" }}>1</text>
                </g>

                {/* Stairs on bottom (Akses Tangga) */}
                <g className="map-static-group">
                  <rect x="50" y="280" width="495" height="45" rx="8" className="room-poly stair-disabled" />
                  <text x="297" y="307" textAnchor="middle" className="room-label stair-label" opacity="0.6">Tangga (Akses dari Lt. 1)</text>
                  {Array.from({ length: 15 }).map((_, i) => (
                    <line key={i} x1={75 + i * 28} y1="280" x2={75 + i * 28} y2="325" stroke="var(--color-gray-400)" strokeWidth="1" opacity="0.25" />
                  ))}
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
