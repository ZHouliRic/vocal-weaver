
#!/bin/bash
# Make sure to run "chmod +x start_server.sh" to make this file executable

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Python 3 is not installed. Please install it first."
    exit 1
fi

# Check if pip is installed
if ! command -v pip &> /dev/null; then
    echo "pip is not installed. Please install it first."
    exit 1
fi

# Install requirements
echo "Installing requirements..."
pip install -r requirements.txt

# Start the server
echo "Starting the server..."
python3 app.py
