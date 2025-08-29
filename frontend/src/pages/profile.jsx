import React, { useState, useEffect } from "react";
import { authAPI } from "../api/api";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Avatar,
} from '@mui/material';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedCv, setSelectedCv] = useState(null);

  const fetchProfile = () => {
    setLoading(true);
    authAPI.getCurrentUser()
      .then(res => {
        console.log('Profile data:', res.data);
        setProfile(res.data);
      })
      .catch(err => {
        console.error('Profile error:', err);
        setError('Failed to load profile: ' + (err.response?.data?.message || err.message));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Please login to view your profile');
      setLoading(false);
      return;
    }
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('File size should be less than 5MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleCvChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('CV file size should be less than 5MB');
        return;
      }
      setSelectedCv(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setError("");
    setSuccess("");
    
    try {
      const formData = new FormData();
      formData.append('first_name', profile.first_name || '');
      formData.append('last_name', profile.last_name || '');
      formData.append('email', profile.email || '');
      if (profile.phone_number) formData.append('phone_number', profile.phone_number);
      if (profile.bio) formData.append('bio', profile.bio);
      if (profile.company) formData.append('company', profile.company);
      if (profile.position) formData.append('position', profile.position);
      
      if (selectedFile) {
        formData.append('profile_picture', selectedFile);
      }
      if (selectedCv) {
        formData.append('cv', selectedCv);
      }
      
      await authAPI.updateProfile(formData);
      setSuccess('Profile updated successfully');
      setSelectedFile(null);
      setSelectedCv(null);
      fetchProfile();
    } catch (err) {
      console.error('Profile update error:', err);
      setError('Failed to update profile: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!profile && !loading) {
    return (
      <Container maxWidth="md">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Typography color="error">
            {error || 'Failed to load profile. Please try logging in again.'}
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          My Profile
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 2 }}>
            <Avatar
              src={profile?.avatar || ''}
              alt={profile?.first_name || 'Profile'}
              sx={{ width: 100, height: 100, mb: 2 }}
            />
            <Button
              variant="contained"
              component="label"
              sx={{ mb: 2 }}
            >
              Upload Profile Picture
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleFileChange}
              />
            </Button>
          </Box>

          <TextField
            fullWidth
            label="First Name"
            name="first_name"
            value={profile?.first_name || ''}
            onChange={handleChange}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Last Name"
            name="last_name"
            value={profile?.last_name || ''}
            onChange={handleChange}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Email"
            name="email"
            value={profile?.email || ''}
            onChange={handleChange}
            margin="normal"
            required
            type="email"
          />

          <TextField
            fullWidth
            label="Phone Number"
            name="phone_number"
            value={profile?.phone_number || ''}
            onChange={handleChange}
            margin="normal"
          />

          <TextField
            fullWidth
            label="Bio"
            name="bio"
            value={profile?.bio || ''}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={4}
          />

          {profile?.user_type === 'candidate' && (
            <Box sx={{ mt: 2, mb: 2 }}>
              <Button
                variant="contained"
                component="label"
              >
                Upload CV
                <input
                  type="file"
                  hidden
                  accept=".pdf,.doc,.docx"
                  onChange={handleCvChange}
                />
              </Button>
              {profile.cv && !selectedCv && (
                <Typography variant="body2" sx={{ display: 'inline', ml: 2 }}>
                  <a href={profile.cv} target="_blank" rel="noopener noreferrer">View Current CV</a>
                </Typography>
              )}
              {selectedCv && (
                <Typography variant="body2" sx={{ display: 'inline', ml: 2 }}>
                  {selectedCv.name}
                </Typography>
              )}
            </Box>
          )}

          {profile?.user_type === 'recruiter' && (
            <TextField
              fullWidth
              label="Company"
              name="company"
              value={profile?.company || ''}
              onChange={handleChange}
              margin="normal"
            />
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={saving}
            sx={{ mt: 3 }}
          >
            {saving ? <CircularProgress size={24} /> : 'Save Changes'}
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default Profile;