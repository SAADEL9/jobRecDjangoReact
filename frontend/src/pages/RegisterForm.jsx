import React, { useState } from "react";
import { authAPI } from '../api/api';
import { Link, useNavigate } from "react-router-dom";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    password2: "",
    user_type: "candidate",
    first_name: "",
    last_name: "",
  });

  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setServerError("");
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.password.trim()) newErrors.password = "Password is required";
    if (!formData.password2.trim()) newErrors.password2 = "Please confirm your password";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (formData.password !== formData.password2)
      newErrors.password2 = "Passwords do not match";
    if (!formData.first_name.trim()) newErrors.first_name = "First name is required";
    if (!formData.last_name.trim()) newErrors.last_name = "Last name is required";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      setServerError("");
      
      const payload = {
        email: formData.email,
        password: formData.password,
        password2: formData.password2,
        user_type: formData.user_type,
        first_name: formData.first_name,
        last_name: formData.last_name,
      };

      const response = await authAPI.register(payload);
      
      if (response.status === 201 || response.status === 200) {
        navigate("/login");
      } else {
        throw new Error(response.data?.message || "Registration failed");
      }
    } catch (err) {
      if (err.response?.data) {
        // Handle Django validation errors
        const djangoErrors = err.response.data;
        const newErrors = {};
        
        Object.keys(djangoErrors).forEach(key => {
          if (Array.isArray(djangoErrors[key])) {
            newErrors[key] = djangoErrors[key][0];
          } else {
            newErrors[key] = djangoErrors[key];
          }
        });
        
        setErrors(newErrors);
      } else {
        setServerError(err.message || "Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        component={Paper}
        elevation={3}
        sx={{
          marginTop: 8,
          padding: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5" gutterBottom>
          Register
        </Typography>

        {serverError && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {serverError}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email"
            name="email"
            autoComplete="email"
            autoFocus
            value={formData.email}
            onChange={handleChange}
            variant="outlined"
            error={!!errors.email}
            helperText={errors.email}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
            variant="outlined"
            error={!!errors.password}
            helperText={errors.password}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            name="password2"
            label="Confirm Password"
            type="password"
            id="password2"
            autoComplete="new-password"
            value={formData.password2}
            onChange={handleChange}
            variant="outlined"
            error={!!errors.password2}
            helperText={errors.password2}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel id="user-type-label">User Type</InputLabel>
            <Select
              labelId="user-type-label"
              id="user_type"
              name="user_type"
              value={formData.user_type}
              label="User Type"
              onChange={handleChange}
            >
              <MenuItem value="candidate">Candidate</MenuItem>
              <MenuItem value="recruiter">Recruiter</MenuItem>
            </Select>
          </FormControl>

          <TextField
            margin="normal"
            required
            fullWidth
            name="first_name"
            label="First Name"
            id="first_name"
            autoComplete="given-name"
            value={formData.first_name}
            onChange={handleChange}
            variant="outlined"
            error={!!errors.first_name}
            helperText={errors.first_name}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            name="last_name"
            label="Last Name"
            id="last_name"
            autoComplete="family-name"
            value={formData.last_name}
            onChange={handleChange}
            variant="outlined"
            error={!!errors.last_name}
            helperText={errors.last_name}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ mt: 3, mb: 2 }}
          >
            {loading ? 'Registering...' : 'Register'}
          </Button>

          <Button
            component={Link}
            to="/login"
            fullWidth
            variant="text"
            sx={{ mt: 1 }}
          >
            Already have an account? Login
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default RegisterForm;
