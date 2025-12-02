from fastapi import FastAPI, UploadFile, File, Form
from app.predictor import *
from app.dance_doodle import *
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
import os
from Levenshtein import distance as levenshtein_distance

# Initialize Groq client for speech transcription
try:
    from app.config import GROQ_API_KEY
    os.environ["GROQ_API_KEY"] = GROQ_API_KEY
    client = Groq(api_key=os.environ["GROQ_API_KEY"])
except ImportError:
    print("Warning: GROQ_API_KEY not found in config. Speech transcription will not work.")
    client = None

# Store repeat game results
repeat_game_results = {}

def sentence_similarity(target_sentence, spoken_sentence):
    """
    Compute similarity between two sentences (any language)
    Returns a percentage (0-100) of similarity
    """
    # Compute edit distance
    dist = levenshtein_distance(target_sentence, spoken_sentence)
    # Normalize by the length of the longer sentence
    max_len = max(len(target_sentence), len(spoken_sentence))
    similarity = (1 - dist / max_len) * 100
    return round(similarity, 2)

def transcribe_audio(file_bytes, file_id, target_text, round_number):
    """Transcribe audio and calculate similarity score"""
    tmp_path = f"tmp_{file_id}.mp3"
    
    try:
        # Save temporary file
        with open(tmp_path, "wb") as f:
            f.write(file_bytes)

        print(f"Transcribing audio for round {round_number}...")
        
        if client is None:
            raise Exception("Groq client not initialized - check GROQ_API_KEY")
        
        # Transcribe with Groq (Bengali language)
        with open(tmp_path, "rb") as f:
            transcription = client.audio.transcriptions.create(
                file=f,
                model="whisper-large-v3",
                response_format="verbose_json",
                language="bn",  # Bengali language code
                temperature=0.0
            )

        transcribed_text = transcription.text.strip()
        print(f"Transcription complete for round {round_number}: {transcribed_text}")
        
        # Calculate similarity
        similarity_score = sentence_similarity(target_text, transcribed_text)
        
        # Store result
        repeat_game_results[round_number] = {
            "target_text": target_text,
            "transcribed_text": transcribed_text,
            "similarity_score": similarity_score,
            "status": "completed"
        }
        
        print(f"Round {round_number} - Target: {target_text}")
        print(f"Round {round_number} - Transcribed: {transcribed_text}")
        print(f"Round {round_number} - Similarity: {similarity_score}%")
        
    except Exception as e:
        print(f"Error in transcription for round {round_number}: {e}")
        repeat_game_results[round_number] = {
            "target_text": target_text,
            "transcribed_text": "Error in transcription",
            "similarity_score": 0,
            "status": "error",
            "error": str(e)
        }
    finally:
        # Clean up temp file
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


app = FastAPI()

# ✅ Allow CORS from React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8081"],  # Allow both ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Hello, World!"}

@app.post("/predictPosture")
async def predict_posture(file: UploadFile = File(...)):
    contents = await file.read()
    print("Received file:", file.filename)
    result = predict_posture_from_image_bytes(contents)
    return result

@app.post("/predictGesture")
async def predict_gesture(file: UploadFile = File(...)):
    contents = await file.read()
    print("Received file:", file.filename)
    result = predict_gesture_from_image_bytes(contents)
    return result

@app.get("/gesture-labels")
async def get_gesture_labels():
    """Get all available gesture labels from the model"""
    try:
        from app.predictor import gesture_model
        labels = gesture_model.classes_.tolist()
        return {"labels": labels, "count": len(labels)}
    except Exception as e:
        return {"error": str(e)}




# Run the server with: uvicorn app.main:app --reload

# ============================================================================
# REPEAT WITH ME GAME ENDPOINTS
# ============================================================================

@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...), target_text: str = Form(...), round_number: int = Form(...)):
    """Transcribe audio file and calculate similarity with target text"""
    file_bytes = await file.read()
    file_id = file.filename

    # Run transcription in a separate thread (non-blocking)
    import threading
    thread = threading.Thread(target=transcribe_audio, args=(file_bytes, file_id, target_text, round_number))
    thread.start()

    return {"status": "processing", "file_id": file_id}

@app.get("/game-results")
def get_game_results():
    """Get all completed repeat game results"""
    completed_results = {}
    for round_number, result in repeat_game_results.items():
        if result["status"] == "completed":
            completed_results[round_number] = result
    
    return {
        "status": "success",
        "total_rounds": len(completed_results),
        "results": completed_results
    }

@app.post("/clear-game-results")
def clear_game_results():
    """Clear all repeat game results for a new game session"""
    global repeat_game_results
    repeat_game_results.clear()
    return {"status": "success", "message": "Game results cleared"}

@app.get("/round-result/{round_number}")
def get_round_result(round_number: int):
    """Get result for a specific round of repeat game"""
    if round_number in repeat_game_results:
        return {
            "status": "success",
            "result": repeat_game_results[round_number]
        }
    return {
        "status": "not_found",
        "message": f"Result for round {round_number} not found"
    }


## ============================================================================
# DANCE DOODLE GAME ENDPOINTS
## ============================================================================
@app.post("/predictDancePose")
async def predict_dance_pose(file: UploadFile = File(...)):
    """Predict dance pose from uploaded image"""
    contents = await file.read()
    print("Received dance pose file:", file.filename)
    result = predict_dance_pose_from_image_bytes(contents)
    return result

@app.get("/dancePoseStatus")
async def get_dance_pose_status():
    """Get dance pose model status and available labels"""
    try:
        status = check_model_status()
        return {
            "status": "success",
            "data": status
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}