import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
} from '@mui/material';
import HotelIcon from '@mui/icons-material/Hotel';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import TranslateIcon from '@mui/icons-material/Translate';

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Hotel Reviews',
      description: 'Browse through detailed reviews of hotels in Turkey, available in both Turkish and English.',
      icon: <HotelIcon sx={{ fontSize: 40 }} />,
      action: () => navigate('/hotels'),
    },
    {
      title: 'Sentiment Analysis',
      description: 'View sentiment analysis results for hotel reviews, including cleanliness, service quality, and location ratings.',
      icon: <AnalyticsIcon sx={{ fontSize: 40 }} />,
      action: () => navigate('/analysis'),
    },
    {
      title: 'Multilingual Support',
      description: 'Access reviews and analysis in both Turkish and English languages.',
      icon: <TranslateIcon sx={{ fontSize: 40 }} />,
      action: () => navigate('/hotels'),
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box textAlign="center" mb={6}>
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to Hotel Review Analysis
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Analyze hotel reviews in Turkish and English with advanced sentiment analysis
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {features.map((feature, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    mb: 2,
                    color: 'primary.main',
                  }}
                >
                  {feature.icon}
                </Box>
                <Typography gutterBottom variant="h5" component="h2" align="center">
                  {feature.title}
                </Typography>
                <Typography align="center" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                <Button
                  variant="contained"
                  onClick={feature.action}
                  startIcon={feature.icon}
                >
                  Explore
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Home; 