import React, { createContext, useContext, useState } from "react";

// Create context object
const GlobalContext = createContext();

// Export useGlobalContext hook
export function useGlobalContext() {
  return useContext(GlobalContext);
}

// Main provider component
export function GlobalProvider({ children }) {
  // Global state
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState("light");
  const [dashboardData, setDashboardData] = useState({});
  const [expenses, setExpenses] = useState([]);
  const [reports, setReports] = useState([]);
  const [staff, setStaff] = useState([]);
  // Add inventoryList and staffList for Dashboard and other consumers
  const [inventoryList, setInventoryList] = useState([]);
  const [staffList, setStaffList] = useState([]);

  return (
    <GlobalContext.Provider
      value={{
        user, setUser,
        theme, setTheme,
        dashboardData, setDashboardData,
        expenses, setExpenses,
        reports, setReports,
        staff, setStaff,
        inventoryList, setInventoryList,
        staffList, setStaffList,
        // ...add more global values here if needed
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}