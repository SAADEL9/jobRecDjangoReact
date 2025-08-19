import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  MenuItem,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const jobTypes = [
  { value: 'FULL_TIME', label: 'Full Time' },
  { value: 'PART_TIME', label: 'Part Time' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'INTERNSHIP', label: 'Internship' },
];

export default function CreateOffer() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    type: "FULL_TIME"
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [recruiterId, setRecruiterId] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    // Fetch recruiter ID
    axios.get("/api/user/me", { headers })
      .then(res => {
        setRecruiterId(res.data.id || res.data.recruiterId || "");
      })
      .catch(() => setError("Failed to fetch user data"));
  }, [token, navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);
    setError("");
    setLoading(true);

    try {
      if (!recruiterId) {
        throw new Error("Recruiter ID not found");
      }
      // Send recruiterId in the body, not as a query param
      await axios.post(
        "/api/recruiter/offers",
        { ...formData, recruiterId },
        { headers }
      );
      setSuccess(true);
      setFormData({
        title: "",
        description: "",
        location: "",
        type: "FULL_TIME"
      });
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Error creating offer";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom color="primary">
          Create New Job Offer
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Job offer created successfully! Redirecting...
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Job Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            margin="normal"
          />

          <TextField
            fullWidth
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            margin="normal"
          />

          <TextField
            select
            fullWidth
            label="Job Type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            margin="normal"
          >
            {jobTypes.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            multiline
            rows={4}
            margin="normal"
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            disabled={loading}
            sx={{ mt: 3 }}
          >
            {loading ? <CircularProgress size={24} /> : "Create Job Offer"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}