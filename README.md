# Hotel Review Analysis System

A multilingual sentiment analysis system for hotel reviews in Turkey, supporting both Turkish and English languages. The system provides visual sentiment scores and aspect-based analysis for hotel reviews.

## Features

- Multilingual support (Turkish and English)
- Aspect-based sentiment analysis (cleanliness, service quality, location)
- Visual sentiment scores and charts
- Hotel review management
- User-friendly interface
- Real-time analysis

## Tech Stack

### Frontend
- React.js
- Material-UI
- Chart.js
- Axios

### Backend
- FastAPI
- SQLAlchemy
- Pandas
- Transformers (BERT)
- Scikit-learn

## Prerequisites

- Node.js (v14 or higher)
- Python (v3.8 or higher)
- pip (Python package manager)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd hotel-frontend
```

2. Install frontend dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
cd backend
pip install -r requirements.txt
```

## Running the Application

1. Start the backend server:
```bash
cd backend
uvicorn main:app --reload
```

2. Start the frontend development server:
```bash
# In a new terminal
cd hotel-frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

## Project Structure

```
hotel-frontend/
├── src/
│   ├── components/
│   │   └── Navbar.js
│   │   ├── pages/
│   │   │   ├── Home.js
│   │   │   ├── HotelList.js
│   │   │   ├── HotelDetail.js
│   │   │   └── Analysis.js
│   │   └── App.js
│   ├── backend/
│   │   ├── main.py
│   │   └── requirements.txt
│   └── README.md
```

## API Endpoints

- `GET /api/hotels` - Get all hotels
- `GET /api/hotels/{id}` - Get hotel details
- `GET /api/reviews/{hotel_id}` - Get hotel reviews
- `GET /api/sentiment-analysis/{hotel_id}` - Get sentiment analysis results

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- BERT model for sentiment analysis
- Material-UI for the frontend components
- Chart.js for data visualization
