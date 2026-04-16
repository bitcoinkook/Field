import { useState, useEffect } from "react";

const SHEET_ID = "1BhZ24t56pkRA3LXK6Wcr0nxqYp0_phN5RVdLHhFjIGQ";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

const OUTCOMES = {
  "Moved toward correct orientation": { color: "#4ADE80", short: "Correct" },
  "No change": { color: "#6B7280", short: "No change" },
  "Unexpected result": { color: "#FCD34D", short: "Unexpected" },
  "Too early to tell": { color: "#60A5FA", short: "Too early" },
};

const EXPERIENCE = {
  "Direct hands-on experience": { color: "#4ADE80", short: "Hands-on" },
  "Professional knowledge": { color: "#60A5FA", short: "Professional" },
  "Informed observer": { color: "#FCD34D", short: "Observer" },
  "No prior experience": { color: "#F87171", short: "None" },
};

const parseSheetData = (raw) => {
  try {
    const json = JSON.parse(raw.substring(47).slice(0, -2));
    const rows = json.table.rows;
    return rows.map(row => ({
      structure: row.c[0]?.v || "",
      tool: row.c[1]?.v || "",
      identified: row.c[2]?.v || "",
      action: row.c[3]?.v || "",
      outcome: row.c[4]?.v || "",
      outcomeDetail: row.c[5]?.v || "",
      experience: row.c[6]?.v || "",
    })).filter(r => r.structure);
  } catch {
    return [];
  }
};

const countBy = (arr, key) => {
  return arr.reduce((acc, item) => {
    const val = item[key] || "Unknown";
    acc[val] = (acc[val] || 0) + 1;
    return acc;
  }, {});
};

