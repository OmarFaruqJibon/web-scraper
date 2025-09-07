import os
import re
import json
import spacy
import requests
from bs4 import BeautifulSoup
import time

# Load spaCy NLP model
nlp = spacy.load("en_core_web_sm")

# Input/Output
HTML_DIR = "../html_pages_bd"
OUTPUT_FILE = "../dataset/dataset.jsonl"

# Ollama settings
OLLAMA_MODEL = "llama3:latest"
OLLAMA_URL = "http://localhost:11434/api/generate"

# Regex
EMAIL_PATTERN = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
PHONE_PATTERN = r'(\+?\d[\d\s\-()x]{7,}\d)'

# Placeholder images to ignore
PLACEHOLDER_IMAGES = ["default", "avatar", "placeholder", "no-photo", "dummy"]


def extract_text_and_imgs(html_content):
    """Extract text (keep <img> tags) and first valid image URL."""
    soup = BeautifulSoup(html_content, "html.parser")

    # Collect image URL
    image_url = ""
    
    imgss = soup.find("img")
    img_src = imgss.get("src", "").strip()
    
    image_url = img_src
    
    
    # for img in soup.find_all("img"):
    #     src = img.get("src", "").strip()
    #     if src and not any(ph in src.lower() for ph in PLACEHOLDER_IMAGES):
    #         image_url = src
    #         break
        

    # Remove all tags except <img>
    for tag in soup.find_all(True):
        if tag.name != "img":
            tag.unwrap()

    text_with_imgs = str(soup).replace("\n", " ").strip()

    # For regex/spaCy (no img tags)
    plain_soup = BeautifulSoup(html_content, "html.parser")
    for img in plain_soup.find_all("img"):
        img.decompose()
    plain_text = plain_soup.get_text(separator="\n").strip()

    return text_with_imgs, plain_text, image_url


def auto_extract(text):
    """Extract name, phones, emails, location locally."""
    emails = re.findall(EMAIL_PATTERN, text)
    phones = re.findall(PHONE_PATTERN, text)

    doc = nlp(text)

    # --- Name ---
    names = [ent.text.strip() for ent in doc.ents if ent.label_ == "PERSON"]
    name = names[0] if names else ""

    # Fallback: first line with >=2 words
    if not name:
        for line in text.splitlines():
            if len(line.strip().split()) >= 2:
                name = line.strip()
                break
    if not name:
        name = "Unknown"

    # --- Location ---
    location = ""
    for line in text.splitlines():
        if line.lower().startswith("location:"):
            location = line.split(":", 1)[1].strip()
            break

    if not location:
        locs = [ent.text.strip() for ent in doc.ents if ent.label_ in ["GPE", "LOC"]]
        if locs:
            location = locs[0]

    return name, list(set(phones)), list(set(emails)), location

# "If this is about a person, make summery abouth the person. If this is about an institution, make summery about the institution."

def generate_description_with_ollama(prompt_text):
    """Call Ollama llama3 to generate a person description."""
    payload = {
        "model": OLLAMA_MODEL,
        "prompt": (
            "You are given a parsed HTML profile (all tags removed except <img>). "
            "Write a short professional summary about the person described. "
            "Do not repeat the raw fields directly; instead, summarize naturally.\n\n"
            
            f"{prompt_text}"
        ),
        "stream": False
    }
    try:
        print(f"🔃 Ollama loading...\n")
        response = requests.post(OLLAMA_URL, json=payload, timeout=300)
        response.raise_for_status()
        data = response.json()
        return data.get("response", "").strip()
    except Exception as e:
        print(f"⚠️ Ollama request failed: {e}")
        return ""


def create_dataset():
    dataset = []

    if not os.path.exists(HTML_DIR):
        print(f"❌ Folder {HTML_DIR} not found.")
        return

    files = [f for f in os.listdir(HTML_DIR) if f.lower().endswith((".html", ".htm"))]
    if not files:
        print(f"⚠️ No .html or .htm files found in {HTML_DIR}")
        return
    
    count = 0

    for filename in files:
        path = os.path.join(HTML_DIR, filename)
        with open(path, "r", encoding="utf-8") as f:
            html_content = f.read()
        
        start_time = time.time()

        # Extract text + image
        text_with_imgs, plain_text, image_url = extract_text_and_imgs(html_content)

        # Extract structured info (locally)
        name, phones, emails, location = auto_extract(plain_text)

        # ✅ Generate description with Ollama llama3
        description = generate_description_with_ollama(text_with_imgs)

        structured = {
            "name": name,
            "email": emails,
            "phone": phones,
            "location": location,
            "image": image_url,
            "description": description
        }

        entry = {
            "prompt": text_with_imgs,
            "completion": json.dumps(structured, ensure_ascii=False)
        }

        dataset.append(entry)
        count +=1
        elapsed = time.time() - start_time
        print(f"\n{count} Object inserted to dataset. Took {elapsed:.2f} seconds\n")

    # Save JSONL
    with open(OUTPUT_FILE, "a", encoding="utf-8") as f:
        for entry in dataset:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")

    print(f"✅ Dataset saved to {OUTPUT_FILE} with {len(dataset)} entries.")


if __name__ == "__main__":
    create_dataset()
