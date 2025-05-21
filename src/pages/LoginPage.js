import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, TextField, Button, Alert, Paper, InputAdornment, IconButton, Fade, Link, Slide } from '@mui/material';
import { useUser } from '../context/UserContext';
import HotelIcon from '@mui/icons-material/Hotel';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const HOTEL_BG = "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80";

export default function LoginPage() {
  const { login } = useUser();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [cardIn, setCardIn] = useState(false);

  React.useEffect(() => {
    setTimeout(() => setCardIn(true), 200);
  }, []);

  return (
    <Box sx={{
      minHeight: '100vh',
      width: '100vw',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {/* Hotel background image with overlay */}
      <Box sx={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        background: `url('${HOTEL_BG}') center/cover no-repeat`,
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(120deg, rgba(30,41,59,0.45) 0%, rgba(100,115,201,0.25) 100%)',
        },
        animation: 'bgmove 18s ease-in-out infinite alternate',
      }} />
      <Slide in={cardIn} direction="up" timeout={900}>
        <Container maxWidth="xs" sx={{ zIndex: 2 }}>
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
              <Box sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #1976d2 60%, #dc004e 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1,
                boxShadow: 2,
                animation: 'pulse 1.8s infinite',
              }}>
                <HotelIcon sx={{ color: '#fff', fontSize: 38 }} />
              </Box>
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
                  animation: 'shimmer 2.5s linear infinite',
                  backgroundSize: '200% auto',
                }}
              >
                Welcome Back
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1, textAlign: 'center', fontWeight: 500 }}>
                Log in to discover and book your next dream hotel.
              </Typography>
            </Box>
            <Box component="form" onSubmit={e => { e.preventDefault(); setError(''); login(username, password).then(() => navigate('/')).catch(err => setError(err.response?.data?.detail || 'Login failed')); }} sx={{ width: '100%' }}>
              <TextField
                label="Username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                fullWidth
                margin="normal"
                required
                autoFocus
                InputProps={{ sx: { borderRadius: 2 } }}
              />
              <TextField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                fullWidth
                margin="normal"
                required
                InputProps={{
                  sx: { borderRadius: 2 },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(v => !v)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                sx={{
                  mt: 3,
                  py: 1.5,
                  fontWeight: 700,
                  borderRadius: 2,
                  fontSize: 18,
                  background: 'linear-gradient(90deg, #1976d2 60%, #dc004e 100%)',
                  boxShadow: '0 4px 16px 0 rgba(31, 38, 135, 0.10)',
                  transition: 'transform 0.2s, background 0.3s',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #1976d2 40%, #dc004e 100%)',
                    transform: 'scale(1.04)',
                  },
                }}
              >
                Log In
              </Button>
              <Button
                fullWidth
                variant="outlined"
                sx={{ mt: 2, fontWeight: 700 }}
                onClick={() => navigate('/')}
              >
                Continue as Guest
              </Button>
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Link
                  component="button"
                  underline="none"
                  sx={{ color: '#dc004e', fontWeight: 700, fontSize: 16, letterSpacing: 1, transition: 'color 0.2s', '&:hover': { color: '#1976d2', textDecoration: 'underline' } }}
                  onClick={() => navigate('/signup')}
                >
                  New here? Create an account
                </Link>
              </Box>
            </Box>
          </Paper>
        </Container>
      </Slide>
      <style>{`
        @keyframes float {
          0% { transform: translateY(0); }
          100% { transform: translateY(-10px); }
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.3); }
          70% { box-shadow: 0 0 0 12px rgba(25, 118, 210, 0); }
          100% { box-shadow: 0 0 0 0 rgba(25, 118, 210, 0); }
        }
        @keyframes shimmer {
          0% { background-position: 200% center; }
          100% { background-position: 0% center; }
        }
        @keyframes bgmove {
          0% { background-position: 0% 0%; }
          100% { background-position: 100% 100%; }
        }
      `}</style>
    </Box>
  );
} 