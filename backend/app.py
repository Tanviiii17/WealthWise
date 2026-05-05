from flask import Flask, request, jsonify
from onboard import *
from flask_cors import CORS
from jgaad_ai_agent_backup import jgaad_chat_with_gemini
from agent import ask_question
import gemini_fin_path
import requests as req

app = Flask(__name__)
CORS(app)

@app.route('/', methods=['GET'])
def home():
    return jsonify("HI")

# =================== STOCK PROXY ===================
@app.route('/stock', methods=['GET'])
def get_stock():
    """
    Proxy for Yahoo Finance API — solves CORS issue in browser.
    Frontend calls this instead of Yahoo Finance directly.
    """
    symbol   = request.args.get('symbol', '')
    interval = request.args.get('interval', '1d')
    range_   = request.args.get('range', '3mo')

    if not symbol:
        return jsonify({'error': 'symbol is required'}), 400

    try:
        url = (
            f"https://query1.finance.yahoo.com/v8/finance/chart/"
            f"{symbol}?interval={interval}&range={range_}&includePrePost=false"
        )
        r = req.get(url, timeout=10, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        return jsonify(r.json())
    except Exception as e:
        # Try backup Yahoo URL
        try:
            url2 = (
                f"https://query2.finance.yahoo.com/v8/finance/chart/"
                f"{symbol}?interval={interval}&range={range_}&includePrePost=false"
            )
            r2 = req.get(url2, timeout=10, headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            })
            return jsonify(r2.json())
        except Exception as e2:
            return jsonify({'error': str(e2)}), 500

# =================== DYNAMIC APIS ===================
@app.route('/agent', methods=['POST'])
def agent():
    inp = request.form.get('input')
    if not inp:
        return jsonify({'error': 'no input'}), 400

    print(f"User asked: {inp}")

    try:
        answer = ask_question(inp)
        print(f"AI answered: {answer[:100]}...")
        return jsonify({
            'output': answer,
            'thought': ''
        })
    except Exception as e:
        print(f"Error in /agent: {e}")
        try:
            answer = jgaad_chat_with_gemini(inp)
            return jsonify({'output': answer, 'thought': ''})
        except Exception as e2:
            print(f"Fallback also failed: {e2}")
            return jsonify({
                'output': 'Sorry, I could not process your request. Please try again.',
                'thought': ''
            }), 500

@app.route('/ai-financial-path', methods=['POST'])
def ai_financial_path():
    if 'input' not in request.form:
        return jsonify({'error': 'No input provided'}), 400

    input_text = request.form.get('input', '')
    risk = request.form.get('risk', 'conservative')
    print(f"Financial path: {input_text}, risk: {risk}")

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