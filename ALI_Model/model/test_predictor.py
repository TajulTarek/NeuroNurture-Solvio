"""
ALI Model Testing Function

This module provides a function to test ALI models using the same bitmask system
as the training process. It accepts a subset number (1-31) and game data dictionary
to make predictions using the appropriate trained model.

Usage:
    from test_predictor import test_ali_model
    
    # Example game data (1 row for each game)
    game_data = {
        'dance_doodle_game': {
            'child_id': 'C001',
            'age': 6,
            'cool_arms': 5,
            'crossy_play': 3,
            'open_wings': 7,
            'shh_fun': 2,
            'silly_boxer': 4,
            'happy_stand': 6,
            'stretch': 3
        },
        'gaze_game': {
            'child_id': 'C001',
            'age': 6,
            'round1count': 15,
            'round2count': 18,
            'round3count': 12
        },
        # ... other games
    }
    
    # Test with subset 31 (all games)
    result = test_ali_model(31, game_data)
"""

import pandas as pd
import joblib
import math
from typing import Dict, Any, Optional, List


def clean_data(data):
    """Replace null, NaN, or invalid values with 100"""
    if isinstance(data, dict):
        return {key: clean_data(value) for key, value in data.items()}
    elif isinstance(data, list):
        return [clean_data(item) for item in data]
    elif data is None:
        return 100
    elif isinstance(data, float) and math.isnan(data):
        return 100
    elif isinstance(data, str) and data.lower() in ['nan', 'null', 'none', '']:
        return 100
    else:
        try:
            # Try to convert to float, if fails return 100
            float_val = float(data)
            return 100 if math.isnan(float_val) else float_val
        except (ValueError, TypeError):
            return 100


def test_ali_model(subset_number: int, game_data: Dict[str, Dict[str, Any]], 
                   models_path: str = "../all_game_models.pkl") -> Dict[str, Any]:
    """
    Test an ALI model using the bitmask system and provided game data.
    
    Parameters:
    -----------
    subset_number : int
        Number from 1 to 31 representing which games to include.
        Uses bitmask to determine game subset.
        
    game_data : Dict[str, Dict[str, Any]]
        Dictionary containing game data for each game.
        Format: {'game_name': {'feature1': value1, 'feature2': value2, ...}}
        
    models_path : str, optional
        Path to the trained models pickle file. Default: "../all_game_models.pkl"
        
    Returns:
    --------
    Dict[str, Any]
        Dictionary containing:
        - bitmask: The bitmask used for game selection
        - subset: List of games included in this subset
        - prediction: Predicted class (0 or 1)
        - probabilities: List of probabilities [prob_class_0, prob_class_1]
        - confidence: Confidence level (max probability)
        - model_accuracy: Training accuracy of the model
        - features_used: List of features used by the model
        - processed_data: The processed input data used for prediction
        
    Raises:
    -------
    ValueError
        If subset_number is not between 1 and 31
    FileNotFoundError
        If models file is not found
    KeyError
        If required game data is missing
    """
    
    # Validate subset number
    if not (1 <= subset_number <= 31):
        raise ValueError("subset_number must be between 1 and 31")
    
    # Load trained models
    try:
        results = joblib.load(models_path)
    except FileNotFoundError:
        raise FileNotFoundError(f"Models file not found at {models_path}")
    
    # Define games in lexicographic order (must match training)
    games = ["dance_doodle_game", "gaze_game", "gesture_game", "mirror_posture_game", "repeat_with_me_game"]
    
    # Convert subset number to bitmask
    bitmask = format(subset_number, f"0{len(games)}b")[::-1]
    
    # Determine which games to include based on bitmask
    subset = [games[j] for j in range(len(games)) if bitmask[j] == "1"]
    
    # Find the model for this subset
    model_entry = None
    for result in results:
        if result["subset"] == subset_number:
            model_entry = result
            break
    
    if model_entry is None:
        raise ValueError(f"No model found for subset {subset_number}")
    
    model = model_entry["model"]
    model_accuracy = model_entry.get("accuracy", "Unknown")
    
    # Clean all input data
    game_data = clean_data(game_data)
    
    # Merge data from included games
    merged_data = {}
    for game in subset:
        if game not in game_data:
            raise KeyError(f"Missing data for game '{game}'. Required games: {subset}")
        
        game_data_clean = clean_data(game_data[game])
        merged_data.update(game_data_clean)
    
    # Get model features and ensure correct order
    model_features = model.feature_names_in_
    
    # Ensure all model features are present, fill missing ones with 100
    for feature in model_features:
        if feature not in merged_data:
            merged_data[feature] = 100
    
    # Create DataFrame with all required features in correct order
    X = pd.DataFrame([merged_data])
    X = X[model_features]  # Ensure correct column order
    
    # Final cleanup - replace any remaining NaN with 100
    X = X.fillna(100)
    
    # Convert all to numeric, coerce errors to 100
    for col in X.columns:
        X[col] = pd.to_numeric(X[col], errors='coerce').fillna(100)
    
    # Make prediction
    prediction = model.predict(X)[0]
    probabilities = model.predict_proba(X)[0]
    
    # Calculate confidence (max probability)
    confidence = max(probabilities)
    
    # Prepare response
    result = {
        "bitmask": bitmask,
        "subset": subset,
        "prediction": int(prediction),
        "probabilities": probabilities.tolist(),
        "confidence": float(confidence),
        "model_accuracy": model_accuracy,
        "features_used": model_features.tolist(),
        "processed_data": X.iloc[0].to_dict()
    }
    
    return result


