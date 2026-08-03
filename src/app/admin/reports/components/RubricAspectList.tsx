import React from "react";

export function RubricAspectList({ rubrics, selectedIds, toggleCriterion }: any) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {rubrics.map((aspect: any) => (
        <div key={aspect.categoryKey} style={{ border: "1px solid #e2e8f0", borderRadius: "12px", padding: "1.25rem" }}>
          <h4 style={{ margin: "0 0 0.75rem", fontSize: "0.95rem", color: "#216c7e" }}>{aspect.title}</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {aspect.criteria.map((item: any) => {
              const isChecked = selectedIds.includes(item.id);
              return (
                <label key={item.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", cursor: "pointer" }}>
                  <input type="checkbox" checked={isChecked} onChange={() => toggleCriterion(item.id)} />
                  <span>{item.label} <strong>(+{item.points} poin)</strong></span>
                </label>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
