
#!/bin/bash

# Exit on any error
set -e

# Your Google Cloud Project ID - you'll need to replace this with your actual project ID
PROJECT_ID="your-project-id"

echo "Starting deployment to Google Cloud Run for project: $PROJECT_ID"

# Build and push the container image to Google Artifact Registry (preferred over Container Registry)
echo "Building and pushing container image..."
gcloud builds submit --tag gcr.io/$PROJECT_ID/tts-api

# Deploy the container to Cloud Run
echo "Deploying to Cloud Run..."
gcloud run deploy tts-api \
  --image gcr.io/$PROJECT_ID/tts-api \
  --platform managed \
  --allow-unauthenticated \
  --region us-central1 \
  --memory 256Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 3

# Get the URL of the deployed service
SERVICE_URL=$(gcloud run services describe tts-api --platform managed --region us-central1 --format="value(status.url)")
echo "Deployment successful! Your service is available at: $SERVICE_URL"
echo "API endpoint: $SERVICE_URL/generate-audio"
echo ""
echo "IMPORTANT: Update PYTHON_API_URL in src/services/audioService.ts with:"
echo "$SERVICE_URL"

