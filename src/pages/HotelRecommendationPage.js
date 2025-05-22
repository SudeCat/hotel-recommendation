import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Checkbox,
  FormControlLabel,
  Slider,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Stack,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  FormGroup,
  Paper,
  MenuItem,
  Select,
  Fade,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Rating
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import StarIcon from '@mui/icons-material/Star';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const faceIcons = {
  happy: <SentimentSatisfiedAltIcon color="success" fontSize="large" />,
  neutral: <SentimentNeutralIcon color="warning" fontSize="large" />,
  sad: <SentimentDissatisfiedIcon color="error" fontSize="large" />,
};

const allFeatures = [
  { name: "Accommodation & Facilities", subAspects: ["room_size", "bathroom", "cleanliness"] },
  { name: "Service & Social Experience", subAspects: ["staff_service", "customer_service", "price_value"] },
  { name: "Leisure & Meals", subAspects: ["breakfast_quality", "food_quality", "pool_area"] },
  { name: "Beach & Water", subAspects: ["beach_access", "sea_view", "water_activities"] },
  { name: "Location", subAspects: ["proximity", "accessibility", "surroundings"] }
];

const allTypes = ["Resort", "Hotel", "Boutique"];

const allKeywords = ["Muğla", "Hotel"];

const sortOptions = [
  { value: 'recommendation', label: 'By Recommendation' },
  { value: 'price_asc', label: 'Price Ascending' },
  { value: 'price_desc', label: 'Price Descending' },
];

const faceFilterOptions = [
  { value: 'happy', icon: <SentimentSatisfiedAltIcon /> },
  { value: 'neutral', icon: <SentimentNeutralIcon /> },
  { value: 'sad', icon: <SentimentDissatisfiedIcon /> },
];

const typeMap = {
  Resort: 'Resort',
  Otel: 'Hotel',
  Butik: 'Boutique',
};

const quickFilters = [
  { label: 'Top Rated', icon: <StarIcon />, filter: h => h.face_status === 'happy' && h.price > 1000 },
  { label: 'Budget', icon: <LocalOfferIcon />, filter: h => h.price <= 1000 },
  { label: 'Luxury', icon: <StarIcon color="warning" />, filter: h => h.price > 2000 },
];

const aspectToSub = {
  "room": ["room","floor","bedroom","bathroom","kitchen","balcony","bed","apartment","desk","hall","laundry","sofa","basement","spacious"],
  "service": ["service","staff","customer","maintenance","internet","support","quality","cleanliness","reliable"],
  "location": ["location","proximity","area","destination","vicinity","distance","close","parking"],
  "price": ["price","cost","value","discount","affordable","expensive","pay","worth"],
  "food": ["food","meal","restaurant","breakfast","lunch","dinner","soup","pizza","bread","coffee","dessert"],
  "Beach & Water": ["beach","sea","water","pool"],
  "Accommodation & Facilities": ["bathroom","shower","apartment","hotel","location"],
  "Service & Social Experience": ["staff","place","family","people","night","problem","river","price"],
  "Leisure & Meals": ["breakfast","beach","holiday"]
};

const API_URL = process.env.REACT_APP_API_URL;
if (!API_URL) throw new Error('REACT_APP_API_URL is not defined!');

