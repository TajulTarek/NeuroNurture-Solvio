from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
import uvicorn
import math

# Load models and preprocessing info once on startup
results = joblib.load("../all_game_models.pkl")

def clean_data(data):
    """Replace null, NaN, or invalid values with 10 (changed from 100 to 10)"""
    if isinstance(data, dict):
        return {key: clean_data(value) for key, value in data.items()}
    elif isinstance(data, list):
        return [clean_data(item) for item in data]
    elif data is None:
        return 10
    elif isinstance(data, float) and math.isnan(data):
        return 10
    elif isinstance(data, str) and data.lower() in ['nan', 'null', 'none', '']:
        return 10
    else:
        try:
            # Try to convert to float, if fails return 10
            float_val = float(data)
            return 10 if math.isnan(float_val) else float_val
        except (ValueError, TypeError):
            return 10

def extract_game_features(game_data, game_name):
    """Extract only the relevant features for each game, dropping unnecessary columns"""
    
    # Define the relevant columns for each game (as they appear in training data)
    game_columns = {
        "dance_doodle_game": ["age", "cool_arms", "crossy_play", "open_wings", "shh_fun", "silly_boxer", "happy_stand", "stretch"],
        "gaze_game": ["age", "round1count", "round2count", "round3count"],
        "gesture_game": ["age", "butterfly", "closed_fist", "dua", "heart", "open_palm", "pointing_up", "spectacle", "thumbs_down", "thumbs_up", "victory", "iloveyou"],
        "mirror_posture_game": ["age", "kiss", "mouth_open", "showing_teeth", "looking_sideways"],
        "repeat_with_me_game": ["age", "average_score", "round1score", "round2score", "round3score", "round4score", "round5score", "round6score", "round7score", "round8score", "round9score", "round10score", "round11score", "round12score"]
    }
    
    # Unnecessary columns to drop
    unnecessary_columns = [
        "id", "childId", "child_id", "dateTime", "sessionId", "isASD", "isasd", 
        "isTrainingAllowed", "schoolTaskId", "suspectedASD", "tournamentId", 
        "videoURL", "date_time", "session_id", "suspected_asd", "video_url", 
        "school_task_id", "is_training_allowed", "tournament_id"
    ]
    
    if game_name not in game_columns:
        raise ValueError(f"Unknown game: {game_name}")
    
    relevant_columns = game_columns[game_name]
    extracted_data = {}
    
    # Extract relevant features
    for col in relevant_columns:
        if col in game_data:
            extracted_data[col] = clean_data(game_data[col])
        else:
            # If column is missing, fill with 10
            extracted_data[col] = 10
    
    return extracted_data

# Define the games in lexicographic order (must match training!)
games = ["dance_doodle_game", "gaze_game", "gesture_game", "mirror_posture_game", "repeat_with_me_game"]

# Build a dictionary for quick model lookup by bitmask
models_dict = {r["bitmask"]: r for r in results}

# Define FastAPI app
app = FastAPI(title="ALI Score Prediction API", version="1.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PredictRequest(BaseModel):
    games: int
    data: dict 

@app.post("/predict_ali_score")
def predict_ali_score(req: PredictRequest):
    try:
        # Validate subset number (games parameter)
        if not (1 <= req.games <= 31):
            raise HTTPException(status_code=400, detail="games parameter must be between 1 and 31")
        
        # Convert integer to bitmask string
        bitmask = format(req.games, f"0{len(games)}b")[::-1]

        # Check if model exists
        if bitmask not in models_dict:
            raise HTTPException(status_code=400, detail=f"No model found for bitmask {bitmask}")

        model_entry = models_dict[bitmask]
        model = model_entry["model"]

        # Get subset of games included
        subset = [games[j] for j in range(len(games)) if bitmask[j] == "1"]

        # Process and merge data from included games
        merged_data = {}
        for game in subset:
            if game not in req.data:
                raise HTTPException(status_code=400, detail=f"Missing data for game '{game}'. Required games: {subset}")
            
            # Extract only relevant features for this game, dropping unnecessary columns
            game_features = extract_game_features(req.data[game], game)
            merged_data.update(game_features)

        # Get model features and ensure correct order
        model_features = model.feature_names_in_
        
        # Ensure all model features are present, fill missing ones with 10
        for feature in model_features:
            if feature not in merged_data:
                merged_data[feature] = 10

        # Create DataFrame with all required features in correct order
        X = pd.DataFrame([merged_data])
        X = X[model_features]  # Ensure correct column order
        
        # Final cleanup - replace any remaining NaN with 10
        X = X.fillna(10)
        
        # Convert all to numeric, coerce errors to 10
        for col in X.columns:
            X[col] = pd.to_numeric(X[col], errors='coerce').fillna(10)

        # Make prediction
        prediction = model.predict(X)[0]
        probabilities = model.predict_proba(X)[0]
        
        # Calculate ALI score as percentage (probability of being class 1)
        ali_score = round(probabilities[1] * 100, 2)
        
        
        response = {
            "bitmask": bitmask,
            "subset": subset,
            "prediction": int(prediction),
            "probabilities": [round(probabilities[0], 2), round(probabilities[1], 2)]
        }
        
        return response

    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        print(f"Error in predict_ali_score: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/")
def root():
    """Health check endpoint"""
    return {
        "message": "ALI Score Prediction API is running",
        "available_games": games,
        "total_models": len(models_dict),
        "games_parameter_range": "1-31"
    }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8010)

