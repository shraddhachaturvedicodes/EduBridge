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
    print(json.dumps({"sentiment": "Neutral", "error": "VADER not installed"}))
    sys.exit(0)

def analyze_sentiment(text):
    """
    Analyze sentiment of text using VADER
    Returns: Positive, Negative, or Neutral
    """
    analyzer = SentimentIntensityAnalyzer()
    scores = analyzer.polarity_scores(text)
    
    # Get compound score (-1 to 1)
    compound = scores['compound']
    
    # Classify based on compound score
    if compound >= 0.05:
        sentiment = "Positive"
    elif compound <= -0.05:
        sentiment = "Negative"
    else:
        sentiment = "Neutral"
    
    return {
        "sentiment": sentiment,
        "scores": scores,
        "compound": compound
    }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"sentiment": "Neutral", "error": "No text provided"}))
        sys.exit(0)
    
    text = sys.argv[1]
    result = analyze_sentiment(text)
    print(json.dumps(result))