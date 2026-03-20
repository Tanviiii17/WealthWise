import os
import requests
from langchain_community.chat_message_histories import ChatMessageHistory
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

# ── Models to try in order ────────────────────────────────────────
MODELS = [
    "nvidia/nemotron-3-nano-30b-a3b:free",      # ← WORKING ✅ put first
    "qwen/qwen3-next-80b-a3b-instruct:free",    # ← backup
    "arcee-ai/trinity-mini:free",               # ← backup
    "liquid/lfm-2.5-1.2b-instruct:free",        # ← backup
    "nvidia/nemotron-nano-12b-v2-vl:free",      # ← backup
]

# ── SHORT system prompt — small models need short prompts ─────────
SYSTEM_PROMPT = "You are a helpful AI financial advisor for Indian markets. Give clear, practical advice about stocks, SIP, mutual funds, NIFTY, SENSEX, and personal finance."

demo_ephemeral_chat_history = ChatMessageHistory()


def ask_question(question: str) -> str:
    """Called by app.py via /agent route."""
    print(f"[agent] Question: {question}")

    # Keep messages minimal — just system + current question
    # Small free models fail with long conversation history
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user",   "content": question},
    ]

    for model in MODELS:
        try:
            print(f"[agent] Trying model: {model}")
            response = requests.post(
                url="https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "http://localhost:5000",
                    "X-Title": "WealthWise",
                },
                json={
                    "model": model,
                    "messages": messages,
                    "temperature": 0.5,
                    "max_tokens": 512,
                },
                timeout=20,
            )

            print(f"[agent] HTTP {response.status_code}")
            data = response.json()

            if "error" in data:
                code = data["error"].get("code", "")
                msg  = data["error"].get("message", "")
                print(f"[agent] Error from {model}: {code} - {msg}")
                continue  # try next model

            ans = data["choices"][0]["message"]["content"].strip()
            if ans:
                print(f"[agent] Success with {model}: {ans[:80]}...")
                # Save to history
                demo_ephemeral_chat_history.add_user_message(question)
                demo_ephemeral_chat_history.add_ai_message(ans)
                return ans

        except requests.exceptions.Timeout:
            print(f"[agent] Timeout on {model}")
            continue
        except Exception as e:
            print(f"[agent] Exception on {model}: {e}")
            continue

    return "I'm sorry, all AI models are currently busy. Please try again in a moment."


def clear_history():
    global demo_ephemeral_chat_history
    demo_ephemeral_chat_history = ChatMessageHistory()


if __name__ == "__main__":
    print("Testing agent...\n")
    ans = ask_question("What is SIP?")
    print(f"\nFinal answer: {ans}")