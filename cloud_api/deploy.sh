
#!/bin/bash

# Exit on any error
set -e

# Replace with your actual Google Cloud Project ID
PROJECT_ID="logical-cubist-381408"

echo "Starting deployment to Google Cloud Run for project: $PROJECT_ID"

# Build and push the container image to Google Container Registry
echo "Building and pushing container image..."
gcloud builds submit --tag gcr.io/$PROJECT_ID/tts-api

# Deploy the container to Cloud Run
echo "Deploying to Cloud Run..."
gcloud run deploy tts-api --image gcr.io/$PROJECT_ID/tts-api --platform managed --allow-unauthenticated --region us-central1

# Get the URL of the deployed service
SERVICE_URL=$(gcloud run services describe tts-api --platform managed --region us-central1 --format="value(status.url)")
echo "Deployment successful! Your service is available at: $SERVICE_URL"
echo "API endpoint: $SERVICE_URL/generate-audio"
echo ""
echo "IMPORTANT: Update PYTHON_API_URL in src/services/audioService.ts with:"
echo "$SERVICE_URL/generate-audio"
