import React, { useState, useEffect, useRef } from "react";
import { jobAPI } from "../api/api";
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
  CardActionArea,
  Button,
  Pagination,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import WorkIcon from "@mui/icons-material/Work";
import SearchBar from "../components/Search";
import { useTheme } from "@mui/material/styles";

export default function Offers() {
  const [jobs, setJobs] = useState([]); // all jobs from API
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]); // jobs after local filtering
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showingRecommendations, setShowingRecommendations] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();
  const theme = useTheme();

  const requestIdRef = useRef(0);

  const fetchJobs = async (currentPage) => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError("");

    try {
      const params = { page: currentPage };
      const res = await jobAPI.getJobs(params);

      if (requestId !== requestIdRef.current) return;

      const { results, count } = res.data;
      const fetchedJobs = Array.isArray(results) ? results : [];
      setJobs(fetchedJobs);
      
      // Apply current search filter to new jobs
      applySearchFilter(fetchedJobs, searchQuery);
      setTotalPages(Math.ceil((count || 0) / 10));
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      const message = err.response?.status
        ? `Failed to fetch offers: ${err.response.status}`
        : `Failed to fetch offers`;
      setError(message);
      setJobs([]);
      setFilteredJobs([]);
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  };

  // Separate function to apply search filter
  const applySearchFilter = (sourceJobs, searchTerm) => {
    if (searchTerm) {
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      const filtered = sourceJobs.filter(
        (offer) =>
          offer.title?.toLowerCase().includes(lowercasedSearchTerm) ||
          offer.description?.toLowerCase().includes(lowercasedSearchTerm) ||
          offer.company?.toLowerCase().includes(lowercasedSearchTerm) ||
          offer.location?.toLowerCase().includes(lowercasedSearchTerm) ||
          offer.job_type?.toLowerCase().includes(lowercasedSearchTerm)
      );
      setFilteredJobs(filtered);
    } else {
      setFilteredJobs(sourceJobs);
    }
  };

  // Only fetch jobs when page changes or when switching between all jobs/recommendations
  useEffect(() => {
    if (!showingRecommendations) {
      fetchJobs(page);
    }
  }, [page, showingRecommendations]);

  const handleShowRecommendations = async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setShowingRecommendations(true);
    setError("");
    setPage(1); // Reset pagination

    try {
      const res = await jobAPI.getRecommendedJobs();
      if (requestId !== requestIdRef.current) return;
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      setRecommendedJobs(data);
      setJobs(data);
      
      // Apply current search filter to recommendations
      applySearchFilter(data, searchQuery);
      setTotalPages(1);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      const message = err.response?.status
        ? `Failed to fetch recommendations: ${err.response.status}`
        : `Failed to fetch recommendations`;
      setError(message);
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  };

  const handleShowAllJobs = () => {
    setShowingRecommendations(false);
    setPage(1); // Reset pagination
  };

  // Fixed search logic - only does local filtering, no API calls
  const handleSearch = (searchTerm) => {
    setSearchQuery(searchTerm);
    const sourceJobs = showingRecommendations ? recommendedJobs : jobs;
    applySearchFilter(sourceJobs, searchTerm);
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
      <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3, backgroundColor: "#f9f9f9", borderRadius: 2 }}>
      <SearchBar onSearch={handleSearch} />

      <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
        {!showingRecommendations ? (
          <Button variant="contained" onClick={handleShowRecommendations}>
            Show Recommendations
          </Button>
        ) : (
          <Button variant="contained" onClick={handleShowAllJobs}>
            Show All Jobs
          </Button>
        )}
      </Box>

      <Grid container spacing={3} alignItems="stretch" sx={{ mt: 2 }}>
        {filteredJobs.map((offer) => (
          <Grid item xs={12} sm={6} md={6} key={offer.id} sx={{ display: "flex" }}>
            <Card
              elevation={0}
              sx={{
                flexGrow: 1,
                display: "flex",
                flexDirection: "column",
                cursor: "pointer",
                transition: "transform 0.3s, box-shadow 0.3s",
                border: "1px solid transparent",
                backgroundImage: `linear-gradient(white, white), linear-gradient(to right, ${theme.palette.primary.light}, ${theme.palette.secondary.light})`,
                backgroundOrigin: "border-box",
                backgroundClip: "content-box, border-box",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: `0 8px 24px rgba(0, 0, 0, 0.1)`,
                },
              }}
            >
              <CardActionArea
                onClick={() => navigate(`/offers/${offer.id}`)}
                sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
              >
                <CardContent
                  sx={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    width: "500px",
                  }}
                >
                  <Box>
                    <Typography variant="h6" component="h3" fontWeight="600" noWrap>
                      {offer.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {offer.company}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    {offer.job_type && (
                      <Chip
                        icon={<WorkIcon fontSize="small" />}
                        label={offer.job_type.replace("_", " ")}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    )}
                    {offer.experience_level && (
                      <Chip
                        label={offer.experience_level.replace("_", " ")}
                        size="small"
                        color="secondary"
                        variant="outlined"
                      />
                    )}
                  </Box>

                  <Box sx={{ flexGrow: 1 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ display: "flex", alignItems: "center", mb: 0.5 }}
                    >
                      <LocationOnIcon sx={{ mr: 1, fontSize: 18 }} />
                      {offer.location || "Remote"}
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mt: "auto" }}>
                    {offer.description?.slice(0, 100)}
                    {offer.description?.length > 100 ? "..." : ""}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}

        {filteredJobs.length === 0 && !error && (
          <Grid item xs={12}>
            <Alert severity="info">No job offers available matching your search.</Alert>
          </Grid>
        )}
      </Grid>

      {!showingRecommendations && totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
}