
# Cloud-Deployable Python Text-to-Speech API

This is a simple Flask API for generating audio from text that can be deployed to various cloud platforms.

## Deployment Options

### 1. Heroku

```
# Install Heroku CLI if not already installed
# Login to Heroku
heroku login

# Create a new Heroku app
heroku create your-tts-api-name

# Deploy to Heroku
git push heroku main

# Check if the app is running
heroku open
```

### 2. Google Cloud Run

```
# Build the container
gcloud builds submit --tag gcr.io/YOUR-PROJECT-ID/tts-api

# Deploy to Cloud Run
gcloud run deploy tts-api --image gcr.io/YOUR-PROJECT-ID/tts-api --platform managed
```

### 3. AWS Elastic Beanstalk

```
# Initialize Elastic Beanstalk
eb init -p python-3.8 tts-api

# Create an environment and deploy
eb create tts-api-env

# Deploy updates
eb deploy
```

## Customization

You can customize the `app.py` file to use different TTS services:

1. Open `app.py`
2. Look for the comment section about customization
3. Implement your preferred TTS service (ElevenLabs, Amazon Polly, etc.)

## After Deployment

Once deployed, update your React application with the new API URL:

1. Open `src/services/audioService.ts`
2. Change the `PYTHON_API_URL` variable to your deployed API URL
