# llm_extractor.py
import requests
import re
import json
import time


# def chunk_blocks(text: str, max_blocks: int = 20):
#     blocks = text.strip().split("</block>")
#     chunks, current = [], []

#     for block in blocks:
#         block = block.strip()
#         if not block:
#             continue
#         current.append(block + "</block>")
#         if len(current) >= max_blocks:
#             chunks.append("\n".join(current))
#             current = []
#     if current:
#         chunks.append("\n".join(current))

#     return chunks


# def chunk_blocks(text: str):
#     blocks = text.strip().split("</block>")
#     chunks = []

#     for block in blocks:
#         block = block.strip()
#         if not block:
#             continue
#         chunks.append(block + "</block>")

#     return chunks


def send_to_ollama_chunk(text: str, retries: int = 1):
    ollama_url = "http://localhost:11434/api/generate"

    prompt = f"""
        You are an information extraction system.

        Input: Cleaned HTML grouped into <block>...</block>.
        Each <block> usually describes one person.

        Your task:
        - Extract a list of people.
        - For each person, include:
        - name (string)
        - email (array of strings, [] if none found)
        - phone (array of strings, [] if none found)
        - location (string, "" if none found)
        - image (URL from <img> tag if related to that person)
        - description (string, all extra useful details)

        Rules:
        - Always return JSON array.
        - No explanations, no text outside JSON.
        - If no people are found, return [].
        
         Example output:
            [
            {{
                "name": "John Doe",
                "email": ["john@example.com", "john2@example.com"],
                "phone": ["+8801742189750", "01884-495847"],
                "location": "Rajshahi, Bangladesh",
                "image": "https://www.ruet.edu.bd/john.jpg",
                "description": "This is description"
            }},
            {{
                "name": "Jane Smith",
                "email": [],
                "phone": [01874-258691],
                "location": "London, UK",
                "image": null,
                "description": ""
            }}
            ]


        HTML:
        {text}
            """

    payload = {
        "model": "llama3:8b",
        "prompt": prompt,
        "stream": False
    }

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

            try:
                parsed = json.loads(raw_text)
                return {"data": parsed, "raw": raw_text}
            except json.JSONDecodeError:
                pass

            matches = re.findall(r"\[.*\]", raw_text, re.DOTALL)
            if matches:
                try:
                    parsed = json.loads(matches[0])
                    return {"data": parsed, "raw": raw_text}
                except json.JSONDecodeError:
                    return {"data": [], "raw": raw_text}

            return {"data": [], "raw": raw_text}

        except (requests.exceptions.RequestException, json.JSONDecodeError) as e:
            print(f"Ollama error (attempt {attempt+1}): {e}")
            if attempt < retries - 1:
                time.sleep(1)
                continue
            return {"data": [], "raw": ""}


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


# def process_with_ollama(body_text: str):
#     # chunks = chunk_blocks(body_text, max_blocks=20)
#     chunks = chunk_blocks(body_text)
#     all_data, all_raw = [], []

#     for i, chunk in enumerate(chunks, start=1):
#         print(f"\n📦 Processing chunk {i}/{len(chunks)}\n")
#         res = send_to_ollama_chunk(chunk)
#         print(chunk)

#         if isinstance(res, dict):
#             if res.get("data"):
#                 all_data.extend(res["data"])
#             if res.get("raw"):
#                 all_raw.append(res["raw"])

#     # ✅ Deduplicate final data
#     # all_data = deduplicate_people(all_data)

#     return {"data": all_data, "raw": all_raw}


def process_with_ollama(block: str):
    res = send_to_ollama_chunk(block)
    all_data, all_raw = [], []

    if isinstance(res, dict):
        if res.get("data"):
            all_data.extend(res["data"])
        if res.get("raw"):
            all_raw.append(res["raw"])

    return {"data": all_data, "raw": all_raw}


