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
} from '@mui/material';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    authAPI.getCurrentUser()
      .then(res => setProfile(res.data))
      .catch(() => setError('Failed to load profile'));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files?.[0] || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      if (selectedFile) {
        const formData = new FormData();
        formData.append('first_name', profile.first_name || '');
        formData.append('last_name', profile.last_name || '');
        formData.append('email', profile.email || '');
        if (profile.phone_number) formData.append('phone_number', profile.phone_number);
        if (profile.bio) formData.append('bio', profile.bio);
        if (profile.company) formData.append('company', profile.company);
        if (profile.position) formData.append('position', profile.position);
        formData.append('profile_picture', selectedFile);
        await authAPI.updateProfile(formData);
      } else {
        const payload = {
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          email: profile.email || '',
          phone_number: profile.phone_number || '',
          bio: profile.bio || '',
          company: profile.company || '',
          position: profile.position || ''
        };
        await authAPI.updateProfile(payload);
      }
      setSuccess('Profile updated successfully');
      setSelectedFile(null);
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (!profile) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>My Profile</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2}>
          <TextField label="First Name" name="first_name" value={profile.first_name || ''} onChange={handleChange} required fullWidth />
          <TextField label="Last Name" name="last_name" value={profile.last_name || ''} onChange={handleChange} required fullWidth />
          <TextField label="Email" name="email" type="email" value={profile.email || ''} onChange={handleChange} required fullWidth />
          <TextField label="Phone Number" name="phone_number" value={profile.phone_number || ''} onChange={handleChange} fullWidth />
          <TextField label="Bio" name="bio" value={profile.bio || ''} onChange={handleChange} fullWidth multiline minRows={3} />
          {profile.user_type === 'recruiter' && (
            <>
              <TextField label="Company" name="company" value={profile.company || ''} onChange={handleChange} fullWidth />
              <TextField label="Position" name="position" value={profile.position || ''} onChange={handleChange} fullWidth />
            </>
          )}
          <input type="file" accept="image/*" onChange={handleFileChange} />
          <Button type="submit" variant="contained" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Profile;