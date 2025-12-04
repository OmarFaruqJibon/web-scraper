# llm_extractor_deepseek_safe.py
import requests
import re
import json
import time
from dotenv import load_dotenv
import os

load_dotenv()

DEESEEK_API_KEY = os.getenv("DEESEEK_API_KEY")
print("DeepSeek API Key loaded:", bool(DEESEEK_API_KEY))

DEESEEK_URL = "https://openrouter.ai/api/v1"

def send_to_deepseek(text: str, retries: int = 2):
    
    MAX_CHARS = 2000  # adjust based on token estimate
    text = text[:MAX_CHARS]

    prompt = f"""
            You are an information extraction system.

            The input is cleaned HTML text where <img> tags are kept.

            Your task:
            - Extract a list of people mentioned in the text.
            - For each person, include these fields:
                - name (string)
                - email (array of strings, [] if none found)
                - phone (array of strings, [] if none found)
                - location (string, "" if none found)
                - image (URL from <img> tag if related to that person)
                - description (Extract all useful information from the given text)

            Rules:
            - If a field is missing, use an empty string "" (do not skip it).
            - Only return valid JSON. Do not include explanations, notes, or text outside of the JSON.
            - Always return a JSON array, even if only one person is found.

            HTML:
            {text}
            """

    headers = {
        "Authorization": f"Bearer {DEESEEK_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "deepseek-r1",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.1,
        "max_tokens": 2048
    }

    for attempt in range(retries):
        try:
            print(f"\n🔃 DeepSeek R1 loading (attempt {attempt+1})\n")
            start_time = time.time()

            response = requests.post(DEESEEK_URL, headers=headers, json=payload, timeout=180)

            # Debug HTTP status and raw response
            print("HTTP Status:", response.status_code)
            print("Raw response text (first 500 chars):", response.text[:500])

            response.raise_for_status()
            elapsed = time.time() - start_time
            print(f"\n⚡ DeepSeek R1 Loaded in {elapsed:.2f} seconds\n")

            data = response.json()

            # Check if choices exist and contain content
            if "choices" not in data or not data["choices"]:
                print("Empty 'choices' in API response")
                raw_text = ""
            else:
                raw_text = data["choices"][0]["message"].get("content", "").strip()

            if not raw_text:
                print("Empty response text from DeepSeek R1")
                return {"data": [], "raw": ""}

            # --- JSON parsing attempts ---
            try:
                parsed = json.loads(raw_text)
                return {"data": parsed, "raw": raw_text}
            except json.JSONDecodeError:
                pass

            json_match = re.search(r'\[\s*\{.*\}\s*\]', raw_text, re.DOTALL)
            if json_match:
                try:
                    parsed = json.loads(json_match.group())
                    return {"data": parsed, "raw": raw_text}
                except json.JSONDecodeError:
                    pass

            matches = re.findall(r'(\[.*\]|\{.*\})', raw_text, re.DOTALL)
            for match in matches:
                try:
                    parsed = json.loads(match)
                    if isinstance(parsed, (list, dict)):
                        return {"data": parsed if isinstance(parsed, list) else [parsed], "raw": raw_text}
                except json.JSONDecodeError:
                    continue

            print("Could not extract valid JSON from response")
            return {"data": [], "raw": raw_text}

        except requests.exceptions.RequestException as e:
            print(f"DeepSeek API error (attempt {attempt+1}): {e}")
            if attempt < retries - 1:
                time.sleep(2)
                continue
            return {"data": [], "raw": f"API Error: {str(e)}"}

        except Exception as e:
            print(f"Unexpected error (attempt {attempt+1}): {e}")
            if attempt < retries - 1:
                time.sleep(1)
                continue
            return {"data": [], "raw": f"Error: {str(e)}"}


