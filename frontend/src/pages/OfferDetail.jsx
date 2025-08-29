import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { jobAPI, authAPI } from "../api/api";
import {
  Container,
  Box,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Paper,
  Stack
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import BusinessIcon from "@mui/icons-material/Business";
import WorkIcon from "@mui/icons-material/Work";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';

export default function OfferDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [offer, setOffer] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const userId = localStorage.getItem("userId");
  useEffect(() => {
    if (!id) return;
    jobAPI.getJob(id)
      .then((res) => setOffer(res.data))
      .catch((err) => {
        const message = err.response?.status === 404
          ? "Offer not found"
          : "Failed to load offer";
        setError(message);
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    authAPI.getCurrentUser()
      .then(res => {
        setCurrentUser(res.data);
      })
      .catch(() => {
        setCurrentUser(null);
      });
  }, []);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this offer?')) return;
    try {
      await jobAPI.deleteJob(id);
      navigate('/'); // Redirect to home or offers list
    } catch (err) {
      setError('Failed to delete offer');
    }
  };

  const handleApply = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate('/login');
      return;
    }
    if (!currentUser) {
      setError('Missing user id. Please log in again.');
      return;
    }
    try {
      await jobAPI.applyToJob(id);
      alert("Application submitted successfully!");
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) setError('Please log in to apply.');
      else if (status === 403) setError('You must be logged in as a candidate to apply.');
      else setError('Failed to apply for the offer');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button variant="outlined" onClick={() => navigate(-1)}>Back</Button>
      </Container>
    );
  }

  if (!offer) return null;

  const isOwner = !!currentUser && offer?.posted_by?.id === currentUser.id;
  const isRecruiter = currentUser?.is_recruiter;

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Box display="flex" flexDirection="column" gap={2}>
          <Typography variant="h4" component="h1">
            {offer.title}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {offer.job_type && (
              <Chip icon={<WorkIcon />} label={offer.job_type.replace('_', ' ')} color="primary" variant="outlined" />
            )}
          </Box>
          <Box>
            <Typography variant="body1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <LocationOnIcon sx={{ mr: 1 }} />
              {offer.location}
            </Typography>
            {offer.company && (
              <Typography variant="body1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                <BusinessIcon sx={{ mr: 1 }} />
                {offer.company}
              </Typography>
            )}
            {offer.posted_by?.email && (
              <Typography variant="body2" color="text.secondary">
                Posted by: {offer.posted_by.email}
              </Typography>
            )}
          </Box>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
            decription : {offer.description}
          </Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
            requirements : {offer.requirements}
          </Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
            responsabilities : {offer.responsibilities}
          </Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
            required skills : {offer.skills_required}
          </Typography>
          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>Back</Button>
            {isOwner && (
              <>
                <Button component={Link} to={`/offers/${id}/edit`} variant="contained" startIcon={<EditIcon />}>Edit</Button>
                <Button onClick={handleDelete} color="error" variant="contained" startIcon={<DeleteIcon />} sx={{ ml: 1 }}>Delete</Button>
              </>
            )}
            {!isOwner && !isRecruiter && (
              <Button 
                onClick={handleApply} 
                variant="contained" 
                disabled={offer.has_applied || offer.is_expired}
                startIcon={<SendIcon />}
              >
                {offer.has_applied ? 'Already applied' : offer.is_expired ? 'Expired' : 'Apply'}
              </Button>
            )}
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
}
