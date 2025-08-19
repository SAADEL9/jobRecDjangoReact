import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../axiosConfig";
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

const JOB_TYPES = ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"];

export default function EditOffer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", description: "", location: "", type: "FULL_TIME" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/api/offers/${id}`)
      .then(res => {
        const o = res.data || {};
        setForm({
          title: o.title || "",
          description: o.description || "",
          location: o.location || "",
          type: o.type || "FULL_TIME",
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
    api.put(`/api/recruiter/offers/${id}`, form)
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
          <TextField label="Description" name="description" value={form.description} onChange={handleChange} required fullWidth multiline minRows={4} />
          <TextField label="Location" name="location" value={form.location} onChange={handleChange} required fullWidth />
          <TextField select label="Type" name="type" value={form.type} onChange={handleChange} required>
            {JOB_TYPES.map((t) => (
              <MenuItem key={t} value={t}>{t.replace("_", " ")}</MenuItem>
            ))}
          </TextField>
          <Box display="flex" gap={2}>
            <Button type="submit" variant="contained" disabled={saving}>Save</Button>
            <Button variant="outlined" onClick={() => navigate(-1)}>Cancel</Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}


