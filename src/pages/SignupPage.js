import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, TextField, Button, Alert, Paper, InputAdornment, IconButton, Fade, Link, Divider } from '@mui/material';
import { useUser } from '../context/UserContext';
import HotelIcon from '@mui/icons-material/Hotel';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import HomeIcon from '@mui/icons-material/Home';

const HOTEL_BG = "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80";

export default function SignupPage() {
  const { signup } = useUser();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
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
          background: 'linear-gradient(120deg, rgba(30,41,59,0.45) 0%, rgba(255,215,0,0.18) 100%)',
        },
        animation: 'bgmove 18s ease-in-out infinite alternate',
      }} />
      <Fade in={cardIn} timeout={900}>
        <Container maxWidth="xs" sx={{ zIndex: 2 }}>
          <Paper elevation={0} sx={{
            p: 5,
            borderRadius: 5,
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
            backdropFilter: 'blur(12px)',
            background: 'rgba(255,255,255,0.70)',
            border: '1.5px solid rgba(255,255,255,0.25)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            <Button startIcon={<HomeIcon />} sx={{ alignSelf: 'flex-end', mb: 1, color: '#1976d2', fontWeight: 700 }} onClick={() => navigate('/')}>Home</Button>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
              <Box sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #1976d2 60%, #FFD700 100%)',
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
                variant="h3"
                fontWeight={900}
                gutterBottom
                sx={{
                  background: 'linear-gradient(90deg, #1976d2 30%, #FFD700 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textAlign: 'center',
                  letterSpacing: 2,
                  mb: 0.5,
                  animation: 'shimmer 2.5s linear infinite',
                  backgroundSize: '200% auto',
                }}
              >
                Create Account
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1, textAlign: 'center' }}>
                Join our hotel community and discover your next stay!
              </Typography>
              <Divider sx={{ width: '60%', my: 1, borderColor: '#1976d2' }} />
            </Box>
            <Box component="form" onSubmit={e => { e.preventDefault(); setError(''); setSuccess(false); signup(username, email, password).then(() => { setSuccess(true); setTimeout(() => navigate('/login'), 1500); }).catch(err => setError(err.response?.data?.detail || 'Signup failed')); }} sx={{ width: '100%' }}>
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
                label="Email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                fullWidth
                margin="normal"
                required
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
              <Box sx={{ textAlign: 'right', mt: 1 }}>
                <Link component="button" underline="hover" sx={{ color: '#1976d2', fontWeight: 600, fontSize: 14 }} onClick={() => alert('Forgot password coming soon!')}>
                  Forgot password?
                </Link>
              </Box>
              {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ mt: 2 }}>Signup successful! Redirecting to login...</Alert>}
              <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 3, py: 1.5, fontWeight: 700, borderRadius: 2, fontSize: 18, background: 'linear-gradient(90deg, #1976d2 60%, #FFD700 100%)', boxShadow: '0 4px 16px 0 rgba(31, 38, 135, 0.10)', transition: 'transform 0.2s, background 0.3s', '&:hover': { background: 'linear-gradient(90deg, #1976d2 40%, #FFD700 100%)', transform: 'scale(1.04)' } }}>
                Sign Up
              </Button>
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Link
                  component="button"
                  underline="none"
                  sx={{ color: '#dc004e', fontWeight: 700, fontSize: 16, letterSpacing: 1, transition: 'color 0.2s', '&:hover': { color: '#1976d2', textDecoration: 'underline' } }}
                  onClick={() => navigate('/login')}
                >
                  Already have an account? Log in
                </Link>
              </Box>
            </Box>
          </Paper>
          {/* Footer */}
          <Box sx={{ mt: 5, textAlign: 'center', color: '#222', fontSize: 15, opacity: 0.85 }}>
            <Divider sx={{ mb: 2 }} />
            <Link href="#about" sx={{ mx: 2, color: '#1976d2', fontWeight: 600 }}>About</Link>
            <Link href="#contact" sx={{ mx: 2, color: '#1976d2', fontWeight: 600 }}>Contact</Link>
            <Link href="#privacy" sx={{ mx: 2, color: '#1976d2', fontWeight: 600 }}>Privacy Policy</Link>
            <Box sx={{ mt: 1, fontSize: 13, color: '#888' }}>
              &copy; {new Date().getFullYear()} Hotel Recommendation System
            </Box>
          </Box>
        </Container>
      </Fade>
      <style>{`
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