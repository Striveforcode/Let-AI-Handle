import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Container,
  Grid,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Link,
} from "@mui/material";
import {
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Description as DescriptionIcon,
  Download as DownloadIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { documentAPI } from "../services/api";
import DocumentUpload from "../components/DocumentUpload";

interface DocumentsProps {
  theme: "light" | "dark";
}

interface Document {
  _id: string;
  title: string;
  description?: string;
  tags?: string[];
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadDate: string;
  status: string;
  fileUrl?: string;
}

const Documents: React.FC<DocumentsProps> = ({ theme }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [deletingDocument, setDeletingDocument] = useState<string | null>(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await documentAPI.getUserDocuments();
      setDocuments(response.data.documents || []);
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUploadSuccess = () => {
    setUploadDialogOpen(false);
    fetchDocuments();
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!window.confirm("Are you sure you want to delete this document?")) {
      return;
    }

    try {
      setDeletingDocument(documentId);
      await documentAPI.deleteDocument(documentId);
      setDocuments(documents.filter((doc) => doc._id !== documentId));
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete document");
    } finally {
      setDeletingDocument(null);
    }
  };

  const handleViewDocument = (document: Document) => {
    setSelectedDocument(document);
    setViewDialogOpen(true);
  };

  const handleDownloadDocument = (doc: Document) => {
    if (doc.fileUrl) {
      // Create a temporary link to download the file
      const link = window.document.createElement("a");
      link.href = `http://localhost:3001${doc.fileUrl}`;
      link.download = doc.fileName;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "uploaded":
        return "default";
      case "processing":
        return "warning";
      case "processed":
        return "success";
      case "error":
        return "error";
      default:
        return "default";
    }
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
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography
            variant="h3"
            sx={{
              color: "#f57c00",
              font: "inherit",
              fontWeight: 600,
            }}
          >
            Documents
          </Typography>
          <Button
            variant="contained"
            startIcon={<CloudUploadIcon />}
            onClick={() => setUploadDialogOpen(true)}
            sx={{
              backgroundColor: "#f57c00",
              "&:hover": {
                backgroundColor: "#ee8d00",
              },
            }}
          >
            Upload Document
          </Button>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "200px",
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Documents Grid */}
            {documents.length === 0 ? (
              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  textAlign: "center",
                  backgroundColor: theme === "dark" ? "#333" : "#fff",
                  color: theme === "dark" ? "white" : "black",
                }}
              >
                <DescriptionIcon
                  sx={{ fontSize: 64, color: "#f57c00", mb: 2 }}
                />
                <Typography variant="h5" sx={{ mb: 2 }}>
                  No Documents Yet
                </Typography>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  Upload your first document to get started with AI-powered
                  analysis.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<CloudUploadIcon />}
                  onClick={() => setUploadDialogOpen(true)}
                  sx={{
                    backgroundColor: "#f57c00",
                    "&:hover": {
                      backgroundColor: "#ee8d00",
                    },
                  }}
                >
                  Upload Your First Document
                </Button>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {documents.map((document) => (
                  <Grid item xs={12} sm={6} md={4} key={document._id}>
                    <Paper
                      elevation={3}
                      sx={{
                        p: 3,
                        height: "100%",
                        backgroundColor: theme === "dark" ? "#333" : "#fff",
                        color: theme === "dark" ? "white" : "black",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      {/* Document Header */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          mb: 2,
                        }}
                      >
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 600, mb: 1 }}
                          >
                            {document.title}
                          </Typography>
                          <Chip
                            label={document.status}
                            color={getStatusColor(document.status) as any}
                            size="small"
                          />
                        </Box>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteDocument(document._id)}
                          disabled={deletingDocument === document._id}
                          sx={{ color: "error.main" }}
                        >
                          {deletingDocument === document._id ? (
                            <CircularProgress size={20} />
                          ) : (
                            <DeleteIcon />
                          )}
                        </IconButton>
                      </Box>

                      {/* Document Info */}
                      <Box sx={{ flexGrow: 1 }}>
                        {document.description && (
                          <Typography
                            variant="body2"
                            sx={{ mb: 2, color: "text.secondary" }}
                          >
                            {document.description}
                          </Typography>
                        )}

                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>File:</strong> {document.fileName}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Size:</strong>{" "}
                          {formatFileSize(document.fileSize)}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Type:</strong> {document.fileType}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                          <strong>Uploaded:</strong>{" "}
                          {formatDate(document.uploadDate)}
                        </Typography>

                        {/* Tags */}
                        {document.tags && document.tags.length > 0 && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              <strong>Tags:</strong>
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 0.5,
                              }}
                            >
                              {document.tags.map((tag, index) => (
                                <Chip
                                  key={index}
                                  label={tag}
                                  size="small"
                                  variant="outlined"
                                />
                              ))}
                            </Box>
                          </Box>
                        )}
                      </Box>

                      {/* Actions */}
                      <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<VisibilityIcon />}
                          fullWidth
                          onClick={() => handleViewDocument(document)}
                        >
                          View
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<EditIcon />}
                          fullWidth
                        >
                          Edit
                        </Button>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        )}

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

        {/* View Document Dialog */}
        <Dialog
          open={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h6">Document Details</Typography>
              <IconButton onClick={() => setViewDialogOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            {selectedDocument && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h5" sx={{ mb: 2, color: "#f57c00" }}>
                  {selectedDocument.title}
                </Typography>

                <Chip
                  label={selectedDocument.status}
                  color={getStatusColor(selectedDocument.status) as any}
                  sx={{ mb: 2 }}
                />

                {selectedDocument.description && (
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedDocument.description}
                  </Typography>
                )}

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      File Name
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {selectedDocument.fileName}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      File Size
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {formatFileSize(selectedDocument.fileSize)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      File Type
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {selectedDocument.fileType}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Upload Date
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {formatDate(selectedDocument.uploadDate)}
                    </Typography>
                  </Grid>
                </Grid>

                {selectedDocument.tags && selectedDocument.tags.length > 0 && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      Tags
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {selectedDocument.tags.map((tag, index) => (
                        <Chip key={index} label={tag} variant="outlined" />
                      ))}
                    </Box>
                  </>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() =>
                selectedDocument && handleDownloadDocument(selectedDocument)
              }
              disabled={!selectedDocument?.fileUrl}
            >
              Download
            </Button>
            <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Documents;
