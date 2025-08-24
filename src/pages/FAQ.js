import React, { useEffect, useState } from "react";

export default function FAQ() {
  const [faqs, setFaqs] = useState([]);
  const [open, setOpen] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const cached = localStorage.getItem("faqs_json");
        if (cached) {
          setFaqs(JSON.parse(cached).faqs || []);
        }
        const res = await fetch("/content/faqs.json", { cache: "no-cache" });
        const json = await res.json();
        setFaqs(json.faqs || []);
        localStorage.setItem("faqs_json", JSON.stringify(json));
      } catch (e) {
        setError("Unable to load FAQs right now.");
      }
    }
    load();
  }, []);

  return (
    <div style={styles.wrap}>
      <h1 style={styles.h1}>Frequently Asked Questions</h1>
      {error && <div style={styles.error}>{error}</div>}
      <div style={styles.list}>
        {faqs.map((item, idx) => (
          <div key={idx} style={styles.card}>
            <button
              aria-expanded={open === idx}
              onClick={() => setOpen(open === idx ? null : idx)}
              style={styles.q}
            >
              <span>{item.q}</span>
              <span>{open === idx ? "–" : "+"}</span>
            </button>
            {open === idx && <div style={styles.a}>{item.a}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  wrap: { maxWidth: 900, margin: "40px auto", padding: "0 16px" },
  h1: { fontSize: 28, marginBottom: 16, fontWeight: 700 },
  list: { display: "grid", gap: 12 },
  card: { border: "1px solid #eee", borderRadius: 12, background: "#fff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  q: {
    width: "100%", textAlign: "left", display: "flex", justifyContent: "space-between",
    alignItems: "center", padding: "14px 16px", fontSize: 16, fontWeight: 600,
    background: "transparent", border: "none", cursor: "pointer"
  },
  a: { padding: "0 16px 16px", color: "#333", lineHeight: 1.6 },
  error: { padding: 10, background: "#fff3cd", borderRadius: 8, marginBottom: 12 }
};
