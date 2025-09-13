# llm_extructor.py
import requests
import re
import json
import time
from dotenv import load_dotenv
import os
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
print(GEMINI_API_KEY)

def send_to_gemini(text: str, retries: int = 1):
    """Send HTML to Gemini 2.0 Flash API for information extraction and return structured JSON."""

    gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"
    
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
            - The description field must capture any additional details, explanations, or contextual information found near that person.
            - Only return valid JSON. Do not include explanations, notes, or text outside of the JSON.
            - Always return a JSON array, even if only one person is found.

            Example output:
            [
            {{
                "name": "John Doe",
                "email": ["john@example.com", "john2@example.com"],
                "phone": ["+880 182232584", "01487258961"],
                "location": "New York, USA",
                "image": "https://example.com/john.jpg",
                "description": "This is description"
            }},
            {{
                "name": "Jane Smith",
                "email": ["jane@example.com"],
                "phone": [],
                "location": "London, UK",
                "image": "",
                "description": ""
            }},
            {{
                "name": "Akhash Dev",
                "email": [],
                "phone": ["+880 182232584", "01487258961"],
                "location": "New York, USA",
                "image": "https://example.com/john.jpg",
                "description": ""
            }}
            ]

            HTML:
            {text}
            """
    
    headers = {
        "Content-Type": "application/json"
    }
    
    payload = {
        "contents": [{
            "parts": [{
                "text": prompt
            }]
        }],
        "generationConfig": {
            "temperature": 0.1, 
            "maxOutputTokens": 2048,
            "responseMimeType": "application/json"  
        }
    }

    for attempt in range(retries):
        try:
            print("\n🔃 Gemini 2.0 Flash loading\n")
            start_time = time.time()

            response = requests.post(gemini_url, json=payload, headers=headers, timeout=180)
            response.raise_for_status()

            elapsed = time.time() - start_time
            print(f"\n⚡ Gemini 2.0 Flash Loaded. Extraction took {elapsed:.2f} seconds\n")

            data = response.json()
            
            # Extract the response text from Gemini's response structure
            if 'candidates' in data and data['candidates']:
                raw_text = data['candidates'][0]['content']['parts'][0]['text'].strip()
            else:
                raw_text = data.get('promptFeedback', {}).get('blockReasonMessage', 'No response generated')
            
            print("Raw Gemini response:", raw_text)  # Debug raw response

            # --- First: try direct JSON parsing ---
            try:
                parsed = json.loads(raw_text)
                return {"data": parsed, "raw": raw_text}
            except json.JSONDecodeError as e:
                print(f"JSON parse error: {e}")
                pass  # fallback to regex

            # --- Second: regex fallback ---
            # Look for JSON array pattern
            json_match = re.search(r'\[\s*\{.*\}\s*\]', raw_text, re.DOTALL)
            if json_match:
                try:
                    parsed = json.loads(json_match.group())
                    return {"data": parsed, "raw": raw_text}
                except json.JSONDecodeError as e:
                    print(f"Regex JSON parse error: {e}")
            
            # --- Third: try to find any JSON object/array ---
            matches = re.findall(r'(\[.*\]|\{.*\})', raw_text, re.DOTALL)
            for match in matches:
                try:
                    parsed = json.loads(match)
                    if isinstance(parsed, (list, dict)):
                        return {"data": parsed if isinstance(parsed, list) else [parsed], "raw": raw_text}
                except json.JSONDecodeError:
                    continue

            # --- Last resort ---
            print("Could not extract valid JSON from response")
            return {"data": [], "raw": raw_text}

        except requests.exceptions.RequestException as e:
            print(f"Gemini API error (attempt {attempt+1}): {e}")
            if attempt < retries - 1:
                time.sleep(2)  # Wait a bit longer between retries
                continue
            return {"data": [], "raw": f"API Error: {str(e)}"}
        except Exception as e:
            print(f"Unexpected error (attempt {attempt+1}): {e}")
            if attempt < retries - 1:
                time.sleep(1)
                continue
            return {"data": [], "raw": f"Error: {str(e)}"}

