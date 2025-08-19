import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jobAPI } from "../api/api";
import {
  Container,
  TextField,
  MenuItem,
  Button,
  Box,
  Paper,
  Typography,
  Alert,
} from "@mui/material";

const JOB_TYPES = ["full_time", "part_time", "contract", "internship", "temporary"];

export default function EditOffer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", description: "", location: "", type: "FULL_TIME" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    jobAPI.getJob(id)
      .then(res => {
        const o = res.data || {};
        setForm({
          title: o.title || "",
          description: o.description || "",
          location: o.location || "",
          job_type: o.job_type || "full_time",
          company: o.company || "",
          experience_level: o.experience_level || "mid",
          requirements: o.requirements || "",
          responsibilities: o.responsibilities || "",
          skills_required: o.skills_required || "",
        });
      })
      .catch(() => setError("Failed to load offer"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    jobAPI.updateJob(id, form)
      .then(() => navigate(`/offers/${id}`))
      .catch(err => {
        const msg = err.response?.status === 403 ? "You are not allowed to edit this offer" : "Failed to save offer";
        setError(msg);
      })
      .finally(() => setSaving(false));
  };

  if (loading) return null;

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>Edit Offer</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2}>
          <TextField label="Title" name="title" value={form.title} onChange={handleChange} required fullWidth />
          <TextField label="Company Name" name="company" value={form.company} onChange={handleChange} required fullWidth />
          <TextField label="Location" name="location" value={form.location} onChange={handleChange} required fullWidth />
          <TextField select label="Job Type" name="job_type" value={form.job_type} onChange={handleChange} required fullWidth>
            {JOB_TYPES.map((t) => (
              <MenuItem key={t} value={t}>{t.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Experience Level"
            name="experience_level"
            value={form.experience_level}
            onChange={handleChange}
            required
            fullWidth
          >
            <MenuItem value="entry">Entry Level</MenuItem>
            <MenuItem value="mid">Mid Level</MenuItem>
            <MenuItem value="senior">Senior Level</MenuItem>
            <MenuItem value="lead">Lead</MenuItem>
            <MenuItem value="manager">Manager</MenuItem>
          </TextField>
          <TextField label="Description" name="description" value={form.description} onChange={handleChange} required fullWidth multiline minRows={4} />
          <TextField label="Requirements" name="requirements" value={form.requirements} onChange={handleChange} fullWidth multiline minRows={3} />
          <TextField label="Responsibilities" name="responsibilities" value={form.responsibilities} onChange={handleChange} fullWidth multiline minRows={3} />
          <TextField 
            label="Required Skills"
            name="skills_required"
            value={form.skills_required}
            onChange={handleChange}
            fullWidth
            helperText="Enter skills separated by commas, e.g. Python, React, SQL"
          />
          <Box display="flex" gap={2}>
            <Button type="submit" variant="contained" disabled={saving}>Save</Button>
            <Button variant="outlined" onClick={() => navigate(-1)}>Cancel</Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}