export default function HotelRecommendationPage() {
  const { user } = useUser();
  const [hotels, setHotels] = useState([]);
  const [filteredHotels, setFilteredHotels] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedKeywords, setSelectedKeywords] = useState(["Muğla", "Hotel"]);
  const [selectedFeatures, setSelectedFeatures] = useState(allFeatures);
  const [priceRange, setPriceRange] = useState([0, 3000]);
  const [selectedTypes, setSelectedTypes] = useState(allTypes);
  const [sortBy, setSortBy] = useState('recommendation');
  const [faceFilter, setFaceFilter] = useState(null);
  const [quickFilter, setQuickFilter] = useState(null);
  const navigate = useNavigate();
  const [availableAspects, setAvailableAspects] = useState([]);
  const [availableSubaspects, setAvailableSubaspects] = useState([]);
  const [selectedAspects, setSelectedAspects] = useState([]);
  const [selectedSubaspects, setSelectedSubaspects] = useState([]);

  useEffect(() => {
    axios.get(`${API_URL}/api/hotels`)
      .then(res => {
        setHotels(res.data);
        const allAspects = Array.from(new Set(res.data.flatMap(h => Object.keys(h.aspects || {}))));
        const allSubaspects = Array.from(new Set(res.data.flatMap(h => Object.keys(h.subaspects || {}))));
        setAvailableAspects(allAspects);
        setAvailableSubaspects(allSubaspects);
      })
      .catch(err => {
        console.error('Error:', err);
      });
  }, []);

  useEffect(() => {
    let filtered = [...hotels];

    if (search) {
      filtered = filtered.filter(hotel =>
        hotel.hotel_name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (selectedKeywords.length > 0) {
      filtered = filtered.filter(hotel =>
        selectedKeywords.some(keyword =>
          hotel.hotel_name.toLowerCase().includes(keyword.toLowerCase())
        )
      );
    }

    if (selectedAspects.length > 0) {
      filtered = filtered.filter(hotel => {
        const dynScore = getDynamicFaceScore(hotel, selectedAspects);
        return dynScore !== null;
      });
    }

    if (selectedSubaspects.length > 0) {
      filtered = filtered.filter(hotel =>
        selectedSubaspects.every(sub => (hotel.subaspects?.[sub] ?? 0) > 0.5)
      );
    }

    filtered = filtered.filter(hotel =>
      hotel.price >= priceRange[0] && hotel.price <= priceRange[1]
    );

    if (faceFilter) {
      filtered = filtered.filter(hotel => {
        const dynScore = getDynamicFaceScore(hotel, selectedAspects);
        if (dynScore === null) return false;
        if (faceFilter === 'happy') return dynScore >= 0.7;
        if (faceFilter === 'neutral') return dynScore >= 0.4 && dynScore < 0.7;
        if (faceFilter === 'sad') return dynScore < 0.4;
        return true;
      });
    }

    if (quickFilter) {
      filtered = filtered.filter(quickFilter.filter);
    }

    switch (sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'recommendation':
        filtered.sort((a, b) => {
          const aScore = getDynamicFaceScore(a, selectedAspects) ?? 0;
          const bScore = getDynamicFaceScore(b, selectedAspects) ?? 0;
          return bScore - aScore;
        });
        break;
      default:
        break;
    }

    setFilteredHotels(filtered);
  }, [hotels, search, selectedKeywords, selectedAspects, selectedSubaspects, priceRange, faceFilter, quickFilter, sortBy]);

  useEffect(() => {
    localStorage.setItem('selectedAspects', JSON.stringify(selectedAspects));
  }, [selectedAspects]);

  const featuredHotels = hotels
    .filter(h => faceFilter ? h.face_status === faceFilter : h.face_status === 'happy')
    .sort((a, b) => b.price - a.price);

  function getDynamicFaceScore(hotel, selectedAspects) {
    if (!selectedAspects.length) return null;
    const scores = selectedAspects.map(a => hotel.aspects?.[a] ?? null).filter(x => x !== null);
    if (!scores.length) return null;
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    return avg;
  }

  function getFaceEmoji(score) {
    if (score === null) return '❓';
    if (score >= 0.7) return '😄';
    if (score >= 0.4) return '😐';
    return '😞';
  }

  return (
    <Box sx={{ background: 'linear-gradient(120deg, #fdfbfb 0%, #ebedee 100%)', minHeight: '100vh', pb: 6 }}>
      <Box sx={{
        width: '100%',
        minHeight: 140,
        background: '#1976d2',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        mb: 4,
        boxShadow: 3,
        position: 'relative',
        py: 2,
      }}>
        <Typography variant="h3" fontWeight={900} sx={{ letterSpacing: 2, mb: 0.5, textShadow: '0 2px 8px #0002', fontSize: { xs: 28, sm: 36, md: 48 } }}>
          Find Your Perfect Hotel
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.95, mb: 1, fontSize: { xs: 14, sm: 16, md: 20 } }}>
          {user ? `Welcome, ${user.username}!` : 'Discover, compare, and book the best hotels for your next trip.'}
        </Typography>
        <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
          {quickFilters.map(qf => (
            <Chip
              key={qf.label}
              icon={qf.icon}
              label={qf.label}
              color={quickFilter && quickFilter.label === qf.label ? 'secondary' : 'default'}
              onClick={() => setQuickFilter(quickFilter && quickFilter.label === qf.label ? null : qf)}
              sx={{ fontWeight: 600, fontSize: 16, px: 2, py: 1, borderRadius: 2, boxShadow: 1 }}
            />
          ))}
        </Stack>
      </Box>

      <Container maxWidth="lg" sx={{ mb: 3 }}>
        <Grid container spacing={2} justifyContent="center">
          <Grid item>
            <Paper sx={{ p: 2, borderRadius: 2, minWidth: 120, textAlign: 'center', boxShadow: 1 }}>
              <Typography variant="h5" fontWeight={700}>{hotels.length}</Typography>
              <Typography variant="body2" color="text.secondary">Hotels</Typography>
            </Paper>
          </Grid>
          <Grid item>
            <Paper sx={{ p: 2, borderRadius: 2, minWidth: 120, textAlign: 'center', boxShadow: 1 }}>
              <Typography variant="h5" fontWeight={700}>{hotels.reduce((acc, h) => acc + (h.review_count || 0), 0)}</Typography>
              <Typography variant="body2" color="text.secondary">Reviews</Typography>
            </Paper>
          </Grid>
          <Grid item>
            <Paper sx={{ p: 2, borderRadius: 2, minWidth: 120, textAlign: 'center', boxShadow: 1 }}>
              <Typography variant="h5" fontWeight={700}>{hotels.filter(h => h.face_status === 'happy').length}</Typography>
              <Typography variant="body2" color="text.secondary">Happy Hotels</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      <Container maxWidth="xl" sx={{ mt: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, mb: 2 }}>
              <Typography variant="h6" gutterBottom>Keywords</Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mb: 2 }}>
                {allKeywords.map(kw => (
                  <Chip
                    key={kw}
                    label={kw}
                    color={selectedKeywords.includes(kw) ? 'primary' : 'default'}
                    onClick={() => setSelectedKeywords(selectedKeywords.includes(kw)
                      ? selectedKeywords.filter(k => k !== kw)
                      : [...selectedKeywords, kw])}
                    sx={{ mb: 1 }}
                  />
                ))}
              </Stack>
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Aspects</Typography>
              {availableAspects.map(aspect => (
                <Accordion
                  key={aspect}
                  disableGutters
                  elevation={0}
                  sx={{
                    mb: 1,
                    borderRadius: 2,
                    border: '1px solid #e0e0e0',
                    '&:before': { display: 'none' },
                    background: selectedAspects.includes(aspect) ? '#f0f7ff' : '#fff'
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{
                      minHeight: 48,
                      '& .MuiAccordionSummary-content': {
                        alignItems: 'center',
                        gap: 2
                      }
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedAspects.includes(aspect)}
                          onChange={e => {
                            setSelectedAspects(e.target.checked
                              ? [...selectedAspects, aspect]
                              : selectedAspects.filter(x => x !== aspect));
                          }}
                          onClick={e => e.stopPropagation()}
                        />
                      }
                      label={
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: 18 }}>
                          {aspect.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                        </Typography>
                      }
                      sx={{ m: 0 }}
                    />
                  </AccordionSummary>
                  <AccordionDetails sx={{ pl: 4, pt: 0 }}>
                    {(aspectToSub[aspect] || []).map(sub => (
                      <FormControlLabel
                        key={sub}
                        control={
                          <Checkbox
                            checked={selectedSubaspects.includes(sub)}
                            onChange={e => {
                              setSelectedSubaspects(e.target.checked
                                ? [...selectedSubaspects, sub]
                                : selectedSubaspects.filter(x => x !== sub));
                            }}
                          />
                        }
                        label={<Typography variant="body2" sx={{ fontWeight: 500 }}>{sub}</Typography>}
                        sx={{ ml: 0 }}
                      />
                    ))}
                  </AccordionDetails>
                </Accordion>
              ))}

              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>Price Range</Typography>
              <Slider
                value={priceRange}
                onChange={(_, v) => setPriceRange(v)}
                min={0}
                max={3000}
                step={100}
                valueLabelDisplay="auto"
                sx={{ mb: 2 }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {priceRange[0]} ₺ - {priceRange[1]} ₺
              </Typography>

              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>Hotel Type</Typography>
              <FormGroup>
                {allTypes.map(t => (
                  <FormControlLabel
                    key={t}
                    control={<Checkbox checked={selectedTypes.includes(t)} onChange={e => {
                      setSelectedTypes(e.target.checked
                        ? [...selectedTypes, t]
                        : selectedTypes.filter(x => x !== t));
                    }} />}
                    label={t}
                  />
                ))}
              </FormGroup>
            </Paper>
          </Grid>
          <Grid item xs={12} md={9}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TextField
                placeholder="Search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 4, background: '#fff' },
                }}
                sx={{ flex: 1, mr: 2 }}
              />
              <ToggleButtonGroup
                value={faceFilter}
                exclusive
                onChange={(_, v) => setFaceFilter(v)}
                sx={{ mr: 2 }}
              >
                {faceFilterOptions.map(opt => (
                  <ToggleButton key={opt.value} value={opt.value}>
                    {opt.icon}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
              <Select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                sx={{ minWidth: 180, fontWeight: 600 }}
              >
                {sortOptions.map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </Select>
            </Box>
            {featuredHotels.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" fontWeight={700} sx={{ mb: 2, textAlign: 'left' }}>Featured Hotels</Typography>
                <Grid container spacing={3}>
                  {featuredHotels.map(hotel => (
                    <Grid item xs={12} sm={6} md={4} key={hotel.id}>
                      <Fade in timeout={700}>
                        <Box onClick={() => navigate(`/hotel/${hotel.id}`)} sx={{ cursor: 'pointer' }}>
                          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3, boxShadow: 4, border: '2px solid #1976d2' }}>
                            <CardMedia
                              component="img"
                              height="180"
                              image={hotel.image_url}
                              alt={hotel.name}
                            />
                            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>{hotel.name}</Typography>
                              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>{hotel.price} ₺</Typography>
                              <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center' }}>
                                {faceIcons[hotel.face_status] || <SentimentNeutralIcon color="disabled" fontSize="large" />}
                              </Box>
                            </CardContent>
                          </Card>
                        </Box>
                      </Fade>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
            <Grid container spacing={3}>
              {filteredHotels.map(hotel => (
                <Grid item xs={12} sm={6} md={4} key={hotel.hotel_name}>
                  <Fade in timeout={700}>
                    <div 
                      onClick={() => navigate(`/hotel/${hotel.hotel_name}`)}
                      style={{
                        cursor: 'pointer',
                        padding: '10px',
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        transition: 'all 0.2s',
                        ':hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                        }
                      }}
                    >
                      <img 
                        src={hotel.image_url} 
                        alt={hotel.hotel_name}
                        style={{
                          width: '100%',
                          height: '180px',
                          objectFit: 'cover',
                          borderRadius: '8px 8px 0 0'
                        }}
                      />
                      <div style={{ padding: '16px' }}>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 'bold' }}>
                          {hotel.hotel_name}
                        </h3>
                        <p style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold', color: '#1976d2' }}>
                          {hotel.price} ₺
                        </p>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Rating value={hotel.rating || 0} precision={0.1} readOnly size="small" />
                          <Typography variant="body2" sx={{ ml: 1, fontWeight: 600 }}>{hotel.rating ? hotel.rating.toFixed(1) : '-'}</Typography>
                        </Box>
                        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                          <Typography variant="h5" sx={{ mr: 1 }}>{getFaceEmoji(getDynamicFaceScore(hotel, selectedAspects))}</Typography>
                          <Typography variant="body2">{getDynamicFaceScore(hotel, selectedAspects) !== null ? `${Math.round(getDynamicFaceScore(hotel, selectedAspects) * 100)}%` : ''}</Typography>
                        </Box>
                      </div>
                    </div>
                  </Fade>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Container>
      <Box sx={{ mt: 8, textAlign: 'center', color: 'grey.600', fontSize: 16, py: 3, borderTop: '1px solid #eee' }}>
        &copy; {new Date().getFullYear()} GuestSight &mdash; All rights reserved.
      </Box>
    </Box>
  );
} 
 