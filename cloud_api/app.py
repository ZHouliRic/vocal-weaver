
from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import io
import os
from gtts import gTTS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/', methods=['GET'])
def home():
    return """
    <html>
    <head>
        <title>Text-to-Speech API</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
            h1 { color: #333; }
            code { background: #f4f4f4; padding: 2px 5px; border-radius: 3px; }
            pre { background: #f4f4f4; padding: 10px; border-radius: 5px; overflow-x: auto; }
        </style>
    </head>
    <body>
        <h1>Text-to-Speech API</h1>
        <p>This is a simple API for converting text to speech.</p>
        
        <h2>API Usage:</h2>
        <p>To use this API, send a POST request to <code>/generate-audio</code> with the following JSON payload:</p>
        <pre>
{
  "text": "Your text to convert to speech",
  "voiceId": "v1",
  "options": {
    "language": "en",
    "speechRate": 1.0,
    "pitch": 1.0
  }
}
        </pre>
        
        <h2>Test Form:</h2>
        <form action="/generate-audio" method="post" id="ttsForm">
            <div>
                <label for="text">Text to convert:</label><br>
                <textarea id="text" name="text" rows="4" cols="50" required>Hello, this is a test of the text-to-speech API.</textarea>
            </div>
            <div style="margin-top: 10px;">
                <label for="language">Language:</label>
                <select id="language" name="language">
                    <option value="en">English</option>
                    <option value="fr">French</option>
                    <option value="es">Spanish</option>
                    <option value="de">German</option>
                    <option value="it">Italian</option>
                </select>
            </div>
            <div style="margin-top: 20px;">
                <button type="submit">Generate Audio</button>
            </div>
        </form>
        
        <script>
            document.getElementById('ttsForm').onsubmit = function(e) {
                e.preventDefault();
                const text = document.getElementById('text').value;
                const language = document.getElementById('language').value;
                
                fetch('/generate-audio', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        text: text,
                        voiceId: 'v1',
                        options: {
                            language: language,
                            speechRate: 1.0,
                            pitch: 1.0
                        }
                    }),
                })
                .then(response => response.json())
                .then(data => {
                    // Create audio element and play
                    const audio = new Audio(data.audioUrl);
                    audio.play();
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Error generating audio. Please try again.');
                });
            };
        </script>
    </body>
    </html>
    """

@app.route('/generate-audio', methods=['POST'])
def generate_audio():
    try:
        data = request.json
        
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
            
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
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/generate-audio', methods=['GET'])
def generate_audio_get():
    return """
    <html>
    <head>
        <title>Method Not Allowed</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
            h1 { color: #d9534f; }
            .container { background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 5px; }
            code { background: #f4f4f4; padding: 2px 5px; border-radius: 3px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Method Not Allowed</h1>
            <p>The generate-audio endpoint requires a POST request with JSON data.</p>
            <p>Please visit the <a href="/">homepage</a> for information on how to use this API.</p>
        </div>
    </body>
    </html>
    """

# This is the main entry point for many cloud services
if __name__ == '__main__':
    # Get port from environment variable (for cloud deployment)
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port)
