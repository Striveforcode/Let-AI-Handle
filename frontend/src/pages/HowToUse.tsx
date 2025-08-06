import React from "react";
import { Box, Typography, Container } from "@mui/material";

interface HowToUseProps {
  theme: "light" | "dark";
}

const HowToUse: React.FC<HowToUseProps> = ({ theme }) => {
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
            How to Use Let-AI-Handle
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: theme === "dark" ? "white" : "black",
              font: "inherit",
              fontSize: "1.1rem",
            }}
          >
            This page will contain detailed instructions on how to use the
            platform.
            <br />
            Step-by-step guides for all features will be provided here.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default HowToUse;
