import requests
import re
import json
import time


def send_to_ollama(text: str, retries: int = 1):
    """Send HTML to Ollama for information extraction and return structured JSON."""

    ollama_url = "http://localhost:11434/api/generate"
    
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
            - description (a well-written summary about the person that combines all available details: roles, contact information, achievements, affiliations, titles, expertise, education, publications, responsibilities, or any other personal/professional context found in the text. If only limited info is available, still write a complete sentence describing them with what is known)

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
                "email": []
                "phone": ["+880 182232584", "01487258961"]
                "location": "New York, USA",
                "image": "https://example.com/john.jpg",
                "description": ""
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
                "name": "Alex",
                "email": [],
                "phone": ["+8801742-189270"],
                "location": "",
                "image": "",
                "description": ""
            }}
            ]       
            
        HTML:
        {text}
    """
    
    # prompt = f"HTML:\n{text}"

    payload = {
        "model": "llama3:8b",
        # "model": "deepseek-r1:8b",
        # "model": "llama3.2:3b",
        # "model": "crawler:latest",
        # "model": "crawler_2:latest",
        "prompt": prompt,
        "stream": False
    }

    for attempt in range(retries):
        try:
            print("\n🔃 Ollama loading\n")
            start_time = time.time()

            response = requests.post(ollama_url, json=payload, timeout=1800)
            response.raise_for_status()

            elapsed = time.time() - start_time
            print(f"\n⚡ Ollama Loaded. Extraction took {elapsed:.2f} seconds\n")

            data = response.json()
            raw_text = data.get("response", "").strip()
            print(raw_text)  # Debug raw response

            # --- First: try direct JSON parsing ---
            try:
                parsed = json.loads(raw_text)
                return {"data": parsed, "raw": raw_text}
            except json.JSONDecodeError:
                pass  # fallback to regex

            # --- Second: regex fallback ---
            matches = re.findall(r"\[.*\]", raw_text, re.DOTALL)
            if matches:
                try:
                    parsed = json.loads(matches[0])
                    return {"data": parsed, "raw": raw_text}
                except json.JSONDecodeError:
                    return {"data": [], "raw": raw_text}

            # --- Last resort ---
            return {"data": [], "raw": raw_text}

        except (requests.exceptions.RequestException, json.JSONDecodeError) as e:
            print(f"Ollama error (attempt {attempt+1}): {e}")
            if attempt < retries - 1:
                time.sleep(1)
                continue
            return {"data": [], "raw": ""}