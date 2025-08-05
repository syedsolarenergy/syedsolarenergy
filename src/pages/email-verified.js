import React from "react";
import logo from "../assets/logo.png";

const EmailVerified = () => {
  return (
    <div
      style={{
        background: "linear-gradient(to bottom, #ff9800, #e65100)",
        height: "100vh",
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        margin: 0,
        padding: 20,
        overflow: "hidden",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 9999,
        textAlign: "center",
      }}
    >
      <img
        src={logo}
        alt="Solar Olagawa Logo"
        style={{
          width: 120,
          height: 120,
          marginBottom: 20,
          borderRadius: "50%",
          border: "4px solid white",
          objectFit: "cover",
        }}
      />

      <h1 style={{ color: "#fff", fontSize: 32, marginBottom: 10 }}>🎉 Email Verified</h1>

      <p style={{ color: "#fff", fontSize: 20, maxWidth: 500, marginBottom: 15 }}>
        Welcome to <strong>Solar Olagawa App</strong>!<br />
        خوش آمدید سولا اولگاوا ایپ میں!<br />
        سولا اولگاوا ایپ ته ښه راغلاست!
      </p>

      <p style={{ color: "#fff", fontSize: 18, maxWidth: 500 }}>
        Now you can login to the <strong>Solar Olagawa App</strong>.<br />
        اب آپ سولا اولگاوا ایپ میں لاگ ان کر سکتے ہیں۔<br />
        اوسے تاسو کولای شۍ چی اوس سولا اولگاوا ایپ ته لوگ ان شی
      </p>
    </div>
  );
};

export default EmailVerified;
