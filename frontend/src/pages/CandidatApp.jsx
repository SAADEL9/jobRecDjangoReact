import React, { useState, useEffect } from 'react';
import { jobAPI } from '../api/api';
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  Chip,
  Stack
} from '@mui/material';

const CandidatApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const statusColor = {
    applied: "info",
    reviewed: "warning",
    interview: "info",
    accepted: "success",
    rejected: "error"
  };

  useEffect(() => {
    jobAPI.getMyApplications()
      .then(response => {
        setApplications(response.data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch applications.');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
      </Container>
    );
  }

  if (applications.length === 0) {
    return (
      <Container maxWidth="lg">
        <Alert severity="info" sx={{ mt: 2 }}>You have not applied to any job offers yet.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Job Applications
      </Typography>
      <Grid container spacing={3}>
        {applications.map((app) => (
          <Grid item xs={12} md={6} key={app.id}>
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="h6">
                    {app.job.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {app.job.company}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Applied: {new Date(app.applied_at).toLocaleDateString()}
                  </Typography>
                  <Box>
                    <Chip
                      label={app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      color={statusColor[app.status]}
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default CandidatApplications;