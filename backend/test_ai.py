import os
import requests
from dotenv import load_dotenv

load_dotenv()

key = os.getenv("OPENROUTER_API_KEY")
print(f"Key: {key[:30]}...")

# Test with your exact available models
models = [
    "liquid/lfm-2.5-1.2b-instruct:free",
    "arcee-ai/trinity-mini:free",
    "nvidia/nemotron-nano-12b-v2-vl:free",
    "nvidia/nemotron-3-nano-30b-a3b:free",
    "qwen/qwen3-next-80b-a3b-instruct:free",
]

for model in models:
    print(f"\nTrying: {model}")
    try:
        r = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:5000",
                "X-Title": "WealthWise",
            },
            json={
                "model": model,
                "messages": [
                    {"role": "user", "content": "Say hello in one sentence."}
                ],
                "max_tokens": 50,
            },
            timeout=15,
        )
        data = r.json()
        if "error" in data:
            print(f"  ERROR: {data['error']}")
        else:
            print(f"  SUCCESS: {data['choices'][0]['message']['content']}")
            break
    except Exception as e:
        print(f"  EXCEPTION: {e}")