def get_available_subsets(models_path: str = "../all_game_models.pkl") -> List[Dict[str, Any]]:
    """
    Get information about all available model subsets.
    
    Parameters:
    -----------
    models_path : str, optional
        Path to the trained models pickle file. Default: "../all_game_models.pkl"
        
    Returns:
    --------
    List[Dict[str, Any]]
        List of dictionaries containing subset information:
        - subset: Subset number
        - bitmask: Bitmask string
        - games: List of games included
        - accuracy: Model accuracy
    """
    
    try:
        results = joblib.load(models_path)
    except FileNotFoundError:
        raise FileNotFoundError(f"Models file not found at {models_path}")
    
    games = ["dance_doodle_game", "gaze_game", "gesture_game", "mirror_posture_game", "repeat_with_me_game"]
    
    subsets_info = []
    for result in results:
        bitmask = result["bitmask"]
        subset_games = [games[j] for j in range(len(games)) if bitmask[j] == "1"]
        
        subsets_info.append({
            "subset": result["subset"],
            "bitmask": bitmask,
            "games": subset_games,
            "accuracy": result.get("accuracy", "Unknown")
        })
    
    return subsets_info


def print_subset_info(subset_number: int, models_path: str = "../all_game_models.pkl"):
    """
    Print detailed information about a specific subset.
    
    Parameters:
    -----------
    subset_number : int
        Subset number to get information for
    models_path : str, optional
        Path to the trained models pickle file
    """
    
    try:
        results = joblib.load(models_path)
    except FileNotFoundError:
        print(f"Models file not found at {models_path}")
        return
    
    games = ["dance_doodle_game", "gaze_game", "gesture_game", "mirror_posture_game", "repeat_with_me_game"]
    
    # Find the model for this subset
    model_entry = None
    for result in results:
        if result["subset"] == subset_number:
            model_entry = result
            break
    
    if model_entry is None:
        print(f"No model found for subset {subset_number}")
        return
    
    bitmask = model_entry["bitmask"]
    subset_games = [games[j] for j in range(len(games)) if bitmask[j] == "1"]
    accuracy = model_entry.get("accuracy", "Unknown")
    
    print(f"Subset {subset_number} Information:")
    print(f"  Bitmask: {bitmask}")
    print(f"  Games: {', '.join(subset_games)}")
    print(f"  Accuracy: {accuracy}")
    print(f"  Number of games: {len(subset_games)}")


if __name__ == "__main__":
    # Example usage
    print("ALI Model Testing Function")
    print("=" * 50)
    
    # Example game data
    example_game_data = {
        'dance_doodle_game': {
            'child_id': 'C001',
            'age': 6,
            'cool_arms': 5,
            'crossy_play': 3,
            'open_wings': 7,
            'shh_fun': 2,
            'silly_boxer': 10,
            'happy_stand': 1,
            'stretch': 9
        },
        'gaze_game': {
            'child_id': 'C001',
            'age': 6,
            'round1count': 15,
            'round2count': 18,
            'round3count': 12
        },
        'gesture_game': {
            'child_id': 'C001',
            'age': 6,
            'butterfly': 2,
            'closed_fist': 1,
            'dua': 3,
            'heart': 2,
            'open_palm': 1,
            'pointing_up': 2,
            'spectacle': 1,
            'thumbs_down': 2,
            'thumbs_up': 3,
            'victory': 1,
            'iloveyou': 2
        },
        'mirror_posture_game': {
            'child_id': 'C001',
            'age': 6,
            'kiss': 2,
            'mouth_open': 1,
            'showing_teeth': 3,
            'looking_sideways': 2
        },
        'repeat_with_me_game': {
            'child_id': 'C001',
            'age': 6,
            'average_score': 35,
            'round1score': 30,
            'round2score': 40,
            'round3score': 25,
            'round4score': 35,
            'round5score': 30,
            'round6score': 40,
            'round7score': 25,
            'round8score': 35,
            'round9score': 30,
            'round10score': 40,
            'round11score': 25,
            'round12score': 35
        }
    }
    
    try:
        # Test with subset 31 (all games)
        print("Testing with subset 31 (all games):")
        result = test_ali_model(31, example_game_data)
        
        print(f"Prediction: {result['prediction']}")
        print(f"Probabilities: {result['probabilities']}")
        print(f"Confidence: {result['confidence']:.3f}")
        print(f"Games used: {', '.join(result['subset'])}")
        print(f"Model accuracy: {result['model_accuracy']}")
        
        print("\n" + "=" * 50)
        
        # Test with subset 1 (only dance_doodle_game)
        print("Testing with subset 1 (dance_doodle_game only):")
        result = test_ali_model(1, example_game_data)
        
        print(f"Prediction: {result['prediction']}")
        print(f"Probabilities: {result['probabilities']}")
        print(f"Confidence: {result['confidence']:.3f}")
        print(f"Games used: {', '.join(result['subset'])}")
        print(f"Model accuracy: {result['model_accuracy']}")
        
    except Exception as e:
        print(f"Error: {e}")
