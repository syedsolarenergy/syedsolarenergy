import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { rpc, getSessionToken } from "../supabaseClient";
import logo from "../assets/logo.png";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/services", label: "Services" },
  { to: "/projects", label: "Projects" },
  { to: "/loadcalculator", label: "Load Calculator" },
  { to: "/quotation", label: "Get a Quote" },
  { to: "/blog", label: "Blog" },
  { to: "/careers", label: "Careers" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [stuck, setStuck] = useState(false);
  const location = useLocation();
  const panelRef = useRef(null);
  const toggleRef = useRef(null);
  const isLoggedIn = !!getSessionToken();

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // While the menu is open: lock scroll, close on Escape, close on an
  // outside click. Without these a mobile menu feels broken.
  useEffect(() => {
    if (!open) return;

    const onKey = (e) => e.key === "Escape" && setOpen(false);
    const onClick = (e) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target) &&
        toggleRef.current && !toggleRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  // Strengthen the header's edge once content scrolls beneath it.
  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const logout = async () => {
    try { await rpc("app_logout"); } catch { /* sign out regardless */ }
    ["sessionToken", "loggedInUser", "userRole", "userPermissions", "loggedIn"]
      .forEach((k) => localStorage.removeItem(k));
    window.location.href = "/";
  };

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>

      {/* Seasonal themes reveal this band; the everyday theme hides it. */}
      <div className="theme-ribbon">Syed Solar Energy — wishing you a blessed season</div>

      <header className={"site-header" + (stuck ? " is-stuck" : "")}>
        <div className="site-header__inner container">
          <Link to="/" className="brand" aria-label="Syed Solar Energy — home">
            <img src={logo} alt="" className="brand__mark" width="36" height="36" />
            <span className="brand__text">
              <strong>Syed Solar Energy</strong>
              <small>Pvt Ltd</small>
            </span>
          </Link>

          <nav className="nav-desktop" aria-label="Main">
            {LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) =>
                  "nav-desktop__link" + (isActive ? " is-active" : "")
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="site-header__actions">
            {isLoggedIn ? (
              <>
                <Link to="/dashboard" className="btn btn--secondary nav-cta">Dashboard</Link>
                <button onClick={logout} className="btn btn--ghost">Sign out</button>
              </>
            ) : (
              <Link to="/contact" className="btn btn--primary nav-cta">Talk to us</Link>
            )}

            <button
              ref={toggleRef}
              className="nav-toggle"
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
            >
              <span className={"nav-toggle__bars" + (open ? " is-open" : "")}>
                <span /><span /><span />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div className={"nav-mobile" + (open ? " is-open" : "")} hidden={!open}>
        <nav
          id="mobile-nav"
          ref={panelRef}
          className="nav-mobile__panel"
          aria-label="Main"
        >
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                "nav-mobile__link" + (isActive ? " is-active" : "")
              }
            >
              {l.label}
            </NavLink>
          ))}

          <div className="nav-mobile__footer">
            {isLoggedIn ? (
              <>
                <Link to="/dashboard" className="btn btn--secondary btn--block">Dashboard</Link>
                <button onClick={logout} className="btn btn--ghost btn--block">Sign out</button>
              </>
            ) : (
              <>
                <Link to="/quotation" className="btn btn--primary btn--block">Get a free quote</Link>
                <a href="tel:03044678929" className="btn btn--secondary btn--block">
                  Call 0304 4678929
                </a>
              </>
            )}
          </div>
        </nav>
      </div>
    </>
  );
}
