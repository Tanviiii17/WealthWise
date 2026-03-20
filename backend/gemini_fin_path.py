import os
import re
import json
import requests
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
MODEL = "mistralai/mistral-7b-instruct:free"

# ── System prompt — same as original, kept exactly ────────────────
SYSTEM_PROMPT = """You are a personal financial advisor dedicated to helping in financial journey. 
Focus on providing guidance on budgeting, investing, retirement planning, debt management, 
and wealth building strategies. Be precise and practical in your advice while considering 
individual circumstances.

Key areas of expertise:
- Budgeting and expense tracking
- Investment strategies and portfolio management
- Retirement planning
- Debt management and elimination
- Tax planning considerations
- Emergency fund planning
- Risk management and insurance

Provide balanced, ethical financial advice and acknowledge when certain situations may 
require consultation with other financial professionals.

You can increase the number of nodes and edges in the response if needed.

For the given user query you have to respond with a proper output in the following JSON format.
Strictly follow the given format only. Return ONLY the JSON, no extra text, no markdown, no explanation.

{
  "nodes": [
    {
      "id": "start",
      "position": { "x": 250, "y": 50 },
      "data": { "label": "Investment\\n₹1,00,000" },
      "style": {
        "background": "bg-blue-100",
        "border": "border-blue-500"
      }
    },
    {
      "id": "index",
      "position": { "x": 50, "y": 200 },
      "data": { "label": "Index Funds\\n₹40,000" },
      "style": {
        "background": "bg-indigo-100",
        "border": "border-indigo-500"
      }
    },
    {
      "id": "midcap",
      "position": { "x": 250, "y": 200 },
      "data": { "label": "Mid-Cap Stocks\\n₹35,000" },
      "style": {
        "background": "bg-orange-100",
        "border": "border-orange-500"
      }
    },
    {
      "id": "gold",
      "position": { "x": 450, "y": 200 },
      "data": { "label": "Gold Investment\\n₹25,000" },
      "style": {
        "background": "bg-yellow-100",
        "border": "border-yellow-500"
      }
    }
  ],
  "edges": [
    {
      "id": "e-index",
      "source": "start",
      "target": "index",
      "label": "40%",
      "style": { "stroke": "stroke-indigo-500" }
    },
    {
      "id": "e-midcap",
      "source": "start",
      "target": "midcap",
      "label": "35%",
      "style": { "stroke": "stroke-orange-500" }
    },
    {
      "id": "e-gold",
      "source": "start",
      "target": "gold",
      "label": "25%",
      "style": { "stroke": "stroke-yellow-500" }
    }
  ]
}"""

# ── Fallback response if AI fails ─────────────────────────────────
FALLBACK_RESPONSE = {
    "nodes": [
        {
            "id": "start",
            "position": {"x": 250, "y": 50},
            "data": {"label": "Your Investment\nPortfolio"},
            "style": {"background": "bg-blue-100", "border": "border-blue-500"}
        },
        {
            "id": "equity",
            "position": {"x": 50, "y": 200},
            "data": {"label": "Equity Funds\n40%"},
            "style": {"background": "bg-indigo-100", "border": "border-indigo-500"}
        },
        {
            "id": "debt",
            "position": {"x": 250, "y": 200},
            "data": {"label": "Debt Funds\n35%"},
            "style": {"background": "bg-green-100", "border": "border-green-500"}
        },
        {
            "id": "gold",
            "position": {"x": 450, "y": 200},
            "data": {"label": "Gold / REITs\n25%"},
            "style": {"background": "bg-yellow-100", "border": "border-yellow-500"}
        }
    ],
    "edges": [
        {
            "id": "e-equity",
            "source": "start",
            "target": "equity",
            "label": "40%",
            "style": {"stroke": "stroke-indigo-500"}
        },
        {
            "id": "e-debt",
            "source": "start",
            "target": "debt",
            "label": "35%",
            "style": {"stroke": "stroke-green-500"}
        },
        {
            "id": "e-gold",
            "source": "start",
            "target": "gold",
            "label": "25%",
            "style": {"stroke": "stroke-yellow-500"}
        }
    ]
}


def get_gemini_response(user_input: str, risk: str = 'moderate') -> dict:
    """
    Generate a financial path flow chart using Mistral via OpenRouter.
    Function name kept same as original so app.py still works.
    Returns a dict with nodes and edges for the React Flow component.
    """

    user_message = f"{user_input}\nMy risk profile is: {risk}\n\nReturn ONLY the JSON object, no markdown, no extra text."

    try:
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:5000",
                "X-Title": "WealthWise Financial Path",
            },
            json={
                "model": MODEL,
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user",   "content": user_message},
                ],
                "temperature": 0.7,
                "max_tokens": 2048,
            },
            timeout=30,
        )

        data = response.json()

        # Handle API errors
        if "error" in data:
            print(f"OpenRouter API Error: {data['error'].get('message', 'Unknown')}")
            return FALLBACK_RESPONSE

        raw_text = data["choices"][0]["message"]["content"].strip()
        print("Raw AI response:", raw_text[:200])

        # ── Try to extract JSON from response ─────────────────────

        # Method 1: Extract from ```json ... ``` block
        json_match = re.search(r'```json\s*(.*?)\s*```', raw_text, re.DOTALL)
        if json_match:
            try:
                return json.loads(json_match.group(1))
            except json.JSONDecodeError:
                pass

        # Method 2: Extract from ``` ... ``` block (no language tag)
        code_match = re.search(r'```\s*(.*?)\s*```', raw_text, re.DOTALL)
        if code_match:
            try:
                return json.loads(code_match.group(1))
            except json.JSONDecodeError:
                pass

        # Method 3: Find { ... } directly in response
        brace_match = re.search(r'\{.*\}', raw_text, re.DOTALL)
        if brace_match:
            try:
                return json.loads(brace_match.group(0))
            except json.JSONDecodeError:
                pass

        # Method 4: Try parsing entire response as JSON
        try:
            return json.loads(raw_text)
        except json.JSONDecodeError:
            pass

        # All methods failed — return fallback
        print("Could not parse JSON from AI response, using fallback")
        return FALLBACK_RESPONSE

    except requests.exceptions.Timeout:
        print("Request timed out, using fallback response")
        return FALLBACK_RESPONSE
    except requests.exceptions.ConnectionError:
        print("Connection error, using fallback response")
        return FALLBACK_RESPONSE
    except Exception as e:
        print(f"Error in get_gemini_response: {e}")
        return FALLBACK_RESPONSE


# ── Run directly for testing ──────────────────────────────────────
if __name__ == "__main__":
    test_query = "I have around ten lakh rupees where should I invest them"
    print("Test Query:", test_query)
    response = get_gemini_response(test_query, risk="moderate")
    print("Response:", json.dumps(response, indent=2))
