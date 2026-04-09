const { useState } = React;

const parseCSV = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result || "";
      const lines = text.split(/\r?\n/).filter(Boolean);
      const headers = lines[0] || "";
      const rows = lines.slice(1, 201);
      resolve([headers, ...rows].join("\n"));
    };
    reader.onerror = reject;
    reader.readAsText(fil

const root = ReactDOM.createRoot(document.getElementById("root"));

function App() {
  const [agencyName, setAgencyName] = useState("");
  const [clientName, setClientName] = useState("");
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState({
    searchTerms: null,
    adReport: null,
    keywordReport: null,
    campaignReport: null,
  });

  const handleFileChange = async (key, file) => {
    if (!file) return;
    const content = await parseCSV(file);
    setFiles((prev) => ({ ...prev, [key]: content }));
  };

  const runAudit = async () => {
    setMessage("Running AI audit...");

    try {
      const prompt = `
Agency: ${agencyName}
Client: ${clientName}

Analyze each uploaded Google Ads CSV report separately and then provide a combined audit.

Search Terms Report:
${files.searchTerms || "Not uploaded"}

Ad Report:
${files.adReport || "Not uploaded"}

Search Keyword Report:
${files.keywordReport || "Not uploaded"}

Campaign Report:
${files.campaignReport || "Not uploaded"}

Create a detailed audit report with:
1. Executive Summary
2. Health Score out of 100
3. Findings from each report separately
4. Wasted spend / irrelevant traffic issues
5. Keyword gaps
6. Ad copy issues
7. Campaign structure issues
8. Tracking / conversion issues
9. Quick wins (7 days)
10. 30 / 90 day recommendations

Keep it client-ready with clear headings and bullet points.
      `;

      const response = await fetch("/api/audit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Audit failed");
      }

      setMessage(data.result || "Audit completed.");
    } catch (error) {
      setMessage("Error: " + error.message);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#060b12",
        color: "#f0f4ff",
        fontFamily: "Arial, sans-serif",
        padding: "40px",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          background: "#0a111c",
          border: "1px solid #1e293b",
          borderRadius: "16px",
          padding: "32px",
        }}
      >
        <h1 style={{ marginTop: 0 }}>Google Ads Audit Tool</h1>
        <p style={{ color: "#94a3b8" }}>Step 1: basic app setup is working.</p>

        <div style={{ marginBottom: "16px" }}>
          <label>Agency Name</label>
          <input
            value={agencyName}
            onChange={(e) => setAgencyName(e.target.value)}
            placeholder="Your agency"
            style={{
              width: "100%",
              marginTop: "8px",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #334155",
              background: "#060b12",
              color: "white",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label>Client Name</label>
          <input
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Client"
            style={{
              width: "100%",
              marginTop: "8px",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #334155",
              background: "#060b12",
              color: "white",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginTop: "24px", marginBottom: "24px" }}>
          <h3 style={{ marginBottom: "16px" }}>Upload CSV Reports</h3>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px" }}>Search Terms Report</label>
            <input type="file" accept=".csv" onChange={(e) => handleFileChange("searchTerms", e.target.files[0])} />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px" }}>Ad Report</label>
            <input type="file" accept=".csv" onChange={(e) => handleFileChange("adReport", e.target.files[0])} />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px" }}>Search Keyword Report</label>
            <input type="file" accept=".csv" onChange={(e) => handleFileChange("keywordReport", e.target.files[0])} />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px" }}>Campaign Report</label>
            <input type="file" accept=".csv" onChange={(e) => handleFileChange("campaignReport", e.target.files[0])} />
          </div>
        </div>

        <button
          onClick={runAudit}
          style={{
            background: "#2563eb",
            color: "white",
            border: "none",
            padding: "12px 20px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Run Demo Audit
        </button>

        {message && (
          <div
            style={{
              marginTop: "20px",
              padding: "16px",
              background: "rgba(37,99,235,.1)",
              border: "1px solid rgba(37,99,235,.25)",
              borderRadius: "10px",
              whiteSpace: "pre-wrap",
            }}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

root.render(<App />);
