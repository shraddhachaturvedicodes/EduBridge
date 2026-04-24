#!/usr/bin/env python3
"""
Sentiment Analysis using VADER
Takes feedback text as command line argument
Returns JSON with sentiment classification
"""

import sys
import json

try:
    from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
except ImportError:
    # If VADER not installed, return neutral with error
    print(json.dumps({
        "sentiment": "Neutral",
        "error": "VADER not installed. Run: pip install vaderSentiment"
    }))
    sys.exit(0)

def analyze_sentiment(text):
    """
    Analyze sentiment of text using VADER
    Returns: Positive, Negative, or Neutral
    """
    # Create analyzer instance
    analyzer = SentimentIntensityAnalyzer()
    
    # Get sentiment scores
    scores = analyzer.polarity_scores(text)
    
    # Extract compound score (-1 to 1)
    compound = scores['compound']
    
    # Classify sentiment based on compound score
    # Positive: >= 0.05
    # Negative: <= -0.05
    # Neutral: between -0.05 and 0.05
    if compound >= 0.05:
        sentiment = "Positive"
    elif compound <= -0.05:
        sentiment = "Negative"
    else:
        sentiment = "Neutral"
    
    # Return result
    return {
        "sentiment": sentiment,
        "scores": {
            "positive": scores['pos'],
            "negative": scores['neg'],
            "neutral": scores['neu'],
            "compound": compound
        },
        "compound": compound
    }

if __name__ == "__main__":
    # Check if text argument provided
    if len(sys.argv) < 2:
        print(json.dumps({
            "sentiment": "Neutral",
            "error": "No text provided"
        }))
        sys.exit(0)
    
    # Get text from command line argument
    text = sys.argv[1]
    
    # Analyze sentiment
    result = analyze_sentiment(text)
    
    # Print JSON result
    print(json.dumps(result))