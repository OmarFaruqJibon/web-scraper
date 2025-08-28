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
# Stop-word cleaner
# --------------------------
STOP_PATTERNS = [
    r"\bProfessor\b.*", r"\bAssociate\b.*", r"\bAssistant\b.*",
    r"\bLecturer\b.*", r"\bResearch(er| Fellow)\b.*", r"\bConsultant\b.*",
    r"\bSpecialist\b.*", r"\bDepartment\b.*", r"\bFaculty\b.*", r"\bUniversity\b.*",
    r"\bHead\b.*", r"\bChair(man|person)?\b.*", r"\bCoordinator\b.*",
    r"\bDean\b.*", r"\bDirector\b.*", r"\bProfile\b.*", r"\bDept\b.*"
    # Degrees
    r"\bPh\.?D\b.*", r"\bM\.?Sc\b.*", r"\bB\.?Sc\b.*", r"\bMBBS\b.*",
    r"\bMS\b.*", r"\bMD\b.*", r"\bFCPS\b.*", r"\bFRCS\b.*", r"\bFACS\b.*",
    r"\bEngg\b.*", r"\bEngineering\b.*"
]

def strip_titles_and_degrees(name: str) -> str:
    """
    Remove academic/job titles or trailing degree info from names.
    Works for both English and Bangla.
    """
    # Remove commas and extra text after them
    name = re.split(r"[,-]", name)[0].strip()

    # Remove stopword patterns
    for pat in STOP_PATTERNS:
        name = re.sub(pat, "", name, flags=re.IGNORECASE).strip()

    # Remove multiple spaces
    name = re.sub(r"\s+", " ", name).strip()

    return name


# --------------------------
# Helpers
# --------------------------
def clean_and_validate_names(all_names, lang="en"):
    """
    Filter out false positives and non-person-like names.
    """
    false_positives = {
        "Privacy Policy", "Terms of Service", "Contact Us", "About Us",
        "Sign In", "Log In", "Sign Up", "Home", "Products", "Services",
        "Blog", "News", "Careers", "Support", "Help", "FAQ", "Professor",
        "Employee", "Lecturer", "University", "Department", "Dept", "Profile", "Home", "All", "Employee", "Others", "Notices", "Member", "Information", "Charter", "People", "Study Leave", "Study", "Home Pages All", "Home Page", "dept", "Home About", "People Ex"
    }

    cleaned = set()
    for name in all_names:
        name = strip_titles_and_degrees(name)

        if not name or name in false_positives:
            continue
        if len(name) < 2 or len(name) > 80:
            continue

        tokens = name.split()
        valid = False

        if lang == "en":
            if tokens[0].lower().rstrip(".") in ["dr", "md", "mr", "prof", "engr"]:
                valid = True

            if not valid:
                for token in tokens:
                    for fname in first_names:
                        if fuzz.ratio(token.lower(), fname.lower()) >= 90:
                            valid = True
                            break
                    if valid:
                        break

            if not valid and len(tokens) >= 2 and all(t[0].isupper() for t in tokens if t.isalpha()):
                valid = True

            if not valid:
                continue

        elif lang == "bn":
            # Must be at least two Bangla words
            if len(tokens) >= 2 and all(re.match(r"^[\u0980-\u09FF]+$", t) for t in tokens):
                valid = True
            else:
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
            if 2 <= len(candidate.split()) <= 6:
                all_names.add(candidate)

    # Regex for prefixed names
    prefixed_patterns = [
        r"\b(?:Dr|Prof|Mr|Engr)\.?\s+[A-Z][a-zA-Z\.]+(?:\s+[A-Z][a-zA-Z\.]+){0,5}(?:\s*\([A-Za-z]+\))?"
    ]
    for pat in prefixed_patterns:
        matches = re.findall(pat, text, re.IGNORECASE)
        all_names.update([m.strip() for m in matches])

    # Fallback: stricter capitalized names (avoid academic terms)
    fallback = re.findall(r"\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2}\b", text)
    for f in fallback:
        if not re.search(r"(University|Department|Computer|System|Engineering|Science)", f, re.IGNORECASE):
            all_names.add(f.strip())

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
