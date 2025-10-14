import sys
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import json

# Initialize VADER sentiment analyzer
analyzer = SentimentIntensityAnalyzer()

def analyze_sentiment(text):
    """
    Analyzes the sentiment of the given text using VADER and returns a classification.
    """
    if not text:
        return "Neutral"

    # Get sentiment scores
    vs = analyzer.polarity_scores(text)
    
    # Determine classification based on Compound Score
    if vs['compound'] >= 0.05:
        return "Positive"
    elif vs['compound'] <= -0.05:
        return "Negative"
    else:
        return "Neutral"

if __name__ == '__main__':
    # Node.js passes the text as a command-line argument (sys.argv[1])
    if len(sys.argv) > 1:
        feedback_text = sys.argv[1]
        sentiment_result = analyze_sentiment(feedback_text)
        
        # Print the result as a JSON string so Node.js can easily parse it
        print(json.dumps({"sentiment": sentiment_result}))
    else:
        # If no argument is passed (for debugging)
        print(json.dumps({"sentiment": "Neutral", "error": "No text provided"}))