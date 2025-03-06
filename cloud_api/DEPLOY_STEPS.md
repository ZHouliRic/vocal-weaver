
# Deploying the TTS API to Google Cloud Run

Follow these steps to deploy your Text-to-Speech API to Google Cloud Run:

## Prerequisites

1. Make sure you have git installed
2. Make sure you have gcloud CLI installed
3. Have a Google Cloud account with billing enabled

## Deployment Steps

1. Clone your repository (if you haven't already):
   ```bash
   git clone https://github.com/ZHouliRic/vocal-weaver.git
   cd vocal-weaver/cloud_api
   ```

2. Make the deployment script executable:
   ```bash
   chmod +x deploy.sh
   ```

3. Login to Google Cloud:
   ```bash
   gcloud auth login
   ```

4. Set your project:
   ```bash
   gcloud config set project logical-cubist-381408
   ```

5. Enable the required services (if not already enabled):
   ```bash
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable run.googleapis.com
   ```

6. Run the deployment script:
   ```bash
   ./deploy.sh
   ```

7. After successful deployment, the script will display a URL. Copy this URL.

8. Update the `PYTHON_API_URL` in `src/services/audioService.ts` with the new URL.

9. Commit and push your changes:
   ```bash
   git add src/services/audioService.ts
   git commit -m "Update API URL to Cloud Run deployment"
   git push
   ```

## Troubleshooting

If you encounter any errors:

1. Make sure you're logged in to gcloud: `gcloud auth login`
2. Ensure you have the correct permissions in your Google Cloud project
3. Check the Cloud Run and Cloud Build logs in the Google Cloud Console
