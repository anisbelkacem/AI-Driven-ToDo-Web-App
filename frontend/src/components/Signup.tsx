import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Paper,
  Avatar,
  Stack,
  InputAdornment,
  IconButton,
} from '@mui/material';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { signup } from '../services/auth';

const Signup: React.FC<{ onSignup: () => void }> = ({ onSignup }) => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      await signup(
        form.password,
        form.firstName,
        form.lastName,
        form.email,
        form.dateOfBirth
      );
      setSuccess('Signup successful! You can now log in.');
      onSignup();
    } catch (err: any) {
      setError(err.response?.data || 'Signup failed');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #e0e7ff 0%, #f3f4f6 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Paper elevation={6} sx={{ p: 4, borderRadius: 3, minWidth: 750, maxWidth: 900 }}>
        <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
          <Avatar sx={{ bgcolor: '#1976d2', mb: 1 }}>
            <PersonAddAltIcon />
          </Avatar>
          <Typography variant="h5" fontWeight={600} color="primary" mb={1}>
            Create Your Account
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Please fill in the information below to sign up.
          </Typography>
        </Box>
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={2}>
              <TextField
                label="First Name"
                name="firstName"
                fullWidth
                value={form.firstName}
                onChange={handleChange}
                autoComplete="given-name"
                required
              />
              <TextField
                label="Last Name"
                name="lastName"
                fullWidth
                value={form.lastName}
                onChange={handleChange}
                autoComplete="family-name"
                required
              />
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField
                label="Email"
                name="email"
                type="email"
                fullWidth
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
              <TextField
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                fullWidth
                value={form.dateOfBirth}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword((show) => !show)}
                        edge="end"
                        size="large"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Confirm Password"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                fullWidth
                value={form.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle confirm password visibility"
                        onClick={() => setShowConfirmPassword((show) => !show)}
                        edge="end"
                        size="large"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ fontWeight: 600, fontSize: '1rem' }}
            >
              Sign Up
            </Button>
            <Box textAlign="center" mt={2}>
              <Typography variant="body2">
                Do you have an account?{' '}
                <Typography
                  component={RouterLink}
                  to="/login"
                  color="primary"
                  fontWeight={600}
                  sx={{ textDecoration: 'none', cursor: 'pointer', display: 'inline' }}
                >
                  Login
                </Typography>
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
};

export default Signup;