import re
import spacy
from nltk.corpus import names as nltk_names
from fuzzywuzzy import fuzz
from transformers import pipeline, AutoTokenizer, AutoModelForTokenClassification

# --- Load spaCy (English NER) ---
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    from spacy.cli import download
    download("en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")

# --- Load Hugging Face Bangla NER model ---
bn_tokenizer = AutoTokenizer.from_pretrained("sagorsarker/mbert-bengali-ner")
bn_model = AutoModelForTokenClassification.from_pretrained("sagorsarker/mbert-bengali-ner")
bn_ner = pipeline("ner", model=bn_model, tokenizer=bn_tokenizer, aggregation_strategy="simple")

# --- Load English name dictionary ---
try:
    first_names = set(nltk_names.words("male.txt") + nltk_names.words("female.txt"))
except:
    import nltk
    nltk.download("names")
    first_names = set(nltk_names.words("male.txt") + nltk_names.words("female.txt"))


# --------------------------
# Helpers
# --------------------------
def is_medical_context(name: str) -> bool:
    """
    Keep only names with Dr. prefix or that appear in a medical context.
    """
    
    prefixes_to_check = ("dr", "DR" "Dr", "Engr", "ENGR", "engr")
    
    if name.startswith(prefixes_to_check):
        return True

    medical_keywords = [
        "surgeon", "surgery", "doctor", "professor", "consultant",
        "specialist", "md", "fcps", "ms", "mbbs", "facs", "physician"
    ]
    return any(kw.lower() in name.lower() for kw in medical_keywords)


def clean_and_validate_names(all_names, lang="en"):
    """
    Filter out false positives and non-person-like names.
    """
    false_positives = {
        "Privacy Policy", "Terms of Service", "Contact Us", "About Us",
        "Sign In", "Log In", "Sign Up", "Home", "Products", "Services",
        "Blog", "News", "Careers", "Support", "Help", "FAQ"
    }

    cleaned = set()
    for name in all_names:
        name = name.strip()
        if not name or name in false_positives:
            continue
        if len(name) < 2 or len(name) > 60:
            continue
        if name.isupper():
            continue

        # English: require one valid first name
        if lang == "en":
            tokens = name.split()
            valid = False
            for token in tokens:
                for fname in first_names:
                    if fuzz.ratio(token.lower(), fname.lower()) >= 90:
                        valid = True
                        break
                if valid:
                    break
            if not valid:
                continue

        # Apply medical filter
        if not is_medical_context(name):
            continue

        cleaned.add(name)

    return sorted(cleaned)


# --------------------------
# English name extractor
# --------------------------
def extract_english_names(soup, text: str):
    all_names = set()

    # spaCy NER
    doc = nlp(text)
    for ent in doc.ents:
        if ent.label_ == "PERSON":
            candidate = ent.text.strip()
            if 2 <= len(candidate.split()) <= 5:
                all_names.add(candidate)

    # Regex fallback
    regex_names = re.findall(r"\b[A-Z][a-z]+ [A-Z][a-z]+\b", text)
    for rn in regex_names:
        if 2 <= len(rn.split()) <= 3:
            all_names.add(rn)

    # Staff/team/author/profile selectors
    for selector in ['[class*="team"]', '[class*="staff"]',
                     '[class*="author"]', '[class*="profile"]']:
        for elem in soup.select(selector):
            elem_text = elem.get_text(" ", strip=True)
            if 2 <= len(elem_text.split()) <= 5:
                all_names.add(elem_text)

    return clean_and_validate_names(all_names, lang="en")


# --------------------------
# Bangla name extractor
# --------------------------
def extract_bangla_names(text: str):
    try:
        results = bn_ner(text)
        all_names = set()
        for r in results:
            if r["entity_group"] == "PER":
                all_names.add(r["word"].strip())
        return clean_and_validate_names(all_names, lang="bn")
    except Exception as e:
        print(f"BanglaBERT NER error: {e}")
        return []


# --------------------------
# Combined Extractor
# --------------------------
def extract_names(soup, text: str):
    english_names = extract_english_names(soup, text)
    bangla_names = extract_bangla_names(text)
    return sorted(set(english_names + bangla_names))
