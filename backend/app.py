from flask import Flask, request, jsonify
from onboard import *
from flask_cors import CORS
from jgaad_ai_agent_backup import jgaad_chat_with_gemini
from agent import ask_question
import gemini_fin_path

app = Flask(__name__)
CORS(app)

@app.route('/', methods=['GET'])
def home():
    return jsonify("HI")

# =================== DYNAMIC APIS ===================
@app.route('/agent', methods=['POST'])
def agent():
    inp = request.form.get('input')
    if not inp:
        return jsonify({'error': 'no input'}), 400

    print(f"User asked: {inp}")

    try:
        # Directly call ask_question — no subprocess needed
        answer = ask_question(inp)
        print(f"AI answered: {answer[:100]}...")
        return jsonify({
            'output': answer,
            'thought': ''   # kept for frontend compatibility
        })
    except Exception as e:
        print(f"Error in /agent: {e}")
        # Fallback to jgaad
        try:
            answer = jgaad_chat_with_gemini(inp)
            return jsonify({'output': answer, 'thought': ''})
        except Exception as e2:
            print(f"Fallback also failed: {e2}")
            return jsonify({'output': 'Sorry, I could not process your request. Please try again.', 'thought': ''}), 500

@app.route('/ai-financial-path', methods=['POST'])
def ai_financial_path():
    if 'input' not in request.form:
        return jsonify({'error': 'No input provided'}), 400

    input_text = request.form.get('input', '')
    risk = request.form.get('risk', 'conservative')
    print(f"Financial path request: {input_text}, risk: {risk}")

    try:
        response = gemini_fin_path.get_gemini_response(input_text, risk)
        return jsonify(response)
    except Exception as e:
        print(f"Error in /ai-financial-path: {e}")
        return jsonify({'error': 'Something went wrong'}), 500

# =================== STATIC APIS ===================
@app.route('/auto-bank-data', methods=['GET'])
def AutoBankData():
    return bank_data

@app.route('/auto-mf-data', methods=['GET'])
def AutoMFData():
    return mf_data

if __name__ == "__main__":
    app.run(debug=True)