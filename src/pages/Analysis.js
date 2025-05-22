import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import axios from 'axios';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const API_URL = process.env.REACT_APP_API_URL;
if (!API_URL) throw new Error('REACT_APP_API_URL is not defined!');

const Analysis = () => {
  const [searchParams] = useSearchParams();
  const hotelId = searchParams.get('hotelId');
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('all');

  useEffect(() => {
    const fetchAnalysisData = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/sentiment-analysis/${hotelId}`
        );
        setAnalysisData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching analysis data:', error);
        setLoading(false);
      }
    };

    if (hotelId) {
      fetchAnalysisData();
    }
  }, [hotelId]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!analysisData) {
    return (
      <Container>
        <Typography variant="h5" color="error">
          No analysis data available
        </Typography>
      </Container>
    );
  }

  const sentimentData = {
    labels: ['Positive', 'Neutral', 'Negative'],
    datasets: [
      {
        data: [
          analysisData.positive_count,
          analysisData.neutral_count,
          analysisData.negative_count,
        ],
        backgroundColor: ['#4caf50', '#ff9800', '#f44336'],
      },
    ],
  };

  const aspectData = {
    labels: ['Cleanliness', 'Service', 'Location'],
    datasets: [
      {
        label: 'Average Rating',
        data: [
          analysisData.cleanliness_rating,
          analysisData.service_rating,
          analysisData.location_rating,
        ],
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Sentiment Analysis
      </Typography>

      <FormControl sx={{ mb: 4, minWidth: 200 }}>
        <InputLabel>Language</InputLabel>
        <Select
          value={selectedLanguage}
          label="Language"
          onChange={(e) => setSelectedLanguage(e.target.value)}
        >
          <MenuItem value="all">All Languages</MenuItem>
          <MenuItem value="en">English</MenuItem>
          <MenuItem value="tr">Turkish</MenuItem>
        </Select>
      </FormControl>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Overall Sentiment Distribution
              </Typography>
              <Box sx={{ height: 300 }}>
                <Pie data={sentimentData} options={{ maintainAspectRatio: false }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Aspect Ratings
              </Typography>
              <Box sx={{ height: 300 }}>
                <Bar
                  data={aspectData}
                  options={{
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 5,
                      },
                    },
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Key Insights
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle1" gutterBottom>
                    Most Common Positive Aspects
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {analysisData.top_positive_aspects.join(', ')}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle1" gutterBottom>
                    Most Common Negative Aspects
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {analysisData.top_negative_aspects.join(', ')}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle1" gutterBottom>
                    Improvement Areas
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {analysisData.improvement_areas.join(', ')}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Analysis; 