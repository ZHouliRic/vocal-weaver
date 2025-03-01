
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

if __name__ == '__main__':
    app.run(debug=True)
