import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, CardMedia, Typography, Grid, Chip, Stack, Divider, Container, Paper } from '@mui/material';
import axios from 'axios';

const featureMap = {
  'Konum': 'Location',
  'Yemek': 'Food',
  'Temizlik': 'Cleanliness',
};

const API_URL = process.env.REACT_APP_API_URL;
if (!API_URL) throw new Error('REACT_APP_API_URL is not defined!');

export default function HotelDetail() {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [similarHotels, setSimilarHotels] = useState([]);
  const sliderRef = useRef(null);
  const navigate = useNavigate();
  const [selectedAspects, setSelectedAspects] = useState([]);

  useEffect(() => {
    axios.get(`${API_URL}/api/hotels`).then(res => {
      const found = res.data.find(h => h.hotel_name === id);
      setHotel(found);
      // Fetch similar hotels using the new API
      if (found) {
        axios.get(`${API_URL}/api/similar_hotels?hotel_name=${encodeURIComponent(found.hotel_name)}&top_n=5`)
          .then(res2 => setSimilarHotels(res2.data))
          .catch(() => setSimilarHotels([]));
      }
    });
  }, [id]);

  useEffect(() => {
    // Try to get selected aspects from localStorage (set in HotelRecommendationPage)
    const aspects = JSON.parse(localStorage.getItem('selectedAspects') || '[]');
    setSelectedAspects(aspects);
  }, [id]);

  // Auto-scroll for similar hotels
  useEffect(() => {
    if (!sliderRef.current || similarHotels.length < 2) return;
    let scrollAmount = 0;
    const scrollStep = 2;
    const interval = setInterval(() => {
      if (!sliderRef.current) return;
      sliderRef.current.scrollLeft += scrollStep;
      scrollAmount += scrollStep;
      if (sliderRef.current.scrollLeft + sliderRef.current.offsetWidth >= sliderRef.current.scrollWidth) {
        sliderRef.current.scrollLeft = 0;
        scrollAmount = 0;
      }
    }, 30);
    return () => clearInterval(interval);
  }, [similarHotels]);

  if (!hotel) return <div>Loading...</div>;

  return (
    <Container maxWidth="md" sx={{ mt: 6, mb: 6 }}>
      {selectedAspects.length > 0 && (
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mr: 1 }}>Selected Aspects:</Typography>
          {selectedAspects.map(a => (
            <Box key={a} sx={{ px: 2, py: 0.5, borderRadius: 2, bgcolor: '#e3f2fd', color: '#1976d2', fontWeight: 600, fontSize: 15 }}>
              {a.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </Box>
          ))}
        </Box>
      )}
      <Paper elevation={4} sx={{ borderRadius: 4, overflow: 'hidden', mb: 4 }}>
        <Grid container>
          <Grid item xs={12} md={5}>
            <CardMedia
              component="img"
              image={hotel.image_url}
              alt={hotel.hotel_name}
              sx={{ height: 320, width: '100%', objectFit: 'cover' }}
            />
          </Grid>
          <Grid item xs={12} md={7}>
            <CardContent>
              <Typography variant="h4" fontWeight={700} gutterBottom>{hotel.hotel_name}</Typography>
              <Typography variant="h6" color="primary" gutterBottom>{hotel.price} ₺</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mr: 1 }}>Rating:</Typography>
                <Box sx={{ fontWeight: 700 }}>{hotel.rating ? hotel.rating.toFixed(1) : '-'}</Box>
              </Box>
            </CardContent>
          </Grid>
        </Grid>
      </Paper>
      {/* Similar Hotels Slider */}
      {similarHotels.length > 0 && (
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
            Similar Hotels
          </Typography>
          <Box ref={sliderRef} sx={{ display: 'flex', overflowX: 'auto', gap: 3, pb: 2, scrollBehavior: 'smooth', '::-webkit-scrollbar': { display: 'none' } }}>
            {similarHotels.map(h => (
              <Card key={h.hotel_name} sx={{ minWidth: 240, maxWidth: 260, flex: '0 0 auto', cursor: 'pointer', borderRadius: 3, boxShadow: 3 }} onClick={() => navigate(`/hotel/${h.hotel_name}`)}>
                <CardMedia
                  component="img"
                  height="140"
                  image={h.image_url}
                  alt={h.hotel_name}
                  sx={{ borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
                />
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>{h.hotel_name}</Typography>
                  <Typography variant="body2" color="text.secondary">{h.price} ₺</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mr: 1 }}>Rating:</Typography>
                    <Box sx={{ fontWeight: 700 }}>{h.rating ? h.rating.toFixed(1) : '-'}</Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary">Similarity: {(h.similarity * 100).toFixed(1)}%</Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      )}
    </Container>
  );
} 