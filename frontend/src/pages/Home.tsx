import React, { useState } from "react";
import {
  Box,
  Typography,
  Container,
  Button,
  Grid,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  CloudUpload as CloudUploadIcon,
  Description as DescriptionIcon,
  Chat as ChatIcon,
  Analytics as AnalyticsIcon,
} from "@mui/icons-material";
import DocumentUpload from "../components/DocumentUpload";

interface HomeProps {
  theme: "light" | "dark";
}

const Home: React.FC<HomeProps> = ({ theme }) => {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const handleUploadSuccess = () => {
    setUploadDialogOpen(false);
  };

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
        {/* Welcome Section */}
        <Box
          sx={{
            textAlign: "center",
            padding: "4rem 2rem",
            backgroundColor: theme === "dark" ? "#333" : "#fff",
            borderRadius: 2,
            boxShadow: 3,
            marginBottom: "3rem",
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
              marginBottom: "2rem",
            }}
          >
            Upload documents, generate insights, and chat with AI to enhance
            your productivity.
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<CloudUploadIcon />}
            onClick={() => setUploadDialogOpen(true)}
            sx={{
              backgroundColor: "#f57c00",
              "&:hover": {
                backgroundColor: "#ee8d00",
              },
              py: 1.5,
              px: 3,
            }}
          >
            Upload Your First Document
          </Button>
        </Box>

        {/* Features Grid */}
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                height: "100%",
                backgroundColor: theme === "dark" ? "#333" : "#fff",
                color: theme === "dark" ? "white" : "black",
                textAlign: "center",
                transition: "transform 0.2s ease",
                "&:hover": {
                  transform: "translateY(-5px)",
                },
              }}
            >
              <DescriptionIcon sx={{ fontSize: 48, color: "#f57c00", mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Document Upload
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Upload your documents in various formats including PDF, DOC,
                DOCX, and more.
              </Typography>
              <Button
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                onClick={() => setUploadDialogOpen(true)}
                sx={{ borderColor: "#f57c00", color: "#f57c00" }}
              >
                Upload Now
              </Button>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                height: "100%",
                backgroundColor: theme === "dark" ? "#333" : "#fff",
                color: theme === "dark" ? "white" : "black",
                textAlign: "center",
                transition: "transform 0.2s ease",
                "&:hover": {
                  transform: "translateY(-5px)",
                },
              }}
            >
              <AnalyticsIcon sx={{ fontSize: 48, color: "#f57c00", mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                AI Analysis
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Get intelligent insights, summaries, and key points extracted
                from your documents.
              </Typography>
              <Button
                variant="outlined"
                disabled
                sx={{ borderColor: "#ccc", color: "#ccc" }}
              >
                Coming Soon
              </Button>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                height: "100%",
                backgroundColor: theme === "dark" ? "#333" : "#fff",
                color: theme === "dark" ? "white" : "black",
                textAlign: "center",
                transition: "transform 0.2s ease",
                "&:hover": {
                  transform: "translateY(-5px)",
                },
              }}
            >
              <ChatIcon sx={{ fontSize: 48, color: "#f57c00", mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                AI Chat
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Chat with AI about your documents to get clarifications and
                deeper insights.
              </Typography>
              <Button
                variant="outlined"
                disabled
                sx={{ borderColor: "#ccc", color: "#ccc" }}
              >
                Coming Soon
              </Button>
            </Paper>
          </Grid>
        </Grid>

        {/* Upload Dialog */}
        <Dialog
          open={uploadDialogOpen}
          onClose={() => setUploadDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Upload New Document</DialogTitle>
          <DialogContent>
            <DocumentUpload
              theme={theme}
              onUploadSuccess={handleUploadSuccess}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Home;
