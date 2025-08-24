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
            <span>Jalil Market Umar Gull Chwock Bara Road near Bacha Khan International Airport, Peshawar</span>
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

        {/* App Download Section */}
        <div style={footerStyles.appDownloadSection}>
          <h3 style={footerStyles.appDownloadTitle}>Download Our App</h3>
          <div style={footerStyles.appDownloadButtons}>
            <a 
              href="https://play.google.com/store/apps/details?id=com.syedsolarenergy" 
              target="_blank" 
              rel="noopener noreferrer"
              style={footerStyles.appButton}
            >
              <div style={footerStyles.appButtonInner}>
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" 
                  alt="Get on Google Play" 
                  style={footerStyles.appButtonImage} 
                />
              </div>
            </a>
            <a 
              href="https://apps.apple.com/pk/app/syed-solar-energy/id1234567890" 
              target="_blank" 
              rel="noopener noreferrer"
              style={footerStyles.appButton}
            >
              <div style={footerStyles.appButtonInner}>
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" 
                  alt="Download on the App Store" 
                  style={footerStyles.appButtonImage} 
                />
              </div>
            </a>
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
                    {/* New FAQ Link */}
          <a href="/faq" target="_blank" rel="noopener noreferrer" style={footerStyles.socialLink}>
            <img src="https://cdn-icons-png.flaticon.com/512/709/709496.png" alt="FAQ" style={footerStyles.socialIcon} />
          </a>

          {/* New Blog Link */}
          <a href="/blog" target="_blank" rel="noopener noreferrer" style={footerStyles.socialLink}>
            <img src="https://cdn-icons-png.flaticon.com/512/1828/1828884.png" alt="Blog" style={footerStyles.socialIcon} />
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
    width: "clamp(50px, 8vw, 65px)",
    height: "clamp(50px, 8vw, 65px)",
    borderRadius: 10,
    boxShadow: "0 2px 10px #fff9",
    background: "#fff",
    objectFit: "contain"
  },
  companyName: {
    fontWeight: 900,
    fontSize: "clamp(16px, 3vw, 20px)",
    letterSpacing: 0.5,
    color: "#fff"
  },
  tagline: {
    fontSize: "clamp(12px, 2vw, 14px)",
    color: "#ffe082",
    fontWeight: 600
  },
  contactBlock: {
    margin: "13px 0 6px 0",
    textAlign: "center"
  },
  contactRow: {
    margin: "2px 0",
    fontSize: "clamp(13px, 2vw, 15px)",
    display: "flex",
    alignItems: "center",
    gap: 7,
    justifyContent: "center",
    flexWrap: "wrap"
  },
  icon: {
    fontSize: 17,
    color: "#ffd54f",
    flexShrink: 0
  },
  link: {
    color: "#fffde7",
    textDecoration: "underline",
    fontWeight: 600
  },
  // App Download Styles
  appDownloadSection: {
    margin: "15px 0 0 0",
    textAlign: "center",
    width: "100%"
  },
  appDownloadTitle: {
    color: "#fff",
    fontSize: "clamp(16px, 2.5vw, 18px)",
    fontWeight: 700,
    marginBottom: "12px"
  },
  appDownloadButtons: {
    display: "flex",
    justifyContent: "center",
    gap: "15px",
    flexWrap: "wrap"
  },
  appButton: {
    display: "inline-block",
    transition: "transform 0.3s ease"
  },
  appButtonInner: {
    background: "rgba(255,255,255,0.1)",
    borderRadius: "12px",
    padding: "5px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    transition: "all 0.3s ease"
  },
  appButtonImage: {
    height: "clamp(35px, 7vw, 50px)",
    borderRadius: "8px",
    display: "block"
  },
  // Social Icons
  socialBlock: {
    display: "flex",
    gap: 12,
    margin: "15px 0 0 0",
    justifyContent: "center",
    flexWrap: "wrap"
  },
  socialLink: {
    display: "inline-block",
    padding: 2,
    borderRadius: 10,
    background: "rgba(255,255,255,0.11)",
    transition: "all 0.2s",
  },
  socialIcon: {
    width: "clamp(25px, 5vw, 31px)",
    height: "clamp(25px, 5vw, 31px)",
    filter: "drop-shadow(0 0 2px #fff4)",
    verticalAlign: "middle"
  },
  reviewRow: {
    marginTop: "clamp(10px, 2vw, 16px)",
    textAlign: "center"
  },
  reviewLink: {
    color: "#fff",
    background: "#fffde722",
    borderRadius: 7,
    padding: "clamp(5px, 1.5vw, 7px) clamp(15px, 3vw, 19px)",
    fontWeight: 800,
    fontSize: "clamp(15px, 2.5vw, 17.5px)",
    textDecoration: "none",
    display: "inline-block",
    transition: "background .2s"
  },
  bottomBar: {
    marginTop: "clamp(15px, 3vw, 22px)",
    textAlign: "center",
    background: "#e65100ee",
    fontSize: "clamp(12px, 2vw, 14px)",
    padding: "clamp(8px, 1.5vw, 11px) 0",
    color: "#fffde7",
    borderTop: "1.5px solid #fff2",
    letterSpacing: 0.3,
    fontWeight: 500
  }
};

// Add hover effects
const hoverStyles = `
  .app-button:hover {
    transform: translateY(-3px) scale(1.05);
    filter: drop-shadow(0 5px 10px rgba(0,0,0,0.2));
  }
  
  .app-button:hover .app-button-inner {
    background: rgba(255,255,255,0.2);
    box-shadow: 0 6px 15px rgba(0,0,0,0.25);
  }
  
  .social-link:hover {
    transform: translateY(-2px) scale(1.1);
    background: rgba(255,255,255,0.25);
  }
  
  .review-link:hover {
    background: #fffde733;
    transform: translateY(-2px);
  }
`;

// Inject hover styles
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`@media (hover:hover) { ${hoverStyles} }`, styleSheet.cssRules.length);