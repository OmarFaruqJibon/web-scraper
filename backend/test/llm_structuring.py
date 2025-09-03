# llm_structuring.py
import json
import ollama

def structure_people_with_ollama(names, emails, phones, locations, context_text="", model="llama3"):
    """
    Use Ollama to match names, emails, phones, and locations into structured people objects.
    """

    prompt = f"""
    You are an information extraction model.
    Match names, emails, phones, and locations into person records.

    Return only valid JSON array, with this schema:
    [
      {{"name": "...", "email": "...", "phone": "...", "location": "..."}}
    ]

    If you can't find a value for a field, leave it as an empty string.

    ---
    NAMES: {names}
    EMAILS: {emails}
    PHONES: {phones}
    LOCATIONS: {locations}

    CONTEXT (may contain relevant details): {context_text[:1500]}
    """

    response = ollama.chat(
        model=model,
        messages=[{"role": "user", "content": prompt}]
    )

    raw = response["message"]["content"].strip()

    # Try parsing JSON safely
    try:
        data = json.loads(raw)
        if isinstance(data, list):
            return data
    except Exception:
        pass

    # If model returns bad JSON, fallback
    return [{"name": n, "email": "", "phone": "", "location": ""} for n in names]
