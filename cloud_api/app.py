
from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import io
import os
from gtts import gTTS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/generate-audio', methods=['POST'])
def generate_audio():
    data = request.json
    
    text = data.get('text', '')
    voice_id = data.get('voiceId', '')
    options = data.get('options', {})
    
    # Get language from options or default to English
    language = options.get('language', 'en')
    
    # Create a buffer to store the audio
    audio_buffer = io.BytesIO()
    
    # Generate audio using gTTS
    tts = gTTS(text=text, lang=language, slow=False)
    tts.write_to_fp(audio_buffer)
    audio_buffer.seek(0)
    
    # Encode the audio file as base64
    audio_base64 = base64.b64encode(audio_buffer.read()).decode('utf-8')
    
    # Return the audio as a data URL
    return jsonify({
        'audioUrl': f'data:audio/mpeg;base64,{audio_base64}'
    })

# This is the main entry point for many cloud services
if __name__ == '__main__':
    # Get port from environment variable (for cloud deployment)
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)

# Customize this section with your own TTS logic
# You can replace gTTS with any other TTS library or service like:
# - ElevenLabs API
# - Amazon Polly
# - Google Text-to-Speech
# - Microsoft Azure TTS
# Example with ElevenLabs:
"""
import requests

def generate_with_elevenlabs(text, voice_id, options):
    ELEVEN_LABS_API_KEY = "your-api-key"  # Better to use environment variables
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
    
    headers = {
        "xi-api-key": ELEVEN_LABS_API_KEY,
        "Content-Type": "application/json"
    }
    
    data = {
        "text": text,
        "model_id": "eleven_monolingual_v1",
        "voice_settings": {
            "stability": options.get("stability", 0.5),
            "similarity_boost": options.get("similarityBoost", 0.75)
        }
    }
    
    response = requests.post(url, json=data, headers=headers)
    
    if response.status_code != 200:
        raise Exception(f"Failed to generate audio: {response.text}")
    
    audio_data = response.content
    audio_base64 = base64.b64encode(audio_data).decode("utf-8")
    
    return f"data:audio/mpeg;base64,{audio_base64}"
"""
