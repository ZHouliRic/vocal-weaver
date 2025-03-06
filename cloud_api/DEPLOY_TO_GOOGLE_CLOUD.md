
# Deploying to Google Cloud Run

This guide walks you through deploying the Text-to-Speech API to Google Cloud Run.

## Prerequisites

1. Google Cloud account
2. Google Cloud SDK installed locally
3. Access to a terminal/command line

## Deployment Steps

### 1. Install Google Cloud SDK (if not already installed)

Download and install from: https://cloud.google.com/sdk/docs/install

### 2. Login to Google Cloud

```bash
gcloud auth login
```

### 3. Set your project ID

```bash
gcloud config set project YOUR-PROJECT-ID
```

Replace `YOUR-PROJECT-ID` with your actual Google Cloud project ID.

### 4. Enable required APIs

```bash
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
```

### 5. Navigate to the cloud_api directory

```bash
cd cloud_api
```

### 6. Build and submit the container image

```bash
gcloud builds submit --tag gcr.io/YOUR-PROJECT-ID/tts-api
```

Replace `YOUR-PROJECT-ID` with your actual Google Cloud project ID.

### 7. Deploy to Cloud Run

```bash
gcloud run deploy tts-api --image gcr.io/YOUR-PROJECT-ID/tts-api --platform managed --allow-unauthenticated
```

Replace `YOUR-PROJECT-ID` with your actual Google Cloud project ID.

### 8. Update your application with the new API URL

After deployment, Google Cloud Run will provide you with a URL for your service. Update the `PYTHON_API_URL` in `src/services/audioService.ts` to point to this new URL:

```typescript
// Change this line
const PYTHON_API_URL = "http://localhost:5000/generate-audio";

// To your Cloud Run URL
const PYTHON_API_URL = "https://tts-api-xxxxxxxxxxxx-xx.a.run.app/generate-audio";
```

## Troubleshooting

If you see an error like "Image not found", make sure:
1. You've replaced `YOUR-PROJECT-ID` with your actual project ID
2. The build step completed successfully before attempting deployment
3. You have the necessary permissions on your Google Cloud account

For more help, see the [Google Cloud Run documentation](https://cloud.google.com/run/docs/quickstarts/build-and-deploy).
