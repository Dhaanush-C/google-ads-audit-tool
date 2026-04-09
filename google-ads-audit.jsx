const { useState } = React;

const root = ReactDOM.createRoot(document.getElementById("root"));

function App() {
  const [agencyName, setAgencyName] = useState("");
  const [clientName, setClientName] = useState("");
  const [message, setMessage] = useState("");

  const runAudit = async () => {
    setMessage("Running AI audit...");

    try {
      const prompt = `
Agency: ${agencyName}
Client: ${clientName}

Give a short Google Ads audit summary:
- overall account health
- 3 key risks
- 3 recommendations
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
