# llm_extractor.py
import requests
import re
import json
import time

OLLAMA_URL = "http://localhost:11434/api/generate"
DEFAULT_MODEL = "llama3:8b"
DEFAULT_RETRIES = 2
RETRY_BACKOFF = 1.5


def send_to_ollama_chunk(text: str, retries: int = DEFAULT_RETRIES):
    prompt = f"""
        You are an information extraction system.
        Input:
        - HTML content grouped into <block>...</block>.
        - Each block may describe people, organizations, products, events, services, courses, or general information.
        - Images may appear as <img src='...' alt='...'> → map these to "image" field.
        - Links appear as <a href='...'>text</a> → if they are social media (Facebook, LinkedIn, Twitter, Instagram, YouTube, GitHub, etc.), map them to "social".

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
                {{"name":"","description":"","fee":"", "department":"","contact":{{"email":[],"phone":[]}}}}
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
        "model": DEFAULT_MODEL,
        "prompt": prompt,
        "stream": False
    }

    required_keys = [
        "people", "organization", "products", "events",
        "services", "courses", "content", "other_info"
    ]

    for attempt in range(1, retries + 1):
        try:
            print("\n🔃 Sending chunk to Ollama (attempt %d)\n" % attempt)
            start_time = time.time()
            response = requests.post(OLLAMA_URL, json=payload, timeout=1800)
            response.raise_for_status()
            elapsed = time.time() - start_time
            print(f"⚡ Extraction took {elapsed:.2f} sec\n")

            data = response.json()
            raw_text = data.get("response", "").strip()

            # 1) Try parse entire raw_text directly as JSON
            try:
                parsed = json.loads(raw_text)
                # ensure keys exist
                for k in required_keys:
                    if k not in parsed:
                        parsed[k] = [] if isinstance(parsed.get(k, None), list) or k in ["people", "products", "events", "services", "courses"] else {}
                return {"data": parsed, "raw": raw_text}
            except json.JSONDecodeError:
                pass

            # 2) Try to locate the first top-level JSON object in the output using a balanced-brace scan
            obj_text = extract_first_json_object(raw_text)
            if obj_text:
                try:
                    parsed = json.loads(obj_text)
                    for k in required_keys:
                        if k not in parsed:
                            parsed[k] = [] if k in ["people", "products", "events", "services", "courses"] else {}
                    return {"data": parsed, "raw": raw_text}
                except json.JSONDecodeError:
                    pass

            # 3) As a final fallback, return an empty-safe schema
            empty_schema = {
                "people": [], "organization": [], "products": [], "events": [],
                "services": [], "courses": [], "content": {"articles": [], "news": [], "blogs": [], "faqs": [], "policies": [], "announcements": []},
                "other_info": []
            }
            return {"data": empty_schema, "raw": raw_text}

        except requests.exceptions.RequestException as e:
            print(f"Ollama HTTP error (attempt {attempt}): {e}")
            if attempt < retries:
                time.sleep(RETRY_BACKOFF ** attempt)
                continue
            # final fallback
            empty_schema = {
                "people": [], "organization": [], "products": [], "events": [],
                "services": [], "courses": [], "content": {"articles": [], "news": [], "blogs": [], "faqs": [], "policies": [], "announcements": []},
                "other_info": []
            }
            return {"data": empty_schema, "raw": ""}

def extract_first_json_object(s: str):
    """
    Attempts to extract the first balanced JSON object (from first '{' to matching '}' considering nested braces).
    Returns the substring or None.
    """
    start = s.find("{")
    if start == -1:
        return None
    depth = 0
    for i in range(start, len(s)):
        if s[i] == "{":
            depth += 1
        elif s[i] == "}":
            depth -= 1
            if depth == 0:
                return s[start:i+1]
    return None


# Remove duplicates based on (name + email + phone).
def deduplicate_people(people):
    seen, unique = set(), []
    for person in people:
        key = (
            (person.get("name") or "").strip().lower(),
            tuple(sorted([e.lower() for e in person.get("email", [])])) if person.get("email") else (),
            tuple(sorted([p for p in person.get("phone", [])])) if person.get("phone") else ()
        )
        if key not in seen:
            seen.add(key)
            unique.append(person)
    return unique


def unique_by_key(items, key_name):
    seen = set()
    out = []
    for it in items:
        k = (it.get(key_name) or "").strip().lower()
        if k and k not in seen:
            seen.add(k)
            out.append(it)
    return out


# Merge multiple chunk results into one consistent structure.
def merge_results(results):
    merged = {
        "people": [],
        "organization": [],
        "products": [],
        "events": [],
        "services": [],
        "courses": [],
        "content": {"articles": [], "news": [], "blogs": [], "faqs": [], "policies": [], "announcements": []},
        "other_info": []
    }

    for r in results:
        data = r.get("data", {}) or {}
        merged["people"].extend(data.get("people", []))
        merged["products"].extend(data.get("products", []))
        merged["events"].extend(data.get("events", []))
        merged["services"].extend(data.get("services", []))
        merged["courses"].extend(data.get("courses", []))
        merged["organization"].extend(data.get("organization", []))

        content = data.get("content", {}) or {}
        for section in ["articles", "news", "blogs", "faqs", "policies", "announcements"]:
            merged["content"].setdefault(section, [])
            merged["content"][section].extend(content.get(section, []))

        if isinstance(data.get("other_info", []), list):
            merged["other_info"].extend(data.get("other_info", []))

    # Deduplicate people and organizations and products by reasonable keys
    merged["people"] = deduplicate_people(merged["people"])
    merged["organization"] = unique_by_key(merged["organization"], "name")
    merged["products"] = unique_by_key(merged["products"], "name")
    merged["events"] = unique_by_key(merged["events"], "name")
    merged["services"] = unique_by_key(merged["services"], "name")
    merged["courses"] = unique_by_key(merged["courses"], "name")

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
