import React, { useState, useEffect } from 'react';
import { jobAPI } from '../api/api';
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Grid
} from '@mui/material';

const RecruiterApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchApplications = async () => {
    try {
      const response = await jobAPI.getMyApplications();
      setApplications(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch applications.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      await jobAPI.updateApplication(applicationId, { status: newStatus });
      fetchApplications();
    } catch (err) {
      console.error('Failed to update status:', err);
      setError('Failed to update status. Please try again.');
    }
  };

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
        <Alert severity="info" sx={{ mt: 2 }}>No applications found for your job offers.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        All Job Applications
      </Typography>
      <Grid container spacing={3}>
        {applications.map((app) => (
          <Grid item xs={12} md={6} key={app.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">
                  Applicant: {app.applicant.first_name} {app.applicant.last_name}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  Job: {app.job.title}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Applied: {new Date(app.applied_at).toLocaleDateString()}
                </Typography>
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel id={`status-label-${app.id}`}>Application Status</InputLabel>
                  <Select
                    labelId={`status-label-${app.id}`}
                    value={app.status}
                    onChange={(e) => handleStatusChange(app.id, e.target.value)}
                    label="Application Status"
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="reviewing">Reviewing</MenuItem>
                    <MenuItem value="accepted">Accepted</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                  </Select>
                </FormControl>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default RecruiterApplications;