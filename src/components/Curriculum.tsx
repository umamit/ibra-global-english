"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./Curriculum.css";

gsap.registerPlugin(ScrollTrigger);

export default function Curriculum({ initialSettings }: any) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Parallax halus untuk kartu kurikulum utama
      if (cardRef.current && sectionRef.current) {
        gsap.fromTo(
          cardRef.current,
          { y: 30 },
          {
            y: -30,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.2,
            },
          }
        );
      }

      // Subtle Parallax & fade in untuk container tabel CEFR
      if (tableRef.current) {
        gsap.fromTo(
          tableRef.current,
          { opacity: 0.85, scale: 0.98 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: tableRef.current,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="curriculum" className="curriculum-section" ref={sectionRef}>
      <div className="container">
        <div className="curriculum-card" ref={cardRef}>
          <div className="curriculum-card-header">
            <img src="/assets/logo.png" alt="Logo PT. Ibra Global English" className="curriculum-logo" />
            <div>
              <h3 className="curriculum-title">IGE Curriculum</h3>
              <p className="curriculum-subtitle">Diselaraskan dengan Standar Internasional CEFR</p>
            </div>
          </div>
          <div className="curriculum-card-body">
            <p className="curriculum-description">
              Kurikulum Ibra Global English mengintegrasikan Kurikulum Merdeka dengan kerangka kompetensi internasional Common European Framework of Reference for Languages (CEFR). Setiap level pembelajaran dirancang dengan capaian kompetensi yang jelas dan terukur, sehingga peserta didik berkembang secara bertahap sesuai standar internasional yang digunakan di berbagai negara.
            </p>
            <p className="curriculum-intro">
              Jalur pembelajaran Ibra Global English dirancang secara bertahap untuk membantu siswa mencapai kompetensi bahasa Inggris sesuai target CEFR pada setiap fase pembelajaran:
            </p>

            <div className="curriculum-table-container" ref={tableRef}>
              <table className="curriculum-table">
                <thead>
                  <tr>
                    <th>IGE Curriculum</th>
                    <th>CEFR Target</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Foundation 1–5</td>
                    <td className="cefr-target">A1</td>
                  </tr>
                  <tr>
                    <td>Bridge 1–5</td>
                    <td className="cefr-target">A2</td>
                  </tr>
                  <tr>
                    <td>Communicator 1–5</td>
                    <td className="cefr-target">B1</td>
                  </tr>
                  <tr>
                    <td>Achiever 1–5</td>
                    <td className="cefr-target">B2</td>
                  </tr>
                  <tr>
                    <td>Professional 1–5</td>
                    <td className="cefr-target">C1</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Stepper Timeline */}
            <div className="curriculum-timeline">
              <div className="timeline-step">
                <div className="timeline-badge" />
                <div className="timeline-label">Foundation</div>
                <div className="timeline-sublabel">(A1)</div>
              </div>
              <div className="timeline-step">
                <div className="timeline-badge" />
                <div className="timeline-label">Bridge</div>
                <div className="timeline-sublabel">(A2)</div>
              </div>
              <div className="timeline-step">
                <div className="timeline-badge" />
                <div className="timeline-label">Communicator</div>
                <div className="timeline-sublabel">(B1)</div>
              </div>
              <div className="timeline-step">
                <div className="timeline-badge" />
                <div className="timeline-label">Achiever</div>
                <div className="timeline-sublabel">(B2)</div>
              </div>
              <div className="timeline-step">
                <div className="timeline-badge" />
                <div className="timeline-label">Professional</div>
                <div className="timeline-sublabel">(C1)</div>
              </div>
              <div className="timeline-step">
                <div className="timeline-badge" />
                <div className="timeline-label timeline-highlight">International English Proficiency</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
