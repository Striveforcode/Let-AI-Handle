import React from "react";
import { Box, Typography, Container } from "@mui/material";

interface HomeProps {
  theme: "light" | "dark";
}

const Home: React.FC<HomeProps> = ({ theme }) => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: theme === "dark" ? "#1e1e1e" : "#f5f5f5",
        padding: "2rem 0",
        transition: "background-color 0.3s ease",
      }}
    >
      <Container maxWidth="lg">
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
            Welcome to Let-AI-Handle
          </Typography>
          <Typography
            variant="h5"
            sx={{
              marginBottom: "2rem",
              color: theme === "dark" ? "white" : "black",
              font: "inherit",
            }}
          >
            Your AI-powered document analysis platform
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: theme === "dark" ? "white" : "black",
              font: "inherit",
              fontSize: "1.1rem",
            }}
          >
            Upload documents, generate insights, and chat with AI to enhance your productivity.
            <br />
            This is the main dashboard where you'll be able to interact with your documents.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Home;