export default function Field() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(SHEET_URL);
      const raw = await res.text();
      const parsed = parseSheetData(raw);
      setData(parsed);
      setLastFetch(new Date());
    } catch {
      setError("Could not reach field data. Check connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const outcomeCounts = countBy(data, "outcome");
  const toolCounts = countBy(data, "tool");
  const expCounts = countBy(data, "experience");
  const total = data.length;

  const correctRate = total > 0
    ? Math.round((outcomeCounts["Moved toward correct orientation"] || 0) / total * 100)
    : 0;

  const surpriseRate = total > 0
    ? Math.round((outcomeCounts["Unexpected result"] || 0) / total * 100)
    : 0;

  const topStructures = Object.entries(countBy(data, "structure"))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0C0C0A; }

        .f-root {
          min-height: 100vh;
          background: #0C0C0A;
          color: #D4CFC4;
          padding: 3rem 2rem 6rem;
          max-width: 780px;
          margin: 0 auto;
          font-family: 'DM Mono', monospace;
        }

        .f-header {
          margin-bottom: 3rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid #1A1A14;
        }

        .f-eyebrow {
          font-size: 0.55rem;
          letter-spacing: 0.3em;
          color: #2A2820;
          margin-bottom: 0.75rem;
        }

        .f-title {
          font-family: 'Playfair Display', serif;
          font-size: 3rem;
          font-weight: 400;
          color: #D4CFC4;
          line-height: 1;
          letter-spacing: -0.01em;
          margin-bottom: 0.5rem;
          font-style: italic;
        }

        .f-subtitle {
          font-size: 0.65rem;
          color: #2A2820;
          line-height: 1.7;
          letter-spacing: 0.05em;
          max-width: 480px;
          margin-top: 0.5rem;
        }

        .f-meta {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin-top: 1.25rem;
          flex-wrap: wrap;
        }

        .f-meta-item {
          font-size: 0.55rem;
          letter-spacing: 0.15em;
          color: #2A2820;
        }

        .f-refresh-btn {
          font-family: 'DM Mono', monospace;
          font-size: 0.55rem;
          letter-spacing: 0.15em;
          padding: 0.3rem 0.75rem;
          background: transparent;
          border: 1px solid #2A2820;
          color: #2A2820;
          cursor: pointer;
          transition: all 0.12s;
        }
        .f-refresh-btn:hover { border-color: #4A4840; color: #6A6858; }

        .f-empty {
          margin-top: 4rem;
          text-align: center;
          padding: 4rem 2rem;
          border: 1px solid #1A1A14;
        }

        .f-empty-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem;
          color: #2A2820;
          font-style: italic;
          margin-bottom: 1rem;
        }

        .f-empty-text {
          font-size: 0.65rem;
          color: #2A2820;
          line-height: 1.8;
          letter-spacing: 0.03em;
          max-width: 400px;
          margin: 0 auto;
        }

        .f-empty-formula {
          font-size: 0.7rem;
          color: #1A1A14;
          margin-top: 1.5rem;
          letter-spacing: 0.08em;
        }

        .f-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: #1A1A14;
          border: 1px solid #1A1A14;
          margin-bottom: 2rem;
        }

        .f-stat {
          background: #0C0C0A;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .f-stat-value {
          font-family: 'Playfair Display', serif;
          font-size: 2.5rem;
          font-weight: 700;
          line-height: 1;
        }

        .f-stat-label {
          font-size: 0.55rem;
          letter-spacing: 0.15em;
          color: #4A4840;
        }

        .f-section {
          margin-bottom: 2.5rem;
        }

        .f-section-title {
          font-size: 0.55rem;
          letter-spacing: 0.2em;
          color: #2A2820;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #1A1A14;
        }

        .f-bar-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.6rem;
        }

        .f-bar-label {
          font-size: 0.62rem;
          color: #6A6858;
          min-width: 140px;
          letter-spacing: 0.02em;
          flex-shrink: 0;
        }

        .f-bar-track {
          flex: 1;
          height: 2px;
          background: #1A1A14;
          position: relative;
        }

        .f-bar-fill {
          height: 100%;
          transition: width 0.6s ease;
        }

        .f-bar-count {
          font-size: 0.58rem;
          color: #2A2820;
          min-width: 2rem;
          text-align: right;
          letter-spacing: 0.05em;
        }

        .f-cases {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .f-case {
          background: #0F0F0C;
          border: 1px solid #1A1A14;
          padding: 0.85rem 1rem;
          cursor: pointer;
          transition: border-color 0.12s;
        }
        .f-case:hover { border-color: #2A2820; }
        .f-case.active { border-color: #4A4840; background: #121210; }

        .f-case-top {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .f-case-structure {
          font-size: 0.72rem;
          color: #D4CFC4;
          letter-spacing: 0.03em;
          flex: 1;
        }

        .f-tag {
          font-size: 0.52rem;
          letter-spacing: 0.1em;
          padding: 0.15rem 0.45rem;
          border: 1px solid;
        }

        .f-case-detail {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #1A1A14;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .f-detail-row {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .f-detail-label {
          font-size: 0.52rem;
          letter-spacing: 0.15em;
          color: #2A2820;
        }

        .f-detail-value {
          font-size: 0.68rem;
          color: #6A6858;
          line-height: 1.65;
          letter-spacing: 0.02em;
        }

        .f-loading {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-top: 4rem;
          font-size: 0.62rem;
          color: #2A2820;
          letter-spacing: 0.15em;
        }

        .f-spinner {
          width: 14px; height: 14px;
          border: 1px solid #2A2820;
          border-top-color: #4A4840;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .f-error {
          font-size: 0.65rem;
          color: #F87171;
          margin-top: 2rem;
          letter-spacing: 0.05em;
        }

        .f-structures {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .f-struct-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .f-struct-name {
          font-size: 0.65rem;
          color: #6A6858;
          min-width: 160px;
          letter-spacing: 0.02em;
          flex-shrink: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .f-divider {
          height: 1px;
          background: #1A1A14;
          margin: 2rem 0;
        }

        @media (max-width: 500px) {
          .f-stats { grid-template-columns: 1fr 1fr; }
          .f-bar-label { min-width: 100px; font-size: 0.58rem; }
        }
      `}</style>

      <div className="f-root">
        <div className="f-header">
          <div className="f-eyebrow">THE OPEN RING — INSTRUMENT THREE</div>
          <h1 className="f-title">Field</h1>
          <p className="f-subtitle">
            Records what happened when the output met the real world.
            The data returns to the ring. The cycle continues.
          </p>
          <div className="f-meta">
            <span className="f-meta-item">{total} FIELD RECORDS</span>
            {lastFetch && (
              <span className="f-meta-item">
                LAST SYNC {lastFetch.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
            <button className="f-refresh-btn" onClick={fetchData}>
              REFRESH
            </button>
          </div>
        </div>

        {loading && (
          <div className="f-loading">
            <div className="f-spinner" />
            READING FIELD DATA
          </div>
        )}

        {error && <div className="f-error">{error}</div>}

        {!loading && !error && total === 0 && (
          <div className="f-empty">
            <div className="f-empty-title">No field records yet.</div>
            <p className="f-empty-text">
              The Open Ring has not completed a full cycle outside this conversation.
              Field records appear here when real users with genuine domain experience
              run The Gradient or SignalChain, act on the output, and report what happened.
            </p>
            <div className="f-empty-formula">
              I(B) is defined &nbsp;⟺&nbsp; A = C
            </div>
          </div>
        )}

        {!loading && !error && total > 0 && (
          <>
            <div className="f-stats">
              <div className="f-stat">
                <span className="f-stat-value" style={{ color: "#D4CFC4" }}>{total}</span>
                <span className="f-stat-label">TOTAL CYCLES</span>
              </div>
              <div className="f-stat">
                <span className="f-stat-value" style={{ color: "#4ADE80" }}>{correctRate}%</span>
                <span className="f-stat-label">CORRECT ORIENTATION</span>
              </div>
              <div className="f-stat">
                <span className="f-stat-value" style={{ color: "#FCD34D" }}>{surpriseRate}%</span>
                <span className="f-stat-label">UNEXPECTED RESULTS</span>
              </div>
            </div>

            <div className="f-section">
              <div className="f-section-title">OUTCOMES</div>
              {Object.entries(outcomeCounts).map(([outcome, count]) => {
                const meta = OUTCOMES[outcome] || { color: "#6B7280" };
                return (
                  <div className="f-bar-row" key={outcome}>
                    <span className="f-bar-label">{outcome}</span>
                    <div className="f-bar-track">
                      <div className="f-bar-fill" style={{
                        width: `${(count / total) * 100}%`,
                        background: meta.color,
                      }} />
                    </div>
                    <span className="f-bar-count">{count}</span>
                  </div>
                );
              })}
            </div>

            <div className="f-section">
              <div className="f-section-title">TOOLS USED</div>
              {Object.entries(toolCounts).map(([tool, count]) => (
                <div className="f-bar-row" key={tool}>
                  <span className="f-bar-label">{tool}</span>
                  <div className="f-bar-track">
                    <div className="f-bar-fill" style={{
                      width: `${(count / total) * 100}%`,
                      background: "#60A5FA",
                    }} />
                  </div>
                  <span className="f-bar-count">{count}</span>
                </div>
              ))}
            </div>

            <div className="f-section">
              <div className="f-section-title">DOMAIN EXPERIENCE</div>
              {Object.entries(expCounts).map(([exp, count]) => {
                const meta = EXPERIENCE[exp] || { color: "#6B7280" };
                return (
                  <div className="f-bar-row" key={exp}>
                    <span className="f-bar-label">{exp}</span>
                    <div className="f-bar-track">
                      <div className="f-bar-fill" style={{
                        width: `${(count / total) * 100}%`,
                        background: meta.color,
                      }} />
                    </div>
                    <span className="f-bar-count">{count}</span>
                  </div>
                );
              })}
            </div>

            {topStructures.length > 0 && (
              <div className="f-section">
                <div className="f-section-title">TOP STRUCTURES ANALYZED</div>
                <div className="f-structures">
                  {topStructures.map(([name, count]) => (
                    <div className="f-struct-row" key={name}>
                      <span className="f-struct-name">{name}</span>
                      <div className="f-bar-track">
                        <div className="f-bar-fill" style={{
                          width: `${(count / topStructures[0][1]) * 100}%`,
                          background: "#D4CFC4",
                        }} />
                      </div>
                      <span className="f-bar-count">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="f-divider" />

            <div className="f-section">
              <div className="f-section-title">ALL FIELD RECORDS — TAP TO EXPAND</div>
              <div className="f-cases">
                {data.map((item, i) => {
                  const outcomeMeta = OUTCOMES[item.outcome] || { color: "#6B7280" };
                  const expMeta = EXPERIENCE[item.experience] || { color: "#6B7280" };
                  const isSelected = selected === i;
                  return (
                    <div
                      key={i}
                      className={`f-case ${isSelected ? "active" : ""}`}
                      onClick={() => setSelected(isSelected ? null : i)}
                    >
                      <div className="f-case-top">
                        <span className="f-case-structure">{item.structure}</span>
                        <span className="f-tag" style={{
                          borderColor: outcomeMeta.color + "60",
                          color: outcomeMeta.color,
                        }}>{item.outcome || "—"}</span>
                        <span className="f-tag" style={{
                          borderColor: "#2A2820",
                          color: "#4A4840",
                        }}>{item.tool}</span>
                        <span className="f-tag" style={{
                          borderColor: expMeta.color + "40",
                          color: expMeta.color + "99",
                        }}>{expMeta.short || item.experience}</span>
                      </div>

                      {isSelected && (
                        <div className="f-case-detail">
                          {item.identified && (
                            <div className="f-detail-row">
                              <span className="f-detail-label">WHAT THE TOOL IDENTIFIED</span>
                              <span className="f-detail-value">{item.identified}</span>
                            </div>
                          )}
                          {item.action && (
                            <div className="f-detail-row">
                              <span className="f-detail-label">ACTION TAKEN</span>
                              <span className="f-detail-value">{item.action}</span>
                            </div>
                          )}
                          {item.outcomeDetail && (
                            <div className="f-detail-row">
                              <span className="f-detail-label">WHAT HAPPENED</span>
                              <span className="f-detail-value">{item.outcomeDetail}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
              }
