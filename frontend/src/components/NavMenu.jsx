import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Drawer,
  Divider,
  useTheme,
  useMediaQuery,
  Box,
  Button
} from '@mui/material';
import { 
  Home as HomeIcon, 
  Work as WorkIcon, 
  Person as PersonIcon, 
  Bookmark as BookmarkIcon,
  PostAdd as PostAddIcon,
  ListAlt as ApplicationsIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const NavMenu = ({ mobileOpen, handleDrawerToggle }) => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const menuItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    { text: 'Jobs', icon: <WorkIcon />, path: '/jobs' },
  ];

  const authMenuItems = [
    { text: 'Post a Job', icon: <PostAddIcon />, path: '/post-job', requireAuth: true },
    { text: 'My Applications', icon: <ApplicationsIcon />, path: '/my-applications', requireAuth: true },
    { text: 'Saved Jobs', icon: <BookmarkIcon />, path: '/saved-jobs', requireAuth: true },
    { text: 'Profile', icon: <PersonIcon />, path: '/profile', requireAuth: true },
  ];

  const activeStyle = {
    color: theme.palette.primary.main,
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.main,
    },
  };

  const list = () => (
    <Box
      sx={{ 
        width: isMobile ? 250 : 'auto',
        pt: isMobile ? 2 : 0,
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
      role="presentation"
    >
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton 
              component={NavLink}
              to={item.path}
              sx={{
                '&.active': activeStyle,
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
              onClick={isMobile ? handleDrawerToggle : null}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {user && (
        <>
          <Divider sx={{ my: 1 }} />
          <List>
            {authMenuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton 
                  component={NavLink}
                  to={item.path}
                  sx={{
                    '&.active': activeStyle,
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                  onClick={isMobile ? handleDrawerToggle : null}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </>
      )}
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box',
            width: 250,
          },
        }}
      >
        {list()}
      </Drawer>
    );
  }

  return list();
};

export default NavMenu;
