import React, { useState } from "react";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { authAPI } from "../services/api";

interface RegisterProps {
  theme: "light" | "dark";
}

const Register: React.FC<RegisterProps> = ({ theme }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"details" | "otp">("details");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [countdown, setCountdown] = useState(0);

  const navigate = useNavigate();
  const { register } = useAuth();

  const countryCodes = [
    { code: "+91", country: "India" },
    { code: "+1", country: "USA" },
    { code: "+44", country: "UK" },
    { code: "+61", country: "Australia" },
    { code: "+86", country: "China" },
    { code: "+81", country: "Japan" },
    { code: "+49", country: "Germany" },
    { code: "+33", country: "France" },
    { code: "+39", country: "Italy" },
    { code: "+34", country: "Spain" },
  ];

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendOTP = async () => {
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }

    if (!phoneNumber.trim()) {
      setError("Please enter your phone number");
      return;
    }

    if (phoneNumber.length < 10) {
      setError("Please enter a valid phone number");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await authAPI.registerInit(phoneNumber, countryCode, name, email);

      setStep("otp");
      setSuccess("OTP sent successfully!");
      setCountdown(30);

      // Start countdown
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      setError("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      setError("Please enter the OTP");
      return;
    }

    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await register(phoneNumber, countryCode, otp);
      setSuccess("Registration successful! Redirecting...");
      setTimeout(() => {
        navigate("/home");
      }, 1000);
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;

    setLoading(true);
    setError("");

    try {
      await authAPI.registerInit(phoneNumber, countryCode, name, email);

      setSuccess("OTP resent successfully!");
      setCountdown(30);

      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      setError("Failed to resend OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDetails = () => {
    setStep("details");
    setOtp("");
    setError("");
    setSuccess("");
    setCountdown(0);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          bgcolor: theme === "dark" ? "#333" : "white",
          color: theme === "dark" ? "white" : "black",
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{
            textAlign: "center",
            color: "#f57c00",
            fontWeight: "bold",
            mb: 3,
          }}
        >
          Register for Let-AI-Handle
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

        {step === "details" ? (
          <Box>
            <Typography variant="body1" sx={{ mb: 3, textAlign: "center" }}>
              Create your account to get started
            </Typography>

            <TextField
              fullWidth
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              label="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              type="email"
              sx={{ mb: 3 }}
            />

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={4}>
                <FormControl fullWidth>
                  <InputLabel>Country</InputLabel>
                  <Select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    label="Country"
                  >
                    {countryCodes.map((country) => (
                      <MenuItem key={country.code} value={country.code}>
                        {country.code} ({country.country})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={8}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter your phone number"
                  type="tel"
                />
              </Grid>
            </Grid>

            <Button
              fullWidth
              variant="contained"
              onClick={handleSendOTP}
              disabled={
                loading || !name.trim() || !email.trim() || !phoneNumber.trim()
              }
              sx={{
                bgcolor: "#f57c00",
                "&:hover": { bgcolor: "#e65100" },
                py: 1.5,
                fontSize: "1.1rem",
              }}
            >
              {loading ? <CircularProgress size={24} /> : "Send OTP"}
            </Button>
          </Box>
        ) : (
          <Box>
            <Typography variant="body1" sx={{ mb: 3, textAlign: "center" }}>
              Enter the 6-digit code sent to {countryCode} {phoneNumber}
            </Typography>

            <TextField
              fullWidth
              label="OTP"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="Enter 6-digit OTP"
              type="text"
              sx={{ mb: 3 }}
              inputProps={{ maxLength: 6 }}
            />

            <Button
              fullWidth
              variant="contained"
              onClick={handleVerifyOTP}
              disabled={loading || otp.length !== 6}
              sx={{
                bgcolor: "#f57c00",
                "&:hover": { bgcolor: "#e65100" },
                py: 1.5,
                fontSize: "1.1rem",
                mb: 2,
              }}
            >
              {loading ? <CircularProgress size={24} /> : "Verify OTP"}
            </Button>

            <Button
              fullWidth
              variant="outlined"
              onClick={handleResendOTP}
              disabled={loading || countdown > 0}
              sx={{ mb: 2 }}
            >
              {countdown > 0 ? `Resend OTP in ${countdown}s` : "Resend OTP"}
            </Button>

            <Button
              fullWidth
              variant="text"
              onClick={handleBackToDetails}
              disabled={loading}
            >
              Back to Details
            </Button>
          </Box>
        )}

        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Typography variant="body2">
            Already have an account?{" "}
            <Link
              to="/login"
              style={{
                color: "#f57c00",
                textDecoration: "none",
                fontWeight: "bold",
              }}
            >
              Login here
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;
