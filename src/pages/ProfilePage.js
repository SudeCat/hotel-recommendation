import React from 'react';
import { Box, Container, Typography, Paper, Avatar, Button, Divider, Fade, Stack } from '@mui/material';
import { useUser } from '../context/UserContext';
import HotelIcon from '@mui/icons-material/Hotel';
import StarIcon from '@mui/icons-material/Star';
import HistoryIcon from '@mui/icons-material/History';
import SettingsIcon from '@mui/icons-material/Settings';

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

export default function ProfilePage() {
  const { user, logout } = useUser();

  return (
    <Box sx={{
      minHeight: '100vh',
      background: `linear-gradient(120deg, #e0eafc 0%, #cfdef3 100%), url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80') center/cover no-repeat`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <Fade in timeout={800}>
        <Container maxWidth="sm" sx={{ zIndex: 2 }}>
          <Paper elevation={0} sx={{
            p: 5,
            borderRadius: 5,
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
            backdropFilter: 'blur(12px)',
            background: 'rgba(255,255,255,0.65)',
            border: '1.5px solid rgba(255,255,255,0.25)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ width: 80, height: 80, bgcolor: stringToColor(user?.email || 'U'), fontSize: 40, mb: 1, boxShadow: 2 }}>
                {user?.username ? user.username[0].toUpperCase() : <HotelIcon fontSize="large" />}
              </Avatar>
              <Typography
                variant="h4"
                fontWeight={900}
                gutterBottom
                sx={{
                  background: 'linear-gradient(90deg, #1976d2 30%, #dc004e 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textAlign: 'center',
                  letterSpacing: 2,
                  mb: 0.5,
                }}
              >
                {user?.username || 'User'}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1, textAlign: 'center' }}>
                {user?.email}
              </Typography>
              <Divider sx={{ width: '60%', my: 1, borderColor: '#1976d2' }} />
            </Box>
            <Stack spacing={3} sx={{ width: '100%', mt: 2 }}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3, background: 'rgba(255,255,255,0.85)', boxShadow: 1, display: 'flex', alignItems: 'center' }}>
                <StarIcon color="warning" sx={{ mr: 2, fontSize: 32 }} />
                <Box>
                  <Typography fontWeight={700}>Favorites</Typography>
                  <Typography variant="body2" color="text.secondary">Your favorite hotels will appear here.</Typography>
                </Box>
                <Button variant="outlined" size="small" sx={{ ml: 'auto', fontWeight: 600 }}>View</Button>
              </Paper>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3, background: 'rgba(255,255,255,0.85)', boxShadow: 1, display: 'flex', alignItems: 'center' }}>
                <HistoryIcon color="primary" sx={{ mr: 2, fontSize: 32 }} />
                <Box>
                  <Typography fontWeight={700}>Booking History</Typography>
                  <Typography variant="body2" color="text.secondary">Your past bookings will appear here.</Typography>
                </Box>
                <Button variant="outlined" size="small" sx={{ ml: 'auto', fontWeight: 600 }}>View</Button>
              </Paper>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3, background: 'rgba(255,255,255,0.85)', boxShadow: 1, display: 'flex', alignItems: 'center' }}>
                <SettingsIcon color="action" sx={{ mr: 2, fontSize: 32 }} />
                <Box>
                  <Typography fontWeight={700}>Settings</Typography>
                  <Typography variant="body2" color="text.secondary">Manage your account settings here.</Typography>
                </Box>
                <Button variant="outlined" size="small" sx={{ ml: 'auto', fontWeight: 600 }}>Edit</Button>
              </Paper>
            </Stack>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{
                mt: 4,
                py: 1.5,
                fontWeight: 700,
                borderRadius: 2,
                fontSize: 18,
                background: 'linear-gradient(90deg, #1976d2 60%, #dc004e 100%)',
                boxShadow: '0 4px 16px 0 rgba(31, 38, 135, 0.10)',
                transition: 'background 0.3s',
                '&:hover': {
                  background: 'linear-gradient(90deg, #1976d2 40%, #dc004e 100%)',
                },
              }}
              onClick={logout}
            >
              Log Out
            </Button>
          </Paper>
        </Container>
      </Fade>
      <style>{`
        @keyframes float {
          0% { transform: translateY(0); }
          100% { transform: translateY(-10px); }
        }
      `}</style>
    </Box>
  );
} 