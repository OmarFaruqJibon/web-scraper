# llm_extractor.py
import requests
import re
import json
import time


def send_to_ollama_chunk(text: str, retries: int = 1):
    ollama_url = "http://localhost:11434/api/generate"

    prompt = f"""
        You are an information extraction system.
        Input:
        - HTML content grouped into <block>...</block>.
        - Each block may describe people, organizations, products, events, services, courses, or general information.
        - Images may appear as <img src='...' alt='...'> → map these to "image" field.

        Task:
        - Extract all factual data into the schema below.
        - Output must be valid JSON **only**. No explanations, no markdown fences.
        - Preserve numbers, currencies, emails, phones, and proper names exactly.
        - If a field is missing, use empty string, empty list, or empty object.
        
        Schema:
        {{
            "people": [
                {{"name":"","role":"","title":"","email":[],"phone":[],"location":"","image":"","description":"","social":[]}}
            ],
            "organization": [
                {{"name":"","description":"","address":"","contact":{{"email":[],"phone":[],"social":[]}}}}
            ],
            "products": [
                {{"name":"","price":"","description":"","image":"","reviews":[]}}
            ],
            "events": [
                {{"name":"","date":"","time":"","location":"","description":"","organizer":"","speakers":[]}}
            ],
            "services": [
                {{"name":"","description":"","fee":"",department":"","contact":{{"email":[],"phone":[]}}}}
            ],
            "courses": [
                {{"name":"","department":"","duration":"", "fee":"","instructor":"","description":"","contact":{{"email":[],"phone":[]}}}}
            ],
            "content": {{"articles":[],"news":[],"blogs":[],"faqs":[],"policies":[],"announcements":[]}},
            "other_info":[]
        }}

        Rules:
        - Always return JSON with all keys present.
        - If no data for a section, return empty list, empty string, or empty object.
        - No explanations, no text outside JSON.

        HTML:
        {text}
    """

    payload = {
        "model": "llama3:8b",
        "prompt": prompt,
        "stream": False
    }

    required_keys = [
        "people", "organization", "products", "events",
        "content", "other_info", "courses", "services"
    ]

    for attempt in range(retries):
        try:
            print("\n🔃 Sending chunk to Ollama\n")
            start_time = time.time()

            response = requests.post(ollama_url, json=payload, timeout=1800)
            response.raise_for_status()

            elapsed = time.time() - start_time
            print(f"⚡ Extraction took {elapsed:.2f} sec\n")

            data = response.json()
            raw_text = data.get("response", "").strip()

            # Try parsing full JSON
            try:
                parsed = json.loads(raw_text)
                for k in required_keys:
                    if k not in parsed:
                        parsed[k] = [] if k in ["people", "products", "events"] else {}
                return {"data": parsed, "raw": raw_text}
            except json.JSONDecodeError:
                pass

            # Try regex fallback
            matches = re.findall(r"\{.*\}", raw_text, re.DOTALL)
            if matches:
                try:
                    parsed = json.loads(matches[0])
                    for k in required_keys:
                        if k not in parsed:
                            parsed[k] = [] if k in ["people", "products", "events"] else {}
                    return {"data": parsed, "raw": raw_text}
                except json.JSONDecodeError:
                    return {"data": {k: [] if k in ["people", "products", "events"] else {} for k in required_keys}, "raw": raw_text}

            return {"data": {k: [] if k in ["people", "products", "events"] else {} for k in required_keys}, "raw": raw_text}

        except (requests.exceptions.RequestException, json.JSONDecodeError) as e:
            print(f"Ollama error (attempt {attempt+1}): {e}")
            if attempt < retries - 1:
                time.sleep(1)
                continue
            return {"data": {k: [] if k in ["people", "products", "events"] else {} for k in required_keys}, "raw": ""}


def deduplicate_people(people):
    """Remove duplicates based on (name + email + phone)."""
    seen, unique = set(), []
    for person in people:
        key = (
            (person.get("name") or "").strip().lower(),
            tuple(sorted([e.lower() for e in person.get("email", [])])),
            tuple(sorted([p for p in person.get("phone", [])]))
        )
        if key not in seen:
            seen.add(key)
            unique.append(person)
    return unique


def merge_results(results):
    """Merge multiple chunk results into one consistent structure."""
    merged = {
        "people": [],
        "organization": [],
        "products": [],
        "events": [],
        "services": [],
        "courses": [],
        "content": {"articles": [], "faqs": [], "policies": []},
        "other_info": []
    }

    for r in results:
        data = r.get("data", {})

        merged["people"].extend(data.get("people", []))
        merged["products"].extend(data.get("products", []))
        merged["events"].extend(data.get("events", []))
        merged["services"].extend(data.get("services", []))
        merged["courses"].extend(data.get("courses", []))

        # Organization
        merged["organization"].extend(data.get("organization", []))

        # Content
        for section in ["articles", "faqs", "policies"]:
            merged["content"][section].extend(data.get("content", {}).get(section, []))

        # other_info
        if isinstance(data.get("other_info", []), list):
            merged["other_info"].extend(data.get("other_info", []))

    # Deduplicate people
    merged["people"] = deduplicate_people(merged["people"])
    return merged



def process_with_ollama(block: str):
    res = send_to_ollama_chunk(block)
    all_data, all_raw = None, []

    if isinstance(res, dict):
        if res.get("data"):
            all_data = res["data"]
        if res.get("raw"):
            all_raw.append(res["raw"])

    return {"data": all_data, "raw": all_raw}

