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
# NOTE: This model works only for Bangla-script names (not English transliteration).
bn_tokenizer = AutoTokenizer.from_pretrained("sagorsarker/mbert-bengali-ner")
bn_model = AutoModelForTokenClassification.from_pretrained("sagorsarker/mbert-bengali-ner")
bn_ner = pipeline(
    "ner",
    model=bn_model,
    tokenizer=bn_tokenizer,
    aggregation_strategy="simple"
)

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
    prefixes_to_check = ("dr", "prof")
    if name.lower().startswith(prefixes_to_check):
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
        if len(name) < 2 or len(name) > 80:
            continue
        if name.isupper():
            continue

        # English: require one valid first name unless it's a Dr./Md. style name
        if lang == "en":
            tokens = name.split()
            valid = False

            # Accept names with Dr. or Md. regardless of dictionary
            if name.lower().startswith("dr.") or tokens[0].lower() in ["dr.", "dr", "md.", "md"]:
                valid = True
            else:
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

    # --- spaCy NER ---
    doc = nlp(text)
    for ent in doc.ents:
        if ent.label_ == "PERSON":
            candidate = ent.text.strip()
            if 2 <= len(candidate.split()) <= 6:
                all_names.add(candidate)

    # --- Regex for doctor names ---
    regex_names = re.findall(
        r"\bDr\.?\s+[A-Z][a-zA-Z\.]+(?:\s+[A-Z][a-zA-Z\.]+){0,4}(?:\s*\([A-Za-z]+\))?",
        text
    )
    for rn in regex_names:
        all_names.add(rn.strip())

    # --- Regex for general capitalized names (fallback) ---
    generic_names = re.findall(r"\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3}\b", text)
    for gn in generic_names:
        all_names.add(gn.strip())

    # --- Staff/team/author/profile selectors ---
    for selector in ['[class*="team"]', '[class*="staff"]',
                     '[class*="author"]', '[class*="profile"]']:
        for elem in soup.select(selector):
            elem_text = elem.get_text(" ", strip=True)
            if 2 <= len(elem_text.split()) <= 6:
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
