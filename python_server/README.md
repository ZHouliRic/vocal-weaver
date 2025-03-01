
# Python Text-to-Speech Server

This is a simple Flask server that generates audio from text using the Google Text-to-Speech (gTTS) library.

## Setup

1. Make sure you have Python 3.7+ installed
2. Install the required packages:
   ```
   pip install -r requirements.txt
   ```

## Running the Server

Run the following command in this directory:
```
python app.py
```

The server will start on http://localhost:5000

## API Endpoints

### POST /generate-audio
Generates audio from text and returns a base64-encoded audio file.

**Request Body:**
```json
{
  "text": "Text to convert to speech",
  "voiceId": "v1",
  "options": {
    "speechRate": 1.0,
    "pitch": 1.0,
    "language": "en"
  }
}
```

**Response:**
```json
{
  "audioUrl": "data:audio/mpeg;base64,..."
}
```

## Customization

You can modify `app.py` to use different TTS libraries or services:

- For higher quality voices, consider using:
  - ElevenLabs API (https://elevenlabs.io/)
  - Amazon Polly (via boto3)
  - Microsoft Azure TTS
  - OpenAI Text-to-Speech

Simply install the appropriate libraries and update the `generate_audio` function.
