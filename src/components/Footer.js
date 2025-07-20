import React from "react";
import logo from "../assets/logo.png";

export default function Footer() {
  return (
    <footer style={footerStyles.wrapper}>
      <div style={footerStyles.container}>
        {/* Logo and Company Name */}
        <div style={footerStyles.logoBlock}>
          <img src={logo} alt="Syed Solar Energy Logo" style={footerStyles.logo} />
          <div>
            <div style={footerStyles.companyName}>Syed Solar Energy Pvt Ltd</div>
            <div style={footerStyles.tagline}>صاف توانائی کے سفر کا روشن راستہ</div>
          </div>
        </div>

        {/* Contact Details */}
        <div style={footerStyles.contactBlock}>
          <div style={footerStyles.contactRow}>
            <span style={footerStyles.icon}>📍</span>
            <span>Office #23 Mustafa Plaza Ring Road, Near Imtiaz Mega Center, Peshawar</span>
          </div>
          <div style={footerStyles.contactRow}>
            <span style={footerStyles.icon}>📧</span>
            <a href="mailto:sales@syedsolarenergy.com" style={footerStyles.link}>sales@syedsolarenergy.com</a>
          </div>
          <div style={footerStyles.contactRow}>
            <span style={footerStyles.icon}>📞</span>
            <a href="tel:03044678929" style={footerStyles.link}>03044678929</a> |{" "}
            <a href="tel:03075596695" style={footerStyles.link}>03075596695</a>
          </div>
        </div>

        {/* Social Icons */}
        <div style={footerStyles.socialBlock}>
          <a href="https://www.facebook.com/profile.php?id=61572382944649" target="_blank" rel="noopener noreferrer" style={footerStyles.socialLink}>
            <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="Facebook" style={footerStyles.socialIcon} />
          </a>
          <a href="https://www.linkedin.com/company/syed-solar-energy-pvt-ltd" target="_blank" rel="noopener noreferrer" style={footerStyles.socialLink}>
            <img src="https://cdn-icons-png.flaticon.com/512/145/145807.png" alt="LinkedIn" style={footerStyles.socialIcon} />
          </a>
          <a href="https://wa.me/923044678929" target="_blank" rel="noopener noreferrer" style={footerStyles.socialLink}>
            <img src="https://cdn-icons-png.flaticon.com/512/733/733585.png" alt="WhatsApp" style={footerStyles.socialIcon} />
          </a>
          <a href="https://www.instagram.com/syed.solar.energy" target="_blank" rel="noopener noreferrer" style={footerStyles.socialLink}>
            <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="Instagram" style={footerStyles.socialIcon} />
          </a>
          <a href="https://www.tiktok.com/@syed_solar_energy" target="_blank" rel="noopener noreferrer" style={footerStyles.socialLink}>
            <img src="https://cdn-icons-png.flaticon.com/512/3046/3046120.png" alt="TikTok" style={footerStyles.socialIcon} />
          </a>
        </div>

        {/* Google Review */}
        <div style={footerStyles.reviewRow}>
          <a href="https://g.co/kgs/oN8oztk" target="_blank" rel="noopener noreferrer" style={footerStyles.reviewLink}>
            <span style={{ fontSize: 22, marginRight: 8, color: "#ffa000" }}>⭐</span>
            Give us a 5-Star Google Review
          </a>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={footerStyles.bottomBar}>
        &copy; {new Date().getFullYear()} Syed Solar Energy Pvt Ltd. All rights reserved.
      </div>
    </footer>
  );
}

const footerStyles = {
  wrapper: {
    background: "linear-gradient(90deg,#FF6B35 0%,#F7931E 100%)",
    color: "white",
    marginTop: 35,
    paddingTop: 30,
    boxShadow: "0 -2px 14px #ff980018"
  },
  container: {
    maxWidth: 1150,
    margin: "0 auto",
    padding: "0 28px 20px 28px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  logoBlock: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    marginBottom: 12,
  },
  logo: {
    width: 65,
    height: 65,
    borderRadius: 10,
    boxShadow: "0 2px 10px #fff9",
    background: "#fff",
    objectFit: "contain"
  },
  companyName: {
    fontWeight: 900,
    fontSize: 20,
    letterSpacing: 0.5,
    color: "#fff"
  },
  tagline: {
    fontSize: 14,
    color: "#ffe082",
    fontWeight: 600
  },
  contactBlock: {
    margin: "13px 0 6px 0",
    textAlign: "center"
  },
  contactRow: {
    margin: "2px 0",
    fontSize: 15,
    display: "flex",
    alignItems: "center",
    gap: 7,
    justifyContent: "center"
  },
  icon: {
    fontSize: 17,
    color: "#ffd54f"
  },
  link: {
    color: "#fffde7",
    textDecoration: "underline",
    fontWeight: 600
  },
  socialBlock: {
    display: "flex",
    gap: 12,
    margin: "15px 0 0 0",
    justifyContent: "center"
  },
  socialLink: {
    display: "inline-block",
    padding: 2,
    borderRadius: 10,
    background: "rgba(255,255,255,0.11)",
    transition: "background 0.2s",
  },
  socialIcon: {
    width: 31,
    height: 31,
    filter: "drop-shadow(0 0 2px #fff4)",
    verticalAlign: "middle"
  },
  reviewRow: {
    marginTop: 16,
    textAlign: "center"
  },
  reviewLink: {
    color: "#fff",
    background: "#fffde722",
    borderRadius: 7,
    padding: "7px 19px",
    fontWeight: 800,
    fontSize: 17.5,
    textDecoration: "none",
    display: "inline-block",
    transition: "background .2s"
  },
  bottomBar: {
    marginTop: 22,
    textAlign: "center",
    background: "#e65100ee",
    fontSize: 14,
    padding: "11px 0 6px 0",
    color: "#fffde7",
    borderTop: "1.5px solid #fff2",
    letterSpacing: 0.3,
    fontWeight: 500
  }
};
