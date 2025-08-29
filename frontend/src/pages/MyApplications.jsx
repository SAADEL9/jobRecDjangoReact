import React, { useEffect, useMemo, useState } from "react";
import { jobAPI, authAPI } from "../api/api";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Paper,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Link,
  Avatar
} from "@mui/material";

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [feedback, setFeedback] = useState({ open: false, message: "", severity: "success" });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, applicationId: null, status: "" });
  const [userProfile, setUserProfile] = useState(null);
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  const statusColor = useMemo(() => ({
    applied: "info",
    reviewed: "warning",
    interview: "info",
    accepted: "success",
    rejected: "error"
  }), []);

  const handleViewProfile = (applicant) => {
    setSelectedApplicant(applicant);
  };

  const handleCloseProfileModal = () => {
    setSelectedApplicant(null);
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setFeedback({
        open: true,
        message: "Please login to view applications",
        severity: "warning"
      });
      setLoading(false);
      return;
    }

    Promise.all([
      authAPI.getCurrentUser(),
      jobAPI.getMyApplications()
    ])
      .then(([userRes, appRes]) => {
        console.log('User response:', userRes.data);
        console.log('Applications response:', appRes.data);
        console.log('Applications response structure:', {
          hasResults: 'results' in appRes.data,
          isArray: Array.isArray(appRes.data),
          keys: Object.keys(appRes.data || {}),
        });
        
        setUserProfile(userRes.data);
        // Handle paginated response
        const applicationData = appRes.data?.results || appRes.data || [];
        console.log('Processed applications:', applicationData);
        console.log('Applications array info:', {
          length: applicationData.length,
          isArray: Array.isArray(applicationData),
          firstItem: applicationData[0],
        });
        setApplications(applicationData);
      })
      .catch(error => {
        console.error("Error fetching data:", error);
        console.error("Error details:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.response?.headers,
        });
        
        setFeedback({
          open: true,
          message: error.response?.status === 403 
            ? "You don't have permission to access this page"
            : "Failed to load applications",
          severity: "error"
        });
        
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem("access_token");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const openConfirmDialog = (applicationId, newStatus) => {
    setConfirmDialog({
      open: true,
      applicationId,
      status: newStatus
    });
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    setConfirmDialog({ open: false, applicationId: null, status: "" });
    setActionLoadingId(applicationId);

    try {
      await jobAPI.updateApplication(applicationId, { status: newStatus });
      
      // Update local state
      setApplications(prev => prev.map(app => 
        app.id === applicationId ? { ...app, status: newStatus } : app
      ));

      setFeedback({
        open: true,
        message: "Application status updated successfully",
        severity: "success"
      });
    } catch (error) {
      console.error("Error updating status:", error);
      setFeedback({
        open: true,
        message: "Failed to update application status",
        severity: "error"
      });
    } finally {
      setActionLoadingId(null);
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {userProfile?.user_type === 'recruiter' ? 'Manage Applications' : 'My Applications'}
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {userProfile?.user_type === 'recruiter' && <TableCell>Applicant</TableCell>}
              <TableCell>Job Title</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Applied Date</TableCell>
              <TableCell>Status</TableCell>
              {userProfile?.user_type === 'recruiter' && <TableCell>CV</TableCell>}
              {userProfile?.user_type === 'recruiter' && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(applications) && applications.map((app) => (
              <TableRow key={app.id}>
                {userProfile?.user_type === 'recruiter' && (
                  <TableCell>
                    <Link component="button" variant="body2" onClick={() => handleViewProfile(app.applicant)}>
                      {app.applicant?.first_name} {app.applicant?.last_name}
                    </Link>
                  </TableCell>
                )}
                <TableCell>{app?.job?.title || 'N/A'}</TableCell>
                <TableCell>{app?.job?.company || 'N/A'}</TableCell>
                <TableCell>{app?.applied_at ? new Date(app.applied_at).toLocaleDateString() : 'N/A'}</TableCell>
                <TableCell>
                  <Chip 
                    label={app?.status ? app.status.charAt(0).toUpperCase() + app.status.slice(1) : 'N/A'}
                    color={app?.status ? statusColor[app.status] : 'default'}
                  />
                </TableCell>
                {userProfile?.user_type === 'recruiter' && (
                  <TableCell>
                    {app.applicant?.cv ? (
                      <Button 
                        variant="outlined" 
                        size="small"
                        href={app.applicant.cv} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        Download
                      </Button>
                    ) : (
                      'N/A'
                    )}
                  </TableCell>
                )}
                {userProfile?.user_type === 'recruiter' && (
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        disabled={app?.status === 'reviewed' || actionLoadingId === app.id}
                        onClick={() => openConfirmDialog(app.id, 'reviewed')}
                      >
                        Mark as Reviewed
                      </Button>
                      <Button
                        size="small"
                        color="success"
                        disabled={app?.status === 'accepted' || actionLoadingId === app.id}
                        onClick={() => openConfirmDialog(app.id, 'accepted')}
                      >
                        Accept
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        disabled={app?.status === 'rejected' || actionLoadingId === app.id}
                        onClick={() => openConfirmDialog(app.id, 'rejected')}
                      >
                        Reject
                      </Button>
                    </Stack>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {(!Array.isArray(applications) || applications.length === 0) && (
              <TableRow>
                <TableCell colSpan={userProfile?.user_type === 'recruiter' ? 6 : 4} align="center">
                  No applications found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Applicant Profile Modal */}
      <Dialog open={!!selectedApplicant} onClose={handleCloseProfileModal} maxWidth="sm" fullWidth>
        <DialogTitle>Applicant Profile</DialogTitle>
        <DialogContent>
          {selectedApplicant && (
            <Box>
              <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                <Avatar 
                  src={selectedApplicant.profile_picture} 
                  alt={`${selectedApplicant.first_name} ${selectedApplicant.last_name}`}
                  sx={{ width: 80, height: 80 }}
                />
                <Box>
                  <Typography variant="h5">{selectedApplicant.first_name} {selectedApplicant.last_name}</Typography>
                  <Typography color="textSecondary">{selectedApplicant.email}</Typography>
                  <Typography color="textSecondary">{selectedApplicant.phone_number || 'No phone number provided'}</Typography>
                </Box>
              </Stack>
              {selectedApplicant.cv && (
                <Button 
                  variant="contained" 
                  href={selectedApplicant.cv} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  sx={{ mt: 2 }}
                >
                  View CV
                </Button>
              )}
              <Typography variant="body1" sx={{ mt: 2 }}>
                {selectedApplicant.bio || 'No bio provided.'}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseProfileModal}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={feedback.open}
        autoHideDuration={6000}
        onClose={() => setFeedback(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={feedback.severity} onClose={() => setFeedback(prev => ({ ...prev, open: false }))}>
          {feedback.message}
        </Alert>
      </Snackbar>

      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, applicationId: null, status: "" })}
      >
        <DialogTitle>Confirm Status Change</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to mark this application as {confirmDialog.status}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, applicationId: null, status: "" })}>
            Cancel
          </Button>
          <Button 
            onClick={() => handleStatusChange(confirmDialog.applicationId, confirmDialog.status)}
            autoFocus
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}