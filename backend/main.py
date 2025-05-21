from fastapi import FastAPI, HTTPException, Depends, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from typing import Optional
from pydantic import BaseModel
from models import Base, User
from auth import hash_password, verify_password, create_access_token, decode_access_token
import os
import pandas as pd
import requests
import random
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./users.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

app = FastAPI(title="Hotel Recommendation API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserOut(BaseModel):
    id: int
    username: str
    email: str
    class Config:
        orm_mode = True

@app.post("/api/register", response_model=UserOut)
def register(user: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter((User.username == user.username) | (User.email == user.email)).first():
        raise HTTPException(status_code=400, detail="Username or email already registered")
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hash_password(user.password)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/api/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    access_token = create_access_token({"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = decode_access_token(token)
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

@app.get("/api/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

UNSPLASH_ACCESS_KEY = 'wSwxlY8eaSsK5AF2ZCbKtp8gGtO4issQJxy1alA6CgY'

def get_image_url(hotel_name):
    cache_path = 'data/hotel_images_cache.csv'
    if not os.path.exists(cache_path):
        pd.DataFrame(columns=['hotel_name', 'image_url']).to_csv(cache_path, index=False)
    cache = pd.read_csv(cache_path)
    row = cache[cache['hotel_name'] == hotel_name]
    if not row.empty:
        return row.iloc[0]['image_url']
    url = f'https://api.unsplash.com/search/photos?query={hotel_name}&client_id={UNSPLASH_ACCESS_KEY}&per_page=1'
    try:
        resp = requests.get(url, timeout=5)
        try:
            data = resp.json()
            if data.get('results'):
                image_url = data['results'][0]['urls']['regular']
            else:
                image_url = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'
        except Exception as e:
            print(f"JSON decode error for {hotel_name}: {e}, response: {resp.text}")
            image_url = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'
    except Exception as e:
        print(f"Request error for {hotel_name}: {e}")
        image_url = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'
    cache = pd.concat([cache, pd.DataFrame([{'hotel_name': hotel_name, 'image_url': image_url}])], ignore_index=True)
    cache.to_csv(cache_path, index=False)
    return image_url

def get_latest_price(hotel_name):
    # Simulate fetching the latest price from an external API
    # In a real-world scenario, you would replace this with an actual API call
    # For demonstration, we'll use a mock API response
    mock_prices = {
        'Hotel A': 1200,
        'Hotel B': 1500,
        'Hotel C': 2000,
        'Hotel D': 1800,
        'Hotel E': 2500,
    }
    return mock_prices.get(hotel_name, random.randint(500, 3000))  # Fallback to random if not found

@app.get('/api/hotels')
def get_hotels():
    face_df = pd.read_csv('data/hotel_face_scores.csv')
    aspect_df = pd.read_csv('data/hotel_aspect_summary1.csv')
    subaspect_df = pd.read_csv('data/hotel_subaspect_summary.csv')
    reviews_df = pd.read_csv('data/final_processed_reviews_deepl_use.csv')

    aspect_pivot = aspect_df.pivot(index='hotel_name', columns='aspect', values='pos_ratio').fillna(0)
    subaspect_pivot = subaspect_df.pivot(index='hotel_name', columns='aspect', values='pos_ratio').fillna(0)

    # Calculate mean rating for each hotel
    hotel_ratings = reviews_df.groupby('hotel_name')['review_rating'].mean().to_dict()

    hotels = []
    for _, row in face_df.iterrows():
        hotel_name = row['hotel_name']
        aspects = aspect_pivot.loc[hotel_name].to_dict() if hotel_name in aspect_pivot.index else {}
        subaspects = subaspect_pivot.loc[hotel_name].to_dict() if hotel_name in subaspect_pivot.index else {}
        image_url = row.get('image_url') if pd.notnull(row.get('image_url')) and row.get('image_url') else get_image_url(hotel_name)
        price = row.get('price') if pd.notnull(row.get('price')) and row.get('price') else get_latest_price(hotel_name)
        rating = hotel_ratings.get(hotel_name, None)
        hotel = {
            'hotel_name': hotel_name,
            'face_score': row.get('face_score', 0),
            'face_emoji': row.get('face_emoji', ''),
            'price': price,
            'image_url': image_url,
            'aspects': aspects,
            'subaspects': subaspects,
            'rating': rating
        }
        hotels.append(hotel)
    return hotels

# Global cache for similarity matrix and hotel data
SIMILARITY_CACHE = {
    'agg': None,
    'cos_sim': None,
    'name_to_idx': None
}

def build_similarity_cache():
    df = pd.read_csv('data/final_processed_reviews_deepl_use.csv', encoding='utf-8-sig')
    df = df.dropna(subset=["hotel_name", "processed_final_review"])
    hotels = (
        df[["hotel_name", "review_rating"]]
        .groupby("hotel_name")["review_rating"].mean()
        .reset_index()
        .rename(columns={"review_rating": "hotel_overall_rating"})
    )
    agg = (
        df.groupby("hotel_name")["processed_final_review"]
          .agg(lambda texts: " ".join(texts))
          .reset_index()
          .merge(hotels, on="hotel_name", how="left")
    )
    tfidf = TfidfVectorizer(min_df=2, max_df=0.8, ngram_range=(1,2))
    X = tfidf.fit_transform(agg["processed_final_review"])
    cos_sim = cosine_similarity(X, X)
    name_to_idx = pd.Series(data=agg.index, index=agg["hotel_name"])
    SIMILARITY_CACHE['agg'] = agg
    SIMILARITY_CACHE['cos_sim'] = cos_sim
    SIMILARITY_CACHE['name_to_idx'] = name_to_idx

@app.get('/api/similar_hotels')
def get_similar_hotels(hotel_name: str, top_n: int = 5):
    if SIMILARITY_CACHE['agg'] is None:
        build_similarity_cache()
    agg = SIMILARITY_CACHE['agg']
    cos_sim = SIMILARITY_CACHE['cos_sim']
    name_to_idx = SIMILARITY_CACHE['name_to_idx']
    if hotel_name not in name_to_idx:
        return []
    idx = name_to_idx[hotel_name]
    sims = list(enumerate(cos_sim[idx]))
    sims = sorted(sims, key=lambda x: x[1], reverse=True)[1:top_n+1]
    # For image_url and price, use get_image_url and get_latest_price
    results = []
    for i, score in sims:
        hname = agg["hotel_name"].iloc[i]
        rating = agg["hotel_overall_rating"].iloc[i]
        image_url = get_image_url(hname)
        price = get_latest_price(hname)
        results.append({
            "hotel_name": hname,
            "rating": rating,
            "similarity": float(score),
            "image_url": image_url,
            "price": price
        })
    return results

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 