import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../axiosConfig';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Avatar,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  Box
} from '@mui/material';
import PersonAdd from '@mui/icons-material/PersonAdd';
import Settings from '@mui/icons-material/Settings';
import Logout from '@mui/icons-material/Logout';

export default function Navbar() {
  const token = localStorage.getItem('token');
  const [isRecruiter, setIsRecruiter] = useState(false);
  const [username, setUsername] = useState('');
  const [menuAnchor, setMenuAnchor] = useState(null);
  const menuOpen = Boolean(menuAnchor);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setIsRecruiter(false);
      setUsername('');
      return;
    }
    api
      .get('/api/user/me')
      .then((res) => {
        const rolesRaw = res.data?.roles || [];
        const roles = Array.isArray(rolesRaw)
          ? rolesRaw.map((r) => (typeof r === 'string' ? r : r.name))
          : [];
        setIsRecruiter(roles.includes('ROLE_RECRUITER'));
        setUsername(res.data?.username || '');
      })
      .catch(() => {
        setIsRecruiter(false);
        setUsername('');
      });
  }, [token]);

  const handleOpenMenu = (event) => setMenuAnchor(event.currentTarget);
  const handleCloseMenu = () => setMenuAnchor(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    handleCloseMenu();
    navigate('/login');
  };

  const avatarLetter = username ? username.charAt(0).toUpperCase() : 'U';

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar sx={{ display: 'flex', gap: 2 }}>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit', fontWeight: 700 }}
        >
          Job<Typography component="span" color="primary" sx={{ fontWeight: 800 }}>Rec</Typography>
        </Typography>

        {token && isRecruiter && (
          <Button component={Link} to="/offers/create" variant="contained" color="primary">
            Create Job Offer
          </Button>
        )}

        {!token && (
          <>
            <Button component={Link} to="/register" color="primary">Register</Button>
            <Button component={Link} to="/login" variant="contained" color="primary">Login</Button>
          </>
        )}

        {token && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="Account settings">
              <IconButton
                onClick={handleOpenMenu}
                size="small"
                sx={{ ml: 1 }}
                aria-controls={menuOpen ? 'account-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={menuOpen ? 'true' : undefined}
              >
                <Avatar sx={{ width: 32, height: 32 }}>{avatarLetter}</Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={menuAnchor}
              id="account-menu"
              open={menuOpen}
              onClose={handleCloseMenu}
              onClick={handleCloseMenu}
              slotProps={{
                paper: {
                  elevation: 0,
                  sx: {
                    overflow: 'visible',
                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                    mt: 1.5,
                    '& .MuiAvatar-root': {
                      width: 32,
                      height: 32,
                      ml: -0.5,
                      mr: 1,
                    },
                    '&::before': {
                      content: '""',
                      display: 'block',
                      position: 'absolute',
                      top: 0,
                      right: 14,
                      width: 10,
                      height: 10,
                      bgcolor: 'background.paper',
                      transform: 'translateY(-50%) rotate(45deg)',
                      zIndex: 0,
                    },
                  },
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={() => navigate('/profile')}>
                <Avatar /> Profile
              </MenuItem>
              <MenuItem onClick={() => navigate('/profile')}>
                <Avatar /> My account
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => navigate('/applications')}>
                <ListItemIcon>
                  <PersonAdd fontSize="small" />
                </ListItemIcon>
               my applications
              </MenuItem>
              <MenuItem onClick={() => navigate('/profile')}>
                <ListItemIcon>
                  <Settings fontSize="small" />
                </ListItemIcon>
                Settings
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
