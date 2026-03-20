import os
import requests
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

FREE_MODELS = [
    "meta-llama/llama-3.2-3b-instruct:free",
    "google/gemma-3-1b-it:free",
    "qwen/qwen-2.5-7b-instruct:free",
    "microsoft/phi-3-mini-128k-instruct:free",
]

SYSTEM_PROMPT = """You are a knowledgeable personal financial advisor dedicated 
to helping individuals navigate their financial journey, with special focus on 
Indian markets (NIFTY, SENSEX, NSE, BSE).

Key areas of expertise:
- Budgeting and expense tracking
- Investment strategies and portfolio management (Stocks, Mutual Funds, SIP)
- Retirement planning (NPS, PPF, EPF)
- Debt management and elimination
- Tax planning (Section 80C, LTCG, STCG)
- Emergency fund planning
- Risk management and insurance
- NIFTY/SENSEX analysis and Indian market trends

If the user provides research data, use it to give a more accurate response.
Provide balanced, ethical financial advice. Be precise and practical."""


def jgaad_chat_with_gemini(query: str, research: str = '') -> str:
    """
    Main function called by app.py.
    Name kept same so app.py doesn't need any changes.
    """
    # Include research context if provided
    if research and research.strip():
        user_message = (
            f"Research Data:\n{research}\n\n"
            f"Based on the above research, answer this query:\n{query}"
        )
    else:
        user_message = query

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user",   "content": user_message},
    ]

    for model in FREE_MODELS:
        try:
            response = requests.post(
                url="https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "http://localhost:5000",
                    "X-Title": "WealthWise AI Advisor",
                },
                json={
                    "model": model,
                    "messages": messages,
                    "temperature": 0.7,
                    "max_tokens": 2048,
                },
                timeout=30,
            )
            data = response.json()
            if "error" in data:
                print(f"Model {model} failed: {data['error'].get('message','')}")
                continue
            content = data["choices"][0]["message"]["content"].strip()
            if content:
                print(f"Success with model: {model}")
                return content
        except Exception as e:
            print(f"Model {model} exception: {e}")
            continue

    return "I'm sorry, I couldn't process your request right now. Please try again."


if __name__ == "__main__":
    print("Testing jgaad_ai_agent_backup\n")

    # Test 1
    r1 = jgaad_chat_with_gemini("Should I invest in IT companies in India right now?")
    print(f"Response 1:\n{r1}\n")

    # Test 2 with research
    r2 = jgaad_chat_with_gemini(
        "Is TCS a good buy?",
        "TCS Q3 results: Revenue up 4.5% YoY. Net profit Rs 12,380 Cr. Strong deal wins."
    )
    print(f"Response 2:\n{r2}\n")
