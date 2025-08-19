import React from 'react';
import { Outlet } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Container, 
  Box, 
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '../contexts/AuthContext';
import NavMenu from '../components/NavMenu';

const MainLayout = () => {
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            
            <Typography
              variant="h6"
              component="a"
              href="/"
              sx={{
                mr: 2,
                display: 'flex',
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.3rem',
                color: 'inherit',
                textDecoration: 'none',
                flexGrow: isMobile ? 1 : 0
              }}
            >
              JobBoard
            </Typography>

            {!isMobile && (
              <Box sx={{ flexGrow: 1, display: 'flex', ml: 3 }}>
                <NavMenu />
              </Box>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {user ? (
                <>
                  <Typography variant="body2" sx={{ mr: 2 }}>
                    Welcome, {user.first_name || user.email}
                  </Typography>
                  <Button 
                    color="inherit" 
                    onClick={logout}
                    sx={{ whiteSpace: 'nowrap' }}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    color="inherit" 
                    href="/login"
                    sx={{ whiteSpace: 'nowrap' }}
                  >
                    Login
                  </Button>
                  <Button 
                    color="inherit" 
                    href="/register"
                    sx={{ whiteSpace: 'nowrap' }}
                  >
                    Register
                  </Button>
                </>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {isMobile && (
        <NavMenu 
          mobileOpen={mobileOpen} 
          handleDrawerToggle={handleDrawerToggle} 
        />
      )}

      <Container 
        component="main" 
        maxWidth="lg" 
        sx={{ 
          flex: 1, 
          py: 3,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Outlet />
      </Container>

      <Box component="footer" sx={{ py: 3, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} JobBoard. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default MainLayout;
