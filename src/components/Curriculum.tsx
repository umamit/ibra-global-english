"use client";
import "./Curriculum.css";

export default function Curriculum({ initialSettings }: any) {
  return (
    <section id="curriculum" className="curriculum-section">
      <div className="container">
        <div className="curriculum-card" data-aos="fade-up">
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

            <div className="curriculum-table-container">
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
