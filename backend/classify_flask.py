from flask import Flask, jsonify, request
import random

app = Flask(__name__)

@app.route('/upload', methods=['POST'])
def upload():
    # Check if a file is included in the request
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']

    # Check if a file was actually uploaded
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    # You can process the file here, but for now, we simulate the prediction
    prediction = random.choice(["Happy", "Tired"])

    # Return the prediction as a JSON response
    return jsonify({"prediction": prediction})


if __name__ == '__main__':
    app.run(port=5000)
