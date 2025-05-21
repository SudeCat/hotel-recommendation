import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container, Avatar, Menu, MenuItem, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

function stringToColor(string) {
  let hash = 0;
  let i;
  for (i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += ('00' + value.toString(16)).slice(-2);
  }
  return color;
}

const Navbar = () => {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Container maxWidth="lg">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* Left: User Avatar or Placeholder */}
          <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 48 }}>
            {user ? (
              <IconButton onClick={handleAvatarClick} size="small">
                <Avatar sx={{ bgcolor: stringToColor(user.email), width: 40, height: 40 }}>
                  {user.username[0].toUpperCase()}
                </Avatar>
              </IconButton>
            ) : (
              <Avatar src="https://randomuser.me/api/portraits/women/44.jpg" alt="User" sx={{ width: 40, height: 40 }} />
            )}
          </Box>
          {/* Center: Title */}
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 500,
                letterSpacing: 2,
                border: '1.5px solid #bbb',
                borderRadius: 6,
                px: 4,
                py: 1,
                background: '#fff',
                color: '#222',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                cursor: 'pointer',
              }}
              onClick={() => navigate('/')}
            >
              GuestSight
            </Typography>
          </Box>
          {/* Right: Auth Buttons or User Info */}
          <Box>
            <Button color="inherit" sx={{ mr: 1, fontWeight: 600 }} onClick={() => navigate('/profile')}>
              Profile
            </Button>
            {user ? (
              <>
                <Typography sx={{ display: 'inline', mr: 2, fontWeight: 600 }}>{user.username}</Typography>
                <Button color="inherit" variant="outlined" sx={{ fontWeight: 600 }} onClick={logout}>
                  Logout
                </Button>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                  <MenuItem disabled>{user.email}</MenuItem>
                  {/* Add more user menu items here if needed */}
                </Menu>
              </>
            ) : (
              <>
                <Button color="inherit" sx={{ mr: 1, fontWeight: 600 }} onClick={() => navigate('/login')}>Login</Button>
                <Button color="inherit" variant="outlined" sx={{ fontWeight: 600 }} onClick={() => navigate('/signup')}>Signup</Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar; 