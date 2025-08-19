import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../axiosConfig";
import {
  Container,
  Box,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Paper
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import BusinessIcon from "@mui/icons-material/Business";
import WorkIcon from "@mui/icons-material/Work";

export default function OfferDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [offer, setOffer] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentUsername, setCurrentUsername] = useState("");
  const [currentId, setCurrentid] = useState("");
  const userId = localStorage.getItem("userId");
  useEffect(() => {
    if (!id) return;
    api
      .get(`/api/offers/${id}`)
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
    const token = localStorage.getItem("token");
    if (!token) return;
    api.get('/api/user/me')
      .then(res =>{ setCurrentUsername(res.data?.username || "") ;setCurrentid(res.data?.id)})
      .catch(() => setCurrentUsername(""));
  }, []);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this offer?')) return;
    try {
      await api.delete(`/api/recruiter/offers/${id}`);
      navigate('/'); // Redirect to home or offers list
    } catch (err) {
      setError('Failed to delete offer');
    }
  };
const handleApply = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    navigate('/login');
    return;
  }
  if (!currentId) {
    setError('Missing user id. Please log in again.');
    return;
  }
  try {
    await api.post(`/api/applications/apply`, null, {
      params: { offerId: id, candidatId: currentId }
    });
    alert("Application submitted successfully!");
  } catch (err) {
    const status = err.response?.status;
    if (status === 401) setError('Please log in to apply.');
    else if (status === 403) setError('You must be logged in as a candidate to apply.');
    else setError('Failed to apply for the offer');
  }
}
  
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

  const isOwner = !!currentUsername && offer?.recruiter?.username === currentUsername;

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Box display="flex" flexDirection="column" gap={2}>
          <Typography variant="h4" component="h1">
            {offer.title}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {offer.type && (
              <Chip icon={<WorkIcon />} label={offer.type} color="primary" variant="outlined" />
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
            {offer.recruiter?.username && (
              <Typography variant="body2" color="text.secondary">
                Posted by: {offer.recruiter.username}
              </Typography>
            )}
          </Box>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
            {offer.description}
          </Typography>
          <Box display="flex" gap={2}>
            <Button variant="outlined" onClick={() => navigate(-1)}>Back</Button>
            {isOwner && (<div>
              <Button component={Link} to={`/offers/${id}/edit`} variant="contained">Edit</Button>
              <Button onClick={handleDelete} color="error" variant="contained" sx={{ ml: 1 }}>Delete</Button>
              
              </div>
            )}
            <Button onClick={handleApply} variant="contained">Apply</Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
