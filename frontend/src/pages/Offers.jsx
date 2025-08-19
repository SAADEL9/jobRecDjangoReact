import React, { useState, useEffect } from "react";
import api from "../axiosConfig";
import { useNavigate } from "react-router-dom";
import { 
  Grid,
  Card,
  CardContent,
  Typography,
  Alert,
  Chip,
  Box,
  CircularProgress,
  CardActionArea
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import WorkIcon from '@mui/icons-material/Work';
import SearchBar from '../components/Search'; // Import the SearchBar component

export default function Offers() {
  const [offers, setOffers] = useState([]);
  const [filteredOffers, setFilteredOffers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/api/offers")
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        setOffers(data);
        setFilteredOffers(data);
      })
      .catch((err) => {
        const message = err.response?.status
          ? `Failed to fetch offers: ${err.response.status}`
          : `Failed to fetch offers`;
        setError(message);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (searchTerm) => {
    if (searchTerm) {
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      const newFilteredOffers = offers.filter(
        (offer) =>
          offer.title?.toLowerCase().includes(lowercasedSearchTerm) ||
          offer.description?.toLowerCase().includes(lowercasedSearchTerm) ||
          offer.company?.toLowerCase().includes(lowercasedSearchTerm) ||
          offer.location?.toLowerCase().includes(lowercasedSearchTerm) ||
          offer.type?.toLowerCase().includes(lowercasedSearchTerm)
      );
      setFilteredOffers(newFilteredOffers);
    } else {
      setFilteredOffers(offers);
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
    return <Alert severity="error" sx={{ mt: 2, mb: 2 }}>{error}</Alert>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <SearchBar onSearch={handleSearch} />
      <Grid container spacing={3} alignItems="stretch" sx={{ mt: 2 }}>
        {filteredOffers.map((offer) => (
          <Grid item xs={12} sm={6} md={6} key={offer.id} sx={{ display: 'flex' }}>
            <Card 
              elevation={2}
              sx={{ 
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: '0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
            >
              <CardActionArea onClick={() => navigate(`/offers/${offer.id}`)} sx={{ height: '100%' }}>
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="h6" gutterBottom component="h3" noWrap>
                    {offer.title}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                    {offer.type && (
                      <Chip
                        icon={<WorkIcon />}
                        label={offer.type}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    )}
                  </Box>

                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <LocationOnIcon sx={{ mr: 1, fontSize: 18 }} />
                      {offer.location}
                    </Typography>
                    {offer.company && (
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                        <BusinessIcon sx={{ mr: 1, fontSize: 18 }} />
                        {offer.company}
                      </Typography>
                    )}
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {offer.description?.slice(0, 150)}
                    {offer.description?.length > 150 ? '...' : ''}
                  </Typography>

                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
        {filteredOffers.length === 0 && !error && (
          <Grid item xs={12}>
            <Alert severity="info">No job offers available matching your search.</Alert>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
