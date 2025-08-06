import React from "react";
import { Box, Typography, Container } from "@mui/material";

interface LoginProps {
  theme: "light" | "dark";
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ theme, onLogin }) => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: theme === "dark" ? "#1e1e1e" : "#f5f5f5",
        padding: "2rem 0",
        transition: "background-color 0.3s ease",
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            textAlign: "center",
            padding: "4rem 2rem",
            backgroundColor: theme === "dark" ? "#333" : "#fff",
            borderRadius: 2,
            boxShadow: 3,
            marginTop: "2rem",
          }}
        >
          <Typography
            variant="h3"
            sx={{
              marginBottom: "2rem",
              color: "#f57c00",
              font: "inherit",
              fontWeight: 600,
            }}
          >
            Login
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: theme === "dark" ? "white" : "black",
              font: "inherit",
              fontSize: "1.1rem",
            }}
          >
            Login functionality will be implemented here.
            <br />
            This will include email/password authentication.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Login;
