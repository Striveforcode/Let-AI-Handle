import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Box } from "@mui/material";
import "@fontsource/poppins";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Pages
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import LandingPage from "./pages/LandingPage";
import HowToUse from "./pages/HowToUse";
import Documents from "./pages/Documents";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";

// Types
interface AppProps {}

const App: React.FC<AppProps> = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Get stored theme from localStorage
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") as "light" | "dark";
    if (storedTheme) {
      setTheme(storedTheme);
    }
  }, []);

  // Create theme
  const muiTheme = createTheme({
    palette: {
      mode: theme,
      primary: {
        main: "#f57c00",
      },
      secondary: {
        main: "#ff4d4d",
      },
    },
    typography: {
      fontFamily: "Poppins, sans-serif",
    },
  });

  const handleThemeToggle = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <Router>
        <Box
          sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
        >
          <Navbar
            theme={theme}
            onThemeToggle={handleThemeToggle}
            onLogout={() => setIsLoggedIn(false)}
          />
          <Box sx={{ flexGrow: 1 }}>
            <Routes>
              <Route path="/" element={<LandingPage theme={theme} />} />
              <Route path="/home" element={<Home theme={theme} />} />
              <Route path="/profile" element={<Profile theme={theme} />} />
              <Route
                path="/login"
                element={
                  <Login onLogin={() => setIsLoggedIn(true)} theme={theme} />
                }
              />
              <Route path="/register" element={<Register theme={theme} />} />
              <Route path="/how-to-use" element={<HowToUse theme={theme} />} />
              <Route path="/documents" element={<Documents theme={theme} />} />
              <Route
                path="/privacy-policy"
                element={<PrivacyPolicy theme={theme} />}
              />
              <Route
                path="/terms-of-service"
                element={<TermsOfService theme={theme} />}
              />
            </Routes>
          </Box>
          <Footer />
        </Box>
      </Router>
    </ThemeProvider>
  );
};

export default App;
