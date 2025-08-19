import React, { useEffect, useMemo, useState } from "react";
import api from "../axiosConfig";
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
  const [currentId, setCurrentId] = useState("");
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [feedback, setFeedback] = useState({ open: false, message: "", severity: "success" });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, applicationId: null, status: "" });

  const statusColor = useMemo(() => ({
    pending: "default",
    accepted: "success",
    rejected: "error"
  }), []);

  // Debug function to decode JWT token
  const decodeJWT = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log("JWT Payload:", payload);
      return payload;
    } catch (error) {
      console.error("Invalid JWT token:", error);
      return null;
    }
  };

  // Fetch user data and determine role
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setFeedback({
        open: true,
        message: "Please login to view applications",
        severity: "warning"
      });
      setLoading(false);
      return;
    }

    // Debug: Check token content
    const tokenPayload = decodeJWT(token);
    console.log("Token authorities/roles:", tokenPayload?.authorities || tokenPayload?.roles);

    api
      .get("/api/user/me", {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      .then((res) => {
        if (!res.data) {
          throw new Error("No user data received");
        }
        
        console.log("User data:", res.data);
        setCurrentId(res.data.id);
        
        const roles = Array.isArray(res.data.roles) ? res.data.roles : [];
        
        const hasRole = (roleName) => roles.some((r) => 
          (typeof r === 'string' && r === roleName) || 
          (r?.name === roleName)
        );
        
        if (hasRole('ROLE_CANDIDAT')) {
          setRole("by-candidat");
        } else if (hasRole('ROLE_RECRUITER')) {
          setRole("by-recruiter");
        } else {
          throw new Error("User has no valid role");
        }
      })
      .catch((err) => {
        console.error("Failed to fetch user roles:", err);
        setFeedback({
          open: true,
          message: err.response?.status === 403 
            ? "You don't have permission to access this page. Please login with the correct account."
            : "Failed to load user data: " + (err.response?.data?.message || err.message),
          severity: "error"
        });
        
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("token");
        }
        setLoading(false);
      });
  }, []);

  // Fetch applications based on role
  useEffect(() => {
    if (!role || !currentId) {
      return;
    }
    
   const token = localStorage.getItem("token");
console.log("Token content:", JSON.parse(atob(token.split('.')[1])));
    if (!token) {
      setFeedback({ 
        open: true, 
        message: "Please login to view applications", 
        severity: "warning" 
      });
      setLoading(false);
      return;
    }

    setLoading(true);
    let endpoint = '';
    
    if (role === 'by-candidat') {
      endpoint = `/api/applications/by-candidat/${currentId}`;
    } else if (role === 'by-recruiter') {
      endpoint = `/api/applications/by-recruiter/${currentId}`;
    } else {
      console.error("Invalid role:", role);
      setFeedback({
        open: true,
        message: "Invalid user role detected",
        severity: "error"
      });
      setLoading(false);
      return;
    }

    console.log("Fetching applications from:", endpoint);
    
    api
      .get(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      .then((res) => {
        console.log("Applications response:", res.data);
        setApplications(res.data || []);
      })
      .catch((err) => {
        console.error("Failed to fetch applications:", err);
        
        const errorMessage = err.response?.data?.message || err.message || "Failed to load applications";
        
        if (err.response?.status === 403) {
          setFeedback({ 
            open: true, 
            message: "You don't have permission to view these applications. Please check your role.", 
            severity: "error" 
          });
        } else if (err.response?.status === 401) {
          setFeedback({
            open: true,
            message: "Your session has expired. Please login again.",
            severity: "error"
          });
          localStorage.removeItem("token");
        } else {
          setFeedback({ 
            open: true, 
            message: `Error: ${errorMessage}`, 
            severity: "error" 
          });
        }
      })
      .finally(() => setLoading(false));
  }, [role, currentId]);
useEffect(() => {
  const verifyAuth = async () => {
    try {
      const response = await api.get('/api/applications/debug/auth');
      console.log('Auth debug:', response.data);
    } catch (error) {
      console.error('Auth debug error:', error);
    }
  };
  verifyAuth();
}, []);
  const openConfirmDialog = (applicationId, newStatus) => {
    setConfirmDialog({
      open: true,
      applicationId,
      status: newStatus
    });
  };

  const handleUpdateStatus = async () => {
    const { applicationId, status: newStatus } = confirmDialog;
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setFeedback({ 
          open: true, 
          message: "Please login to perform this action", 
          severity: "error" 
        });
        return;
      }

      setActionLoadingId(applicationId);
      
      await api.put(`/api/applications/${applicationId}/status`, null, {
        params: { newStatus },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Update local state
      setApplications((prev) =>
        (prev || []).map((a) => 
          a.id === applicationId ? { ...a, status: newStatus } : a
        )
      );

      setFeedback({ 
        open: true, 
        message: `Application ${newStatus} successfully`, 
        severity: "success" 
      });

    } catch (err) {
      console.error("Failed to update status:", err);
      const errorMessage = err.response?.data?.message || "Failed to update status";
      setFeedback({ 
        open: true, 
        message: errorMessage, 
        severity: "error" 
      });
    } finally {
      setActionLoadingId(null);
      setConfirmDialog({ open: false, applicationId: null, status: "" });
    }
  };

  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleDateString() : "";
  };

  const getPageTitle = () => {
    if (role === "by-recruiter") return "Applications to Your Job Offers";
    if (role === "by-candidat") return "My Applications";
    return "Applications";
  };

  const getTableHeaders = () => {
    const baseHeaders = [
      "#",
      "Job Title",
      "Location", 
      "Type",
      "Applied On",
      "Status"
    ];

    if (role === "by-recruiter") {
      return [
        ...baseHeaders,
        "Candidate Name",
        "Actions"
      ];
    }

    return baseHeaders;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h4" gutterBottom>
        {getPageTitle()}
      </Typography>

      <Paper elevation={2}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {getTableHeaders().map((header) => (
                  <TableCell key={header} align={header === "Actions" ? "center" : "left"}>
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {(applications || []).map((application, index) => {
                const status = (application.status || "").toLowerCase();
                return (
                  <TableRow key={application.id ?? index} hover>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{application.jobOffer?.title || "N/A"}</TableCell>
                    <TableCell>{application.jobOffer?.location || "N/A"}</TableCell>
                    <TableCell>{application.jobOffer?.type || "N/A"}</TableCell>
                    <TableCell>{formatDate(application.applicationDate)}</TableCell>
                    <TableCell>
                      <Chip
                        label={application.status || "Unknown"}
                        color={statusColor[status] || "default"}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    
                    {role === "by-recruiter" && (
                      <>
                        <TableCell>
                          {application.candidat?.firstName} {application.candidat?.lastName}
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              disabled={
                                actionLoadingId === application.id || 
                                status === "accepted"
                              }
                              onClick={() => openConfirmDialog(application.id, "accepted")}
                            >
                              {actionLoadingId === application.id ? "..." : "Accept"}
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              disabled={
                                actionLoadingId === application.id || 
                                status === "rejected"
                              }
                              onClick={() => openConfirmDialog(application.id, "rejected")}
                            >
                              Reject
                            </Button>
                          </Stack>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                );
              })}

              {!applications?.length && (
                <TableRow>
                  <TableCell colSpan={getTableHeaders().length} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                      No applications found.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, applicationId: null, status: "" })}
      >
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to {confirmDialog.status} this application?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmDialog({ open: false, applicationId: null, status: "" })}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateStatus}
            color={confirmDialog.status === "accepted" ? "success" : "error"}
            variant="contained"
            autoFocus
          >
            {confirmDialog.status === "accepted" ? "Accept" : "Reject"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Feedback Snackbar */}
      <Snackbar
        open={feedback.open}
        autoHideDuration={4000}
        onClose={() => setFeedback({ ...feedback, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setFeedback({ ...feedback, open: false })}
          severity={feedback.severity}
          sx={{ width: "100%" }}
        >
          {feedback.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}