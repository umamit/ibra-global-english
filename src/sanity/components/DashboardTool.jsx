"use client";

import { useEffect, useState } from "react";
import { useClient } from "sanity";

export default function DashboardTool() {
  const client = useClient({ apiVersion: "2023-01-01" });
  const [stats, setStats] = useState({
    announcement: 0,
    testimonial: 0,
    faqItem: 0,
    programItem: 0,
    galleryItem: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await client.fetch(
          `*[_type in ["announcement", "testimonial", "faqItem", "programItem", "galleryItem"]]`
        );
        const counts = {
          announcement: 0,
          testimonial: 0,
          faqItem: 0,
          programItem: 0,
          galleryItem: 0,
        };
        data.forEach((doc) => {
          if (counts[doc._type] !== undefined) {
            counts[doc._type]++;
          }
        });
        setStats(counts);
      } catch (err) {
        console.error("Gagal mengambil statistik Sanity:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [client]);

  const totalDocs = stats.announcement + stats.testimonial + stats.faqItem + stats.programItem + stats.galleryItem;

  // Donut chart segments calculations
  const r = 50;
  const circ = 2 * Math.PI * r;
  const pctAnn = totalDocs ? (stats.announcement / totalDocs) * 100 : 0;
  const pctTest = totalDocs ? (stats.testimonial / totalDocs) * 100 : 0;
  const pctFaq = totalDocs ? (stats.faqItem / totalDocs) * 100 : 0;
  const pctProg = totalDocs ? (stats.programItem / totalDocs) * 100 : 0;

  return (
    <div className="sanity-dashboard-tool">
      {/* Top Header */}
      <div className="sd-header">
        <div className="sd-header-left">
          <button className="sd-btn-dropdown">
            <span className="sd-icon-calendar">📅</span>
            <span>This Month</span>
          </button>
        </div>
        <div className="sd-header-right">
          <button className="sd-btn-export" onClick={() => window.print()}>
            <span className="sd-icon-download">📥</span>
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="sd-grid">
        {/* Card 1: Donut Chart - CMS Content Breakdown */}
        <div className="sd-card">
          <h3 className="sd-card-title">CMS Content Breakdown</h3>
          <div className="sd-donut-container">
            <div className="sd-donut-chart">
              <svg width="150" height="150" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r={r}
                  fill="transparent"
                  stroke="#1c1930"
                  strokeWidth="12"
                />
                {totalDocs > 0 && (
                  <>
                    {/* Announcement Segment (Blue) */}
                    <circle
                      cx="60"
                      cy="60"
                      r={r}
                      fill="transparent"
                      stroke="#00d2ff"
                      strokeWidth="12"
                      strokeDasharray={`${(pctAnn / 100) * circ} ${circ}`}
                      strokeDashoffset={0}
                      transform="rotate(-90 60 60)"
                    />
                    {/* Testimonial Segment (Purple) */}
                    <circle
                      cx="60"
                      cy="60"
                      r={r}
                      fill="transparent"
                      stroke="#8b5cf6"
                      strokeWidth="12"
                      strokeDasharray={`${(pctTest / 100) * circ} ${circ}`}
                      strokeDashoffset={-((pctAnn / 100) * circ)}
                      transform="rotate(-90 60 60)"
                    />
                    {/* FAQ Segment (Pink/Amber) */}
                    <circle
                      cx="60"
                      cy="60"
                      r={r}
                      fill="transparent"
                      stroke="#f59e0b"
                      strokeWidth="12"
                      strokeDasharray={`${(pctFaq / 100) * circ} ${circ}`}
                      strokeDashoffset={-(((pctAnn + pctTest) / 100) * circ)}
                      transform="rotate(-90 60 60)"
                    />
                    {/* Program Segment (Teal) */}
                    <circle
                      cx="60"
                      cy="60"
                      r={r}
                      fill="transparent"
                      stroke="#10b981"
                      strokeWidth="12"
                      strokeDasharray={`${(pctProg / 100) * circ} ${circ}`}
                      strokeDashoffset={-(((pctAnn + pctTest + pctFaq) / 100) * circ)}
                      transform="rotate(-90 60 60)"
                    />
                  </>
                )}
              </svg>
              <div className="sd-donut-center">
                <span className="sd-donut-value">{totalDocs}</span>
                <span className="sd-donut-label">Total</span>
              </div>
            </div>
            <div className="sd-donut-legend">
              <div className="sd-legend-item">
                <span className="sd-legend-dot" style={{ backgroundColor: "#00d2ff" }}></span>
                <span className="sd-legend-name">Pengumuman</span>
                <span className="sd-legend-val">{stats.announcement} docs</span>
              </div>
              <div className="sd-legend-item">
                <span className="sd-legend-dot" style={{ backgroundColor: "#8b5cf6" }}></span>
                <span className="sd-legend-name">Testimoni</span>
                <span className="sd-legend-val">{stats.testimonial} docs</span>
              </div>
              <div className="sd-legend-item">
                <span className="sd-legend-dot" style={{ backgroundColor: "#f59e0b" }}></span>
                <span className="sd-legend-name">FAQ</span>
                <span className="sd-legend-val">{stats.faqItem} docs</span>
              </div>
              <div className="sd-legend-item">
                <span className="sd-legend-dot" style={{ backgroundColor: "#10b981" }}></span>
                <span className="sd-legend-name">Program Kelas</span>
                <span className="sd-legend-val">{stats.programItem} docs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: CMS Activity Level / Expenses */}
        <div className="sd-card">
          <h3 className="sd-card-title">CMS Integrity Levels</h3>
          <div className="sd-activity-container">
            <div className="sd-activity-bars">
              <div className="sd-act-item">
                <div className="sd-act-label">
                  <span>Image Optimizer</span>
                  <span>92%</span>
                </div>
                <div className="sd-progress-track">
                  <div className="sd-progress-bar" style={{ width: "92%", background: "linear-gradient(90deg, #3b82f6, #00d2ff)" }}></div>
                </div>
              </div>
              <div className="sd-act-item">
                <div className="sd-act-label">
                  <span>Schema Compliance</span>
                  <span>100%</span>
                </div>
                <div className="sd-progress-track">
                  <div className="sd-progress-bar" style={{ width: "100%", background: "linear-gradient(90deg, #8b5cf6, #7c3aed)" }}></div>
                </div>
              </div>
              <div className="sd-act-item">
                <div className="sd-act-label">
                  <span>Media Assets Coverage</span>
                  <span>85%</span>
                </div>
                <div className="sd-progress-track">
                  <div className="sd-progress-bar" style={{ width: "85%", background: "linear-gradient(90deg, #f59e0b, #d97706)" }}></div>
                </div>
              </div>
              <div className="sd-act-item">
                <div className="sd-act-label">
                  <span>Active Testimonials</span>
                  <span>78%</span>
                </div>
                <div className="sd-progress-track">
                  <div className="sd-progress-bar" style={{ width: "78%", background: "linear-gradient(90deg, #10b981, #059669)" }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Projections vs Actuals (Monthly Bar Chart) */}
        <div className="sd-card">
          <h3 className="sd-card-title">CMS Publications Growth</h3>
          <div className="sd-chart-container">
            <div className="sd-bar-chart">
              <div className="sd-chart-y-axis">
                <span>15</span>
                <span>10</span>
                <span>5</span>
                <span>0</span>
              </div>
              <div className="sd-chart-bars">
                <div className="sd-chart-bar-col">
                  <div className="sd-bar-track">
                    <div className="sd-bar-value" style={{ height: "40%", background: "linear-gradient(180deg, #00d2ff, rgba(0, 210, 255, 0.15))" }}></div>
                  </div>
                  <span className="sd-bar-label">Jan</span>
                </div>
                <div className="sd-chart-bar-col">
                  <div className="sd-bar-track">
                    <div className="sd-bar-value" style={{ height: "60%", background: "linear-gradient(180deg, #00d2ff, rgba(0, 210, 255, 0.15))" }}></div>
                  </div>
                  <span className="sd-bar-label">Feb</span>
                </div>
                <div className="sd-chart-bar-col">
                  <div className="sd-bar-track">
                    <div className="sd-bar-value" style={{ height: "55%", background: "linear-gradient(180deg, #00d2ff, rgba(0, 210, 255, 0.15))" }}></div>
                  </div>
                  <span className="sd-bar-label">Mar</span>
                </div>
                <div className="sd-chart-bar-col">
                  <div className="sd-bar-track">
                    <div className="sd-bar-value" style={{ height: "80%", background: "linear-gradient(180deg, #00d2ff, rgba(0, 210, 255, 0.15))" }}></div>
                  </div>
                  <span className="sd-bar-label">Apr</span>
                </div>
                <div className="sd-chart-bar-col">
                  <div className="sd-bar-track">
                    <div className="sd-bar-value" style={{ height: "70%", background: "linear-gradient(180deg, #00d2ff, rgba(0, 210, 255, 0.15))" }}></div>
                  </div>
                  <span className="sd-bar-label">May</span>
                </div>
                <div className="sd-chart-bar-col">
                  <div className="sd-bar-track">
                    <div className="sd-bar-value" style={{ height: "95%", background: "linear-gradient(180deg, #00d2ff, rgba(0, 210, 255, 0.15))" }}></div>
                  </div>
                  <span className="sd-bar-label">Jun</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: AI Insights (With grid backdrop) */}
        <div className="sd-card sd-card-ai">
          <div className="sd-card-ai-grid"></div>
          <div className="sd-card-ai-content">
            <div className="sd-ai-tag">AI Insights</div>
            <div className="sd-ai-dots">
              <span className="sd-ai-dot active"></span>
              <span className="sd-ai-dot"></span>
              <span className="sd-ai-dot"></span>
              <span className="sd-ai-dot"></span>
            </div>
            <p className="sd-ai-text">
              Laporan data: Galeri foto kustom aktif dengan rasio optimasi LCP 92%.
              Direkomendasikan memperbarui pengumuman kelas semester baru untuk meningkatkan retensi pendaftaran siswa.
            </p>
            <div className="sd-ai-arrow">↗</div>
          </div>
        </div>

        {/* Card 5: Weekly Publications Chart */}
        <div className="sd-card">
          <h3 className="sd-card-title">Publications vs Edits (Weekly)</h3>
          <div className="sd-chart-container">
            <div className="sd-bar-chart">
              <div className="sd-chart-y-axis">
                <span>5</span>
                <span>3</span>
                <span>1</span>
                <span>0</span>
              </div>
              <div className="sd-chart-bars">
                <div className="sd-chart-bar-col">
                  <div className="sd-bar-track">
                    <div className="sd-bar-value" style={{ height: "50%", background: "linear-gradient(180deg, #8b5cf6, rgba(139, 92, 246, 0.15))" }}></div>
                  </div>
                  <span className="sd-bar-label">W-1</span>
                </div>
                <div className="sd-chart-bar-col">
                  <div className="sd-bar-track">
                    <div className="sd-bar-value" style={{ height: "80%", background: "linear-gradient(180deg, #8b5cf6, rgba(139, 92, 246, 0.15))" }}></div>
                  </div>
                  <span className="sd-bar-label">W-2</span>
                </div>
                <div className="sd-chart-bar-col">
                  <div className="sd-bar-track">
                    <div className="sd-bar-value" style={{ height: "65%", background: "linear-gradient(180deg, #8b5cf6, rgba(139, 92, 246, 0.15))" }}></div>
                  </div>
                  <span className="sd-bar-label">W-3</span>
                </div>
                <div className="sd-chart-bar-col">
                  <div className="sd-bar-track">
                    <div className="sd-bar-value" style={{ height: "90%", background: "linear-gradient(180deg, #8b5cf6, rgba(139, 92, 246, 0.15))" }}></div>
                  </div>
                  <span className="sd-bar-label">W-4</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
