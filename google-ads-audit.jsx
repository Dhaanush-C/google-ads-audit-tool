const B = {
  app: {
    minHeight: "100vh",
    background: "#060b12",
    fontFamily: "'Barlow', sans-serif",
    color: "#f0f4ff"
  },
  header: {
    position: "sticky",
    top: 0,
    zIndex: 10,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "18px 32px",
    background: "rgba(6,11,18,.92)",
    borderBottom: "1px solid #0e1826",
    backdropFilter: "blur(10px)"
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 20,
    fontWeight: 800
  },
  nav: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap"
  },
  navDot: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 700
  },
  main: {
    maxWidth: 1180,
    margin: "0 auto",
    padding: "36px 24px 60px"
  },
  errBar: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
    padding: "14px 16px",
    background: "rgba(239,68,68,.08)",
    border: "1px solid rgba(239,68,68,.18)",
    borderRadius: 10,
    color: "#fca5a5"
  },
  pageHead: {
    marginBottom: 24
  },
  stepTag: {
    display: "inline-block",
    marginBottom: 10,
    padding: "4px 10px",
    borderRadius: 20,
    background: "rgba(59,130,246,.1)",
    border: "1px solid rgba(59,130,246,.25)",
    color: "#93c5fd",
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 1.2
  },
  h1: {
    margin: 0,
    fontSize: 34,
    fontWeight: 800,
    color: "#f0f4ff"
  },
  sub: {
    marginTop: 8,
    color: "#6b7a99",
    fontSize: 14
  },
  card: {
    background: "#0a111c",
    border: "1px solid #0e1826",
    borderRadius: 16,
    padding: 24
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 18
  },
  label: {
    display: "block",
    marginBottom: 8,
    fontSize: 13,
    fontWeight: 600,
    color: "#cbd5e1"
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 10,
    border: "1px solid #1e293b",
    background: "#060b12",
    color: "#f0f4ff",
    fontSize: 14
  },
  btn: {
    padding: "14px 20px",
    borderRadius: 10,
    border: "1px solid #2563eb",
    background: "#2563eb",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 14
  },
  ghostBtn: {
    padding: "14px 20px",
    borderRadius: 10,
    border: "1px solid #1e293b",
    background: "transparent",
    color: "#cbd5e1",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 14
  },
  demoBtn: {
    padding: "12px 16px",
    borderRadius: 10,
    border: "1px solid rgba(59,130,246,.3)",
    background: "rgba(59,130,246,.08)",
    color: "#93c5fd",
    fontWeight: 700,
    cursor: "pointer"
  },
  btnRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24
  },
  uploadRow: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: "16px 18px",
    border: "1px solid #0e1826",
    borderRadius: 12,
    background: "#060b12"
  },
  reqBadge: {
    padding: "2px 8px",
    borderRadius: 20,
    background: "rgba(239,68,68,.08)",
    border: "1px solid rgba(239,68,68,.2)",
    color: "#fca5a5",
    fontSize: 10,
    fontWeight: 700,
    textTransform: "uppercase"
  },
  banner: {
    display: "flex",
    gap: 20,
    padding: 24,
    marginBottom: 20,
    borderRadius: 16,
    background: "#0a111c",
    border: "1px solid #0e1826"
  },
  gradeBox: {
    minWidth: 140,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    borderRadius: 14,
    background: "#060b12",
    border: "1px solid #0e1826"
  },
  scoreGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 16,
    marginBottom: 20
  },
  scoreCard: {
    padding: 20,
    borderRadius: 14,
    background: "#0a111c",
    border: "1px solid #0e1826"
  },
  sectionHead: {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 18,
    color: "#f0f4ff"
  }
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
