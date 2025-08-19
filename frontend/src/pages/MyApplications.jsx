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
  DialogContentText
} from "@mui/material";

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [feedback, setFeedback] = useState({ open: false, message: "", severity: "success" });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, applicationId: null, status: "" });
  const [userProfile, setUserProfile] = useState(null);

  const statusColor = useMemo(() => ({
    applied: "info",
    reviewed: "warning",
    interview: "info",
    accepted: "success",
    rejected: "error"
  }), []);

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
        setUserProfile(userRes.data);
        setApplications(appRes.data);
      })
      .catch(error => {
        console.error("Error fetching data:", error);
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
              <TableCell>Job Title</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Applied Date</TableCell>
              <TableCell>Status</TableCell>
              {userProfile?.user_type === 'recruiter' && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {applications.map((app) => (
              <TableRow key={app.id}>
                <TableCell>{app.job.title}</TableCell>
                <TableCell>{app.job.company}</TableCell>
                <TableCell>{new Date(app.applied_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Chip 
                    label={app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    color={statusColor[app.status]}
                  />
                </TableCell>
                {userProfile?.user_type === 'recruiter' && (
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        disabled={app.status === 'reviewed' || actionLoadingId === app.id}
                        onClick={() => openConfirmDialog(app.id, 'reviewed')}
                      >
                        Mark as Reviewed
                      </Button>
                      <Button
                        size="small"
                        color="success"
                        disabled={app.status === 'accepted' || actionLoadingId === app.id}
                        onClick={() => openConfirmDialog(app.id, 'accepted')}
                      >
                        Accept
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        disabled={app.status === 'rejected' || actionLoadingId === app.id}
                        onClick={() => openConfirmDialog(app.id, 'rejected')}
                      >
                        Reject
                      </Button>
                    </Stack>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {applications.length === 0 && (
              <TableRow>
                <TableCell colSpan={userProfile?.user_type === 'recruiter' ? 5 : 4} align="center">
                  No applications found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

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