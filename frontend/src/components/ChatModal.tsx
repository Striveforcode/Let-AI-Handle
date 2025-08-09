import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  Paper,
  Avatar,
  CircularProgress,
  Alert,
  IconButton,
  Divider,
} from "@mui/material";
import {
  Chat as ChatIcon,
  Send as SendIcon,
  Close as CloseIcon,
  Psychology as PsychologyIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { chatAPI } from "../services/api";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatModalProps {
  open: boolean;
  onClose: () => void;
  documentId: string;
  documentTitle: string;
}

const ChatModal: React.FC<ChatModalProps> = ({
  open,
  onClose,
  documentId,
  documentTitle,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (open && documentId) {
      initializeChatSession();
    }
  }, [open, documentId]);

  const initializeChatSession = async () => {
    try {
      setInitializing(true);
      setError(null);
      const response = await chatAPI.startChatSession(documentId);

      if (response.success) {
        setSessionId(response.data.sessionId);
        setMessages(response.data.messages || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to start chat session");
    } finally {
      setInitializing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || !sessionId || loading) return;

    const userMessage = currentMessage.trim();
    setCurrentMessage("");
    setLoading(true);
    setError(null);

    try {
      const response = await chatAPI.sendMessage(sessionId, userMessage);

      if (response.success) {
        setMessages(response.data.messages || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send message");
      // Re-add the message back to input on error
      setCurrentMessage(userMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          height: "80vh",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          backgroundColor: "#f8f9fa",
          borderBottom: "1px solid #e9ecef",
        }}
      >
        <ChatIcon sx={{ color: "#f57c00" }} />
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            AI Chat
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Ask questions about: {documentTitle}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          p: 0,
          overflow: "hidden",
        }}
      >
        {initializing && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              gap: 2,
            }}
          >
            <CircularProgress sx={{ color: "#f57c00" }} />
            <Typography variant="body1">Preparing chat session...</Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}

        {!initializing && sessionId && (
          <Box
            sx={{
              flexGrow: 1,
              overflowY: "auto",
              p: 2,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {messages.map((message, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 1,
                  flexDirection:
                    message.role === "user" ? "row-reverse" : "row",
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: message.role === "user" ? "#2196f3" : "#f57c00",
                    width: 32,
                    height: 32,
                  }}
                >
                  {message.role === "user" ? (
                    <PersonIcon fontSize="small" />
                  ) : (
                    <PsychologyIcon fontSize="small" />
                  )}
                </Avatar>
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    maxWidth: "70%",
                    backgroundColor:
                      message.role === "user" ? "#e3f2fd" : "#fff3e0",
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    {message.content}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="textSecondary"
                    sx={{ fontSize: "0.75rem" }}
                  >
                    {formatTimestamp(message.timestamp)}
                  </Typography>
                </Paper>
              </Box>
            ))}

            {loading && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  justifyContent: "flex-start",
                }}
              >
                <Avatar sx={{ bgcolor: "#f57c00", width: 32, height: 32 }}>
                  <PsychologyIcon fontSize="small" />
                </Avatar>
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    backgroundColor: "#fff3e0",
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <CircularProgress size={16} sx={{ color: "#f57c00" }} />
                  <Typography variant="body2" color="textSecondary">
                    AI is thinking...
                  </Typography>
                </Paper>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>
        )}
      </DialogContent>

      {!initializing && sessionId && (
        <>
          <Divider />
          <DialogActions
            sx={{
              p: 2,
              gap: 1,
              alignItems: "flex-end",
            }}
          >
            <TextField
              fullWidth
              multiline
              maxRows={3}
              placeholder="Ask a question about the document..."
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              variant="outlined"
              size="small"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />
            <Button
              variant="contained"
              onClick={handleSendMessage}
              disabled={!currentMessage.trim() || loading}
              sx={{
                backgroundColor: "#f57c00",
                "&:hover": { backgroundColor: "#ee8d00" },
                minWidth: "auto",
                px: 2,
              }}
            >
              <SendIcon />
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

export default ChatModal;
