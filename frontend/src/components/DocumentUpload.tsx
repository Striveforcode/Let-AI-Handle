import React, { useState, useCallback } from "react";
import {
  Box,
  Button,
  Typography,
  TextField,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
} from "@mui/material";
import {
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { useDropzone } from "react-dropzone";
import { documentAPI } from "../services/api";

interface DocumentUploadProps {
  theme: "light" | "dark";
  onUploadSuccess?: () => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  theme,
  onUploadSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
        setError("");
        // Auto-set title from filename if not already set
        if (!title) {
          const fileName = acceptedFiles[0].name;
          const nameWithoutExtension = fileName.replace(/\.[^/.]+$/, "");
          setTitle(nameWithoutExtension);
        }
      }
    },
    [title]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "text/plain": [".txt"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
    },
    multiple: false,
  });

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    if (!title.trim()) {
      setError("Please enter a title for the document");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      await documentAPI.uploadDocument(file, {
        title: title.trim(),
        description: description.trim() || undefined,
        tags: tags.length > 0 ? tags : undefined,
      });

      setSuccess("Document uploaded successfully!");
      setFile(null);
      setTitle("");
      setDescription("");
      setTags([]);

      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to upload document. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        backgroundColor: theme === "dark" ? "#333" : "#fff",
        color: theme === "dark" ? "white" : "black",
      }}
    >
      <Typography
        variant="h5"
        sx={{ mb: 3, color: "#f57c00", fontWeight: 600 }}
      >
        Upload Document
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        {/* File Upload Area */}
        <Box
          {...getRootProps()}
          sx={{
            border: "2px dashed",
            borderColor: isDragActive
              ? "#f57c00"
              : theme === "dark"
              ? "#555"
              : "#ccc",
            borderRadius: 2,
            p: 4,
            textAlign: "center",
            cursor: "pointer",
            backgroundColor: isDragActive
              ? "rgba(245, 124, 0, 0.1)"
              : "transparent",
            mb: 3,
            transition: "all 0.3s ease",
            "&:hover": {
              borderColor: "#f57c00",
              backgroundColor: "rgba(245, 124, 0, 0.05)",
            },
          }}
        >
          <input {...getInputProps()} />
          <CloudUploadIcon sx={{ fontSize: 48, color: "#f57c00", mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 1 }}>
            {isDragActive
              ? "Drop the file here"
              : "Drag & drop a file here, or click to select"}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Supported formats: PDF, DOC, DOCX, TXT, XLS, XLSX
          </Typography>
          {file && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                backgroundColor: "rgba(76, 175, 80, 0.1)",
                borderRadius: 1,
              }}
            >
              <Typography variant="body2" color="success.main">
                Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)}{" "}
                MB)
              </Typography>
            </Box>
          )}
        </Box>

        {/* Document Metadata */}
        <TextField
          fullWidth
          label="Document Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ mb: 2 }}
          required
        />

        <TextField
          fullWidth
          label="Description (Optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          rows={3}
          sx={{ mb: 2 }}
        />

        {/* Tags */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Tags (Optional)
          </Typography>
          <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
            <TextField
              size="small"
              placeholder="Add a tag"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={handleKeyPress}
              sx={{ flexGrow: 1 }}
            />
            <Button
              variant="outlined"
              onClick={handleAddTag}
              disabled={!newTag.trim()}
              startIcon={<AddIcon />}
            >
              Add
            </Button>
          </Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {tags.map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                onDelete={() => handleRemoveTag(tag)}
                deleteIcon={<DeleteIcon />}
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>
        </Box>

        {/* Upload Button */}
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={uploading || !file || !title.trim()}
          sx={{
            backgroundColor: "#f57c00",
            "&:hover": {
              backgroundColor: "#ee8d00",
            },
            py: 1.5,
          }}
        >
          {uploading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Upload Document"
          )}
        </Button>
      </form>
    </Paper>
  );
};

export default DocumentUpload;
