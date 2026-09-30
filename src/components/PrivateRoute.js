import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { rpc, getSessionToken } from "../supabaseClient";

/**
 * Gate for staff-only pages.
 *
 * The presence of a token in localStorage is not proof of anything — it
 * can be typed in by hand. The token is checked against the database,
 * which is also what decides whether any data actually comes back.
 * This guard is for user experience: it sends people to the login page
 * instead of showing them an empty screen.
 */
export default function PrivateRoute({ children }) {
  const location = useLocation();
  const [status, setStatus] = useState(() =>
    getSessionToken() ? "checking" : "denied"
  );

  useEffect(() => {
    let cancelled = false;

    if (!getSessionToken()) {
      setStatus("denied");
      return;
    }

    (async () => {
      try {
        const result = await rpc("app_current_user");
        if (cancelled) return;

        if (result?.ok) {
          localStorage.setItem("loggedInUser", result.user.username);
          localStorage.setItem("userRole", result.user.role || "user");
          localStorage.setItem(
            "userPermissions",
            JSON.stringify(result.permissions || {})
          );
          setStatus("allowed");
        } else {
          // Expired or revoked — clear the stale token so the UI stops
          // pretending the user is signed in.
          localStorage.removeItem("sessionToken");
          localStorage.removeItem("loggedInUser");
          setStatus("denied");
        }
      } catch {
        // Network failure shouldn't log someone out mid-session; the
        // database still refuses the data if the session is invalid.
        if (!cancelled) setStatus("allowed");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  if (status === "checking") {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "grid",
          placeItems: "center",
          color: "#6b7280",
          font: "500 15px/1.5 system-ui, sans-serif",
        }}
      >
        Checking your session…
      </div>
    );
  }

  if (status === "denied") {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
