"use client";

import { useState } from "react";

/**
 * Komponen FormInput Reusable
 * Menggunakan gaya terstandarisasi dari sistem desain Ibra Global English
 */
export default function FormInput({
  label,
  id,
  helperText,
  required,
  error,
  ...props
}) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.5rem", width: "100%" }}>
      {label && (
        <label 
          htmlFor={id} 
          style={{ 
            fontSize: "0.875rem", 
            fontWeight: "700", 
            color: "var(--color-gray-700)",
            display: "block"
          }}
        >
          {label} {required && <span style={{ color: "var(--color-red)" }}>*</span>}
        </label>
      )}
      
      <input
        id={id}
        required={required}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={{
          width: "100%",
          padding: "0.75rem 1rem",
          borderRadius: "var(--radius-md)",
          border: isFocused 
            ? "1px solid var(--color-primary)" 
            : error 
              ? "1px solid var(--color-red)" 
              : "1px solid var(--color-gray-300)",
          backgroundColor: "var(--color-white)",
          color: "var(--color-gray-900)",
          fontWeight: "500",
          fontSize: "0.95rem",
          outline: "none",
          boxShadow: isFocused ? "0 0 0 3px rgba(33, 108, 126, 0.15)" : "none",
          transition: "all 0.15s ease",
        }}
        {...props}
      />
      
      {error && (
        <p style={{ fontSize: "0.75rem", color: "var(--color-red)", marginTop: "4px", fontWeight: "600" }}>
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p style={{ fontSize: "0.75rem", color: "var(--color-gray-400)", marginTop: "4px" }}>
          {helperText}
        </p>
      )}
    </div>
  );
}
