const { useState } = React;

function AuditTool() {
  const [agency, setAgency] = useState("");
  const [client, setClient] = useState("");
  const [file, setFile] = useState(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // READ CSV
  const readCSV = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const text = e.target.result || "";
        const lines = text.split("\n").slice(0, 200);
        resolve(lines.join("\n"));
      };

      reader.readAsText(file);
    });
  };

  // RUN AUDIT
  const runAudit = async () => {
    if (!file) return alert("Upload CSV");

    setLoading(true);
    setProgress(10);

    const csvData = await readCSV(file);
    setProgress(40);

    const res = await fetch("/api/audit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        agency,
        client,
        data: csvData,
      }),
    });

    setProgress(70);

    const json = await res.json();

    setResult(json.result || json.error);
    setProgress(100);
    setLoading(false);
  };

  // DOWNLOAD HTML
  const downloadHTML = () => {
    const blob = new Blob([result], { type: "text/html" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "google-ads-audit.html";
    a.click();
  };

  return (
    <div className="container">
      <h1>Google Ads Audit Tool</h1>

      <input
        placeholder="Agency Name"
        value={agency}
        onChange={(e) => setAgency(e.target.value)}
      />

      <input
        placeholder="Client Name"
        value={client}
        onChange={(e) => setClient(e.target.value)}
      />

      <input type="file" onChange={(e) => setFile(e.target.files[0])} />

      <button onClick={runAudit} disabled={loading}>
        {loading ? "Generating..." : "Run Audit"}
      </button>

      {/* PROGRESS BAR */}
      {loading && (
        <div className="progress">
          <div
            className="progress-bar"
            style={{ width: progress + "%" }}
          />
        </div>
      )}

      {/* DOWNLOAD BUTTON */}
      {result && (
        <button onClick={downloadHTML}>
          Download Report
        </button>
      )}

      {/* HTML OUTPUT */}
      <div
        className="result"
        dangerouslySetInnerHTML={{ __html: result }}
      />
    </div>
  );
}

ReactDOM.render(<AuditTool />, document.getElementById("root"));
