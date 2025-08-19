import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container, Typography, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

const AuthContainer = styled(Container)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(2),
  background: theme.palette.background.default,
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
  maxWidth: 500,
  boxShadow: theme.shadows[3],
  borderRadius: theme.shape.borderRadius,
}));

const Logo = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  fontWeight: 700,
  letterSpacing: '.3rem',
  color: theme.palette.primary.main,
  textDecoration: 'none',
  textAlign: 'center',
  fontSize: '2rem',
}));

const AuthLayout = () => {
  return (
    <AuthContainer component="main" maxWidth={false}>
      <StyledPaper elevation={3}>
        <Logo component="h1" variant="h4">
          JobBoard
        </Logo>
        <Outlet />
      </StyledPaper>
      
      <Box mt={3} textAlign="center">
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} JobBoard. All rights reserved.
        </Typography>
      </Box>
    </AuthContainer>
  );
};

export default AuthLayout;
