import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase, rpc } from "../supabaseClient";

/**
 * Seasonal theme for the public site.
 *
 * The choice lives in the database so staff can change it from the admin
 * panel without a deploy. It is applied by setting data-theme on <html>;
 * every colour in the stylesheet reads from theme tokens, so the whole
 * site changes at once.
 */

export const THEMES = [
  { id: "default",      label: "Everyday",            note: "Brand orange" },
  { id: "independence", label: "14 August",           note: "Independence Day — green" },
  { id: "ramzan",       label: "Ramzan Kareem",       note: "Indigo and gold" },
  { id: "eid-fitr",     label: "Eid ul Fitr",         note: "Festive teal" },
  { id: "eid-adha",     label: "Eid ul Adha",         note: "Bakra Eid — emerald" },
];

const VALID = THEMES.map((t) => t.id);
const CACHE_KEY = "active_theme";

const ThemeContext = createContext({
  theme: "default",
  setTheme: () => {},
  loading: true,
});

export function useTheme() {
  return useContext(ThemeContext);
}

function apply(theme) {
  const root = document.documentElement;
  if (theme && theme !== "default") {
    root.setAttribute("data-theme", theme);
  } else {
    root.removeAttribute("data-theme");
  }
}

export function ThemeProvider({ children }) {
  // Start from the cached value so the correct colours paint on first
  // frame rather than flashing orange and then switching.
  const [theme, setThemeState] = useState(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      return VALID.includes(cached) ? cached : "default";
    } catch {
      return "default";
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apply(theme);
  }, [theme]);

  // Confirm against the database, in case staff changed it.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data, error } = await supabase
          .from("site_settings")
          .select("value")
          .eq("key", CACHE_KEY)
          .maybeSingle();

        if (cancelled || error || !data) return;

        if (VALID.includes(data.value)) {
          setThemeState(data.value);
          try { localStorage.setItem(CACHE_KEY, data.value); } catch { /* ignore */ }
        }
      } catch {
        // Offline or blocked: keep the cached theme rather than flipping.
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  // Used by the admin panel. Returns true when the change was saved.
  const setTheme = useCallback(async (next) => {
    if (!VALID.includes(next)) return false;

    const previous = theme;
    setThemeState(next); // optimistic, so the switch feels instant

    try {
      const result = await rpc("app_set_theme", { p_theme: next });
      if (!result?.ok) {
        setThemeState(previous);
        return false;
      }
      try { localStorage.setItem(CACHE_KEY, next); } catch { /* ignore */ }
      return true;
    } catch {
      setThemeState(previous);
      return false;
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, loading }}>
      {children}
    </ThemeContext.Provider>
  );
}
