import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import Footer from "../components/Footer";
import logo from "../assets/logo.png";
import "../styles/Responsive.css";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const { error } = await supabase.from("contacts").insert([form]);

    if (error) {
      alert("❌ Could not submit: " + error.message);
      setSubmitting(false);
      return;
    }

    setSubmitted(true);
    setForm({ name: "", email: "", phone: "", message: "" });
    setSubmitting(false);

    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <section
      className="container"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        paddingTop: "var(--padding-base)",
        paddingBottom: "var(--padding-base)",
      }}
    >
      {/* Success Message */}
      {submitted && (
        <div
          style={{
            position: "fixed",
            top: "clamp(20px, 5vh, 40px)",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#e8f5e9",
            color: "#2e7d32",
            padding: "clamp(12px, 2vw, 20px)",
            borderRadius: "8px",
            fontWeight: 700,
            zIndex: 1000,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            width: "clamp(280px, 80%, 500px)",
            textAlign: "center",
          }}
        >
          <span style={{ fontSize: "clamp(20px, 4vw, 24px)" }}>✓</span>{" "}
          Your message has been received! We’ll contact you soon.
        </div>
      )}

      {/* Contact Form Card */}
      <div
        style={{
          maxWidth: "600px",
          width: "90%",
          margin: "auto",
          background: "#fff",
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          padding: "clamp(20px, 4vw, 40px)",
        }}
      >
        {/* Logo */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "clamp(20px, 4vw, 32px)",
          }}
        >
          <img
            src={logo}
            alt="Syed Solar Energy"
            style={{
              width: "clamp(60px, 10vw, 100px)",
              height: "auto",
            }}
          />
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "clamp(12px, 2.5vw, 20px)",
          }}
        >
          <input
            name="name"
            type="text"
            placeholder="Your Name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            name="email"
            type="email"
            placeholder="Your Email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            name="phone"
            type="tel"
            placeholder="Your Phone"
            value={form.phone}
            onChange={handleChange}
            required
          />

          <textarea
            name="message"
            rows="4"
            placeholder="Your Message"
            value={form.message}
            onChange={handleChange}
            required
            style={{ resize: "vertical" }}
          />

          <button
            type="submit"
            disabled={submitting}
            style={{
              background: "var(--primary-orange)",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "clamp(12px, 2.5vw, 20px)",
              fontSize: "var(--font-size-base)",
              cursor: submitting ? "not-allowed" : "pointer",
              transition: "background 0.3s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--secondary-orange)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "var(--primary-orange)")
            }
          >
            {submitting ? "Sending…" : "Send Message"}
          </button>
        </form>
      </div>

      {/* Footer */}
      <Footer />
    </section>
  );
}
