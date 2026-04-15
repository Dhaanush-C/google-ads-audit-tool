const { useState } = React;

function AuditTool() {
  const [agency, setAgency] = useState("");
  const [client, setClient] = useState("");
  const [files, setFiles] = useState({
  searchTerms: null,
  adReport: null,
  keywordReport: null,
  campaignReport: null,
});
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // READ CSV
  const readCSV = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const text = e.target.result || "";
        const lines = text.split("\n").slice(0, 30);
        resolve(lines.join("\n"));
      };

      reader.readAsText(file);
    });
  };

  // RUN AUDIT
 const runAudit = async () => {
  setLoading(true);
  setProgress(20);

  const csvs = await readAllCSVs();
  setProgress(50);

  const combinedData = `
SEARCH TERMS:
${csvs.searchTerms}

AD REPORT:
${csvs.adReport}

KEYWORD REPORT:
${csvs.keywordReport}

CAMPAIGN REPORT:
${csvs.campaignReport}
`;

  const res = await fetch("/api/audit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      agency,
      client,
      data: combinedData,
    }),
  });

  const json = await res.json();

  setResult(json.result || json.error || "No response received");
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

      <input type="file" onChange={(e) => setFiles(prev => ({...prev, searchTerms: e.target.files[0]}))} />
<p>Search Terms Report</p>

<input type="file" onChange={(e) => setFiles(prev => ({...prev, adReport: e.target.files[0]}))} />
<p>Ad Report</p>

<input type="file" onChange={(e) => setFiles(prev => ({...prev, keywordReport: e.target.files[0]}))} />
<p>Search Keyword Report</p>

<input type="file" onChange={(e) => setFiles(prev => ({...prev, campaignReport: e.target.files[0]}))} />
<p>Campaign Report</p>

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
