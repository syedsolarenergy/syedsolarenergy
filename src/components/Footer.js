import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

const SERVICES = [
  { to: "/services", label: "Solar Installation" },
  { to: "/loadcalculator", label: "Load Calculator" },
  { to: "/quotation", label: "Free Quotation" },
  { to: "/projects", label: "Our Projects" },
];

const COMPANY = [
  { to: "/about", label: "About Us" },
  { to: "/careers", label: "Careers" },
  { to: "/blog", label: "Blog" },
  { to: "/faq", label: "FAQs" },
  { to: "/contact", label: "Contact" },
];

const SOCIAL = [
  { href: "https://www.facebook.com/profile.php?id=61572382944649", label: "Facebook" },
  { href: "https://www.instagram.com/syed.solar.energy", label: "Instagram" },
  { href: "https://www.linkedin.com/company/syed-solar-energy-pvt-ltd", label: "LinkedIn" },
  { href: "https://www.tiktok.com/@syed_solar_energy", label: "TikTok" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__top">
          {/* Brand + address */}
          <div className="site-footer__brand">
            <div className="brand">
              <img src={logo} alt="" className="brand__mark" width="40" height="40" />
              <span className="brand__text">
                <strong>Syed Solar Energy</strong>
                <small>Pvt Ltd</small>
              </span>
            </div>

            <p className="site-footer__blurb">
              Solar design, supply and installation across Khyber Pakhtunkhwa.
              Daytime and hybrid systems, net metering and after-sales support.
            </p>

            <address className="site-footer__address">
              Jalil Market, Umar Gull Chowk, Bara Road,
              near Bacha Khan International Airport, Peshawar
            </address>
          </div>

          {/* Link columns */}
          <nav className="site-footer__col" aria-label="Services">
            <h2 className="site-footer__heading">Services</h2>
            <ul>
              {SERVICES.map((l) => (
                <li key={l.to}><Link to={l.to}>{l.label}</Link></li>
              ))}
            </ul>
          </nav>

          <nav className="site-footer__col" aria-label="Company">
            <h2 className="site-footer__heading">Company</h2>
            <ul>
              {COMPANY.map((l) => (
                <li key={l.to}><Link to={l.to}>{l.label}</Link></li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div className="site-footer__col">
            <h2 className="site-footer__heading">Get in touch</h2>
            <ul>
              <li><a href="tel:03044678929">0304 4678929</a></li>
              <li><a href="tel:03075596695">0307 5596695</a></li>
              <li><a href="mailto:sales@syedsolarenergy.com">sales@syedsolarenergy.com</a></li>
              <li>
                <a
                  href="https://wa.me/923044678929"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp us
                </a>
              </li>
            </ul>

            <h2 className="site-footer__heading site-footer__heading--spaced">Follow</h2>
            <ul className="site-footer__social">
              {SOCIAL.map((s) => (
                <li key={s.href}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer">{s.label}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="site-footer__bottom">
          <p>&copy; {year} Syed Solar Energy Pvt Ltd. All rights reserved.</p>
          <p className="site-footer__verify">
            Verify a document:{" "}
            <Link to="/verify-certificate">employment</Link>{" · "}
            <Link to="/verify-offer">offer letter</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
