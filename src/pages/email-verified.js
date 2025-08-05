import React from "react";
import logo from "../assets/logo.png";

const EmailVerified = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(to right, #ff9800, #ff6f00)",
        flexDirection: "column",
        textAlign: "center",
        padding: "30px",
      }}
    >
      <img
        src={logo}
        alt="Solar Olagawa Logo"
        style={{ width: "120px", marginBottom: "30px" }}
      />
      <h1 style={{ color: "#fff", fontSize: "32px", fontWeight: "bold" }}>
        🎉 Congratulations!
      </h1>
      <p style={{ color: "#fff", fontSize: "20px", marginTop: "10px" }}>
        Your email has been verified for the <b>Solar Olagawa App</b>.
      </p>
      <p style={{ color: "#fff", fontSize: "18px", marginTop: "10px" }}>
        آپ کا ای میل سولر اولگاوا ایپ کے لیے کامیابی سے تصدیق ہو چکا ہے۔
      </p>
      <p style={{ color: "#fff", fontSize: "18px", marginTop: "10px" }}>
        ستاسو برېښنالیک د سولر اولگاوا ایپ لپاره بریالۍ تایید شو.
      </p>
      <p style={{ color: "#fff", fontSize: "18px", marginTop: "20px" }}>
        Now you can log in to the Solar Olagawa App.
      </p>
    </div>
  );
};

export default EmailVerified;
