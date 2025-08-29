import tweepy
import pandas as pd
from transformers import pipeline
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import time

# --- 1. SET UP TWITTER API CLIENT ---
bearer_token = "AAAAAAAAAAAAAAAAAAAAAF%2F%2B3gEAAAAAqPCr8aOQEIonv%2FsJykwFhZAQ7cE%3DrxBNt9XvkwbS9S9kJDuUtdHMZxBMygmqUwYGjYdr3nV7o6g5VR"
client = tweepy.Client(bearer_token=bearer_token, wait_on_rate_limit=True)

# --- 2. DEFINE HASHTAG AND QUERY ---
HASHTAG = input("Enter hashtag: ")
query = f"({HASHTAG}) -is:retweet -is:reply -is:quote lang:en"
tweet_fields = ["created_at"]

# --- 3. FETCH RECENT TWEETS ---
print("Fetching recent tweets...")
try:
    resp = client.search_recent_tweets(
        query=query,
        sort_order='relevancy',
        max_results=50,
        tweet_fields=tweet_fields
    )
    if not resp.data:
        print("No tweets found for the given hashtag.")
        exit()
except Exception as e:
    print(f"Error fetching tweets: {e}")
    exit()

# Add a manual delay as a precaution against rapid requests
print("Waiting for 5 seconds...")
time.sleep(5)

# --- 4. SET UP SENTIMENT ANALYSIS MODEL ---
print("Loading sentiment analysis model...")
try:
    sentiment_pipeline = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")
except Exception as e:
    print(f"Error loading sentiment model: {e}")
    exit()

# --- 5. PROCESS TWEETS AND PERFORM SENTIMENT ANALYSIS ---
print("Analyzing sentiment of tweets...")
rows = []
for tweet in resp.data:
    created_at = getattr(tweet, "created_at")
    result = sentiment_pipeline(tweet.text)[0]

    if result['label'] == 'POSITIVE':
        sentiment = 'Positive'
    elif result['label'] == 'NEGATIVE':
        sentiment = 'Negative'
    else:
        sentiment = 'Neutral'

    row_dict = {
        'timestamp': created_at,
        'text': tweet.text,
        'sentiment': sentiment,
        'score': result['score']
    }
    rows.append(row_dict)

# --- 6. CREATE A PANDAS DATAFRAME ---
df = pd.DataFrame(rows)

# --- 7. VISUALIZE THE OUTPUT ---
print("Generating visualizations...")

# Get sentiment counts for the bar and pie charts
sentiment_counts = df['sentiment'].value_counts().reindex(['Positive', 'Negative', 'Neutral'], fill_value=0)

# Create subplots with explicit types for each chart
# The 'specs' argument is key to fixing the ValueError.
fig = make_subplots(
    rows=1, cols=2,
    subplot_titles=("Sentiment Distribution (Bar Chart)", "Sentiment Distribution (Pie Chart)"),
    specs=[[{"type": "xy"}, {"type": "domain"}]]
)

# Create the bar chart trace and add it to the first subplot
bar_trace = go.Bar(
    x=sentiment_counts.index,
    y=sentiment_counts.values,
    marker_color=['green', 'red', 'gray'],
    name="Sentiment Counts"
)
fig.add_trace(bar_trace, row=1, col=1)

# Create the pie chart trace and add it to the second subplot
pie_trace = go.Pie(
    labels=sentiment_counts.index,
    values=sentiment_counts.values,
    marker_colors=['lightgreen', 'tomato', 'lightgray'],
    name="Sentiment Percentage",
    pull=[0.05, 0.05, 0]
)
fig.add_trace(pie_trace, row=1, col=2)

# Update layout for a cleaner look
fig.update_layout(
    title_text=f"Interactive Sentiment Analysis for \"{HASHTAG}\"",
    title_font_size=20,
    showlegend=False
)

# Save the interactive dashboard to an HTML file
fig.write_html("sentiment_dashboard.html")

print("\n--- Visualizations Generated ---")
print("Interactive dashboard saved to 'sentiment_dashboard.html'. Open this file in your browser to view.")

# --- 8. DISPLAY THE RAW DATAFRAME (OPTIONAL) ---
print("\n--- Raw Tweet Data ---")
print(df.head())