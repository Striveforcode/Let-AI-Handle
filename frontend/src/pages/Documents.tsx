import React from "react";
import { Box, Typography, Container } from "@mui/material";

interface DocumentsProps {
  theme: "light" | "dark";
}

const Documents: React.FC<DocumentsProps> = ({ theme }) => {
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
            Documents
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: theme === "dark" ? "white" : "black",
              font: "inherit",
              fontSize: "1.1rem",
            }}
          >
            This page will display all your uploaded documents.
            <br />
            You'll be able to view, manage, and interact with your documents
            here.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Documents;
