from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np
import os

app = Flask(__name__)
CORS(app)

# Load the trained models
CHEM_MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'src', 'components', 'chem1.pkl')
BIO_MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'src', 'components', 'biology_knowledge_base.pkl')

models = {
    'chemistry': None,
    'biology': None
}

try:
    with open(CHEM_MODEL_PATH, 'rb') as f:
        models['chemistry'] = pickle.load(f)
    print("Chemistry model loaded successfully!")
except Exception as e:
    print(f"Error loading chemistry model from {CHEM_MODEL_PATH}: {e}")

try:
    with open(BIO_MODEL_PATH, 'rb') as f:
        models['biology'] = pickle.load(f)
    print("Biology model loaded successfully!")
except Exception as e:
    print(f"Error loading biology model from {BIO_MODEL_PATH}: {e}")

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_message = data.get('message', '')
        subject = data.get('subject', 'chemistry')  # Default to chemistry if not specified
        
        if not user_message:
            return jsonify({'error': 'No message provided'}), 400
            
        if subject not in models or models[subject] is None:
            return jsonify({'error': f'{subject.capitalize()} model not loaded'}), 500
            
        # Process the message and get prediction
        try:
            model = models[subject]
            prediction = model.predict([user_message])[0]
            confidence = float(model.predict_proba([user_message]).max())
        except Exception as e:
            print(f"Error making prediction for {subject}: {e}")
            return jsonify({'error': f'Error processing your {subject} question'}), 500
        
        return jsonify({
            'response': prediction,
            'confidence': confidence,
            'subject': subject
        })
        
    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000) 