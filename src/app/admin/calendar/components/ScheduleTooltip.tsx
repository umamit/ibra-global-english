"use client";

import React from "react";
import { AcademicSchedule } from "../hooks/useCalendarData";

interface ScheduleTooltipProps {
  hoveredSchedule: AcademicSchedule;
  tooltipPos: { x: number; y: number };
}

export default function ScheduleTooltip({ hoveredSchedule, tooltipPos }: ScheduleTooltipProps) {
  const typeColor =
    hoveredSchedule.type === "holiday"
      ? "#ef4444"
      : hoveredSchedule.type === "event"
      ? "var(--color-accent)"
      : "var(--color-primary-dark)";

  const typeBg =
    hoveredSchedule.type === "holiday"
      ? "rgba(239, 68, 68, 0.06)"
      : hoveredSchedule.type === "event"
      ? "rgba(166, 136, 73, 0.06)"
      : "rgba(33, 108, 126, 0.06)";

  const typeLabel =
    hoveredSchedule.type === "holiday"
      ? "Libur"
      : hoveredSchedule.type === "event"
      ? "Kegiatan"
      : "Kelas";

  return (
    <div
      style={{
        position: "absolute",
        left: `${tooltipPos.x}px`,
        top: `${tooltipPos.y}px`,
        transform: "translate(-50%, -100%)",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(0, 0, 0, 0.08)",
        borderRadius: "12px",
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
        padding: "0.75rem 1rem",
        width: "260px",
        zIndex: 9999,
        pointerEvents: "none",
        transition: "all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)",
        animation: "tooltipFade 0.12s ease-out",
      }}
      className="no-print"
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
        <span
          style={{
            fontSize: "0.68rem",
            fontWeight: "800",
            textTransform: "uppercase",
            color: typeColor,
            backgroundColor: typeBg,
            padding: "0.15rem 0.4rem",
            borderRadius: "9999px",
          }}
        >
          {typeLabel}
        </span>
        <span style={{ fontSize: "0.7rem", fontWeight: "700", color: "var(--color-gray-500)" }}>
          {new Date(hoveredSchedule.start_time).toTimeString().slice(0, 5)} -{" "}
          {new Date(hoveredSchedule.end_time).toTimeString().slice(0, 5)}
        </span>
      </div>

      <h4 style={{ margin: "0 0 0.25rem 0", fontSize: "0.85rem", fontWeight: "800", color: "var(--color-gray-900)", lineHeight: "1.25" }}>
        {hoveredSchedule.title}
      </h4>

      {hoveredSchedule.instructor && (
        <p style={{ margin: "0 0 0.25rem 0", fontSize: "0.72rem", color: "var(--color-gray-600)", display: "flex", alignItems: "center", gap: "3px" }}>
          ‍ <strong>Pengajar:</strong> {hoveredSchedule.instructor}
        </p>
      )}

      {hoveredSchedule.description && (
        <p style={{ margin: 0, fontSize: "0.7rem", color: "var(--color-gray-500)", borderTop: "1px dashed rgba(0,0,0,0.06)", paddingTop: "0.25rem", marginTop: "0.25rem", lineHeight: "1.3" }}>
          {hoveredSchedule.description}
        </p>
      )}

      {/* Tooltip arrow */}
      <div
        style={{
          position: "absolute",
          bottom: "-6px",
          left: "50%",
          transform: "translateX(-50%) rotate(45deg)",
          width: "12px",
          height: "12px",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          borderRight: "1px solid rgba(0, 0, 0, 0.08)",
          borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
        }}
      />
    </div>
  );
}
