import os
import sys
import time
import requests
from pathlib import Path
from dotenv import load_dotenv

env_file = Path(__file__).resolve().parent / ".env"
load_dotenv(env_file, override=True)
key = os.environ.get("GEMINI_API_KEY", "").strip()

if not key:
    print("ERROR: GEMINI_API_KEY is missing or empty in backend/.env")
    sys.exit(1)

masked_key = key[:7] + "..." + key[-4:] if len(key) > 12 else "***"
print(f"Testing Gemini Key: {masked_key}")

model = os.environ.get("GEMINI_MODEL", "gemini-3.5-flash-lite").strip()
url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}"

payload = {
    "contents": [{"parts": [{"text": "Hello Gemini! Respond strictly with the exact phrase: GEMINI_API_ACTIVE_CONFIRMED"}]}]
}

start_time = time.time()
try:
    resp = requests.post(url, json=payload, timeout=12)
    latency = round((time.time() - start_time) * 1000)
    print(f"HTTP Status: {resp.status_code}")
    print(f"Latency: {latency} ms")
    
    if resp.status_code == 200:
        data = resp.json()
        reply = data["candidates"][0]["content"]["parts"][0]["text"].strip()
        print(f"Response: {reply}")
        print("STATUS: SUCCESS - API key is working and authorized!")
    else:
        print("STATUS: FAILED - Google API Error:")
        print(resp.text)
except Exception as e:
    print(f"STATUS: ERROR - Request failed: {e}")
