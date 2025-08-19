import React, { useState, useEffect } from "react";
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
import { authAPI, jobAPI } from '../api/api';

const jobTypes = [
  { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
  { value: 'temporary', label: 'Temporary' },
];

export default function CreateOffer() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    job_type: "full_time",
    company: "",
    experience_level: "mid",
    requirements: "",
    responsibilities: "",
    skills_required: ""
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [recruiterId, setRecruiterId] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("access_token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    // Fetch user profile
    authAPI.getCurrentUser()
      .then(res => {
        const userData = res.data;
        if (userData.user_type !== 'recruiter') {
          setError('Only recruiters can create job offers');
          navigate('/');
          return;
        }
        setRecruiterId(userData.id);
      })
      .catch(() => {
        setError('Failed to fetch user data');
        navigate('/login');
      });
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
      await jobAPI.createJob({ ...formData });
      setSuccess(true);
      setFormData({
        title: "",
        description: "",
        location: "",
        job_type: "full_time",
        company: "",
        experience_level: "mid",
        requirements: "",
        responsibilities: "",
        skills_required: ""
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
            label="Company Name"
            name="company"
            value={formData.company}
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
            name="job_type"
            value={formData.job_type}
            onChange={handleChange}
            margin="normal"
            required
          >
            {jobTypes.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            fullWidth
            label="Experience Level"
            name="experience_level"
            value={formData.experience_level}
            onChange={handleChange}
            margin="normal"
            required
          >
            <MenuItem value="entry">Entry Level</MenuItem>
            <MenuItem value="mid">Mid Level</MenuItem>
            <MenuItem value="senior">Senior Level</MenuItem>
            <MenuItem value="lead">Lead</MenuItem>
            <MenuItem value="manager">Manager</MenuItem>
          </TextField>

          <TextField
            fullWidth
            label="Job Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            multiline
            rows={4}
            margin="normal"
          />

          <TextField
            fullWidth
            label="Requirements"
            name="requirements"
            value={formData.requirements}
            onChange={handleChange}
            multiline
            rows={3}
            margin="normal"
          />

          <TextField
            fullWidth
            label="Responsibilities"
            name="responsibilities"
            value={formData.responsibilities}
            onChange={handleChange}
            multiline
            rows={3}
            margin="normal"
          />

          <TextField
            fullWidth
            label="Required Skills"
            name="skills_required"
            value={formData.skills_required}
            onChange={handleChange}
            margin="normal"
            helperText="Enter skills separated by commas, e.g. Python, React, SQL"
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