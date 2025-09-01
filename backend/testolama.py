import requests
import json

ollama_url = "http://localhost:11434/api/generate"

# Send the request (streaming=True is important here)
with requests.post(
    ollama_url,
    json={"model": "llama3:latest", "prompt": "Who are you?"},
    stream=True,
) as response:
    response.raise_for_status()

    full_text = ""
    for line in response.iter_lines():
        if line:
            data = json.loads(line.decode("utf-8"))
            if "response" in data:
                full_text += data["response"]
            if data.get("done", False):
                break

print(full_text)

    
  
    
# import requests

# def query_deepseek(prompt, model='deepseek-r1:8b'):
    
#     url = "http://localhost:11434/api/generate"
    
#     payload = {
#         "model": model,
#         "prompt": prompt,
#         "stream": False
#     }

#     response = requests.post(url, json=payload)
    
#     if response.status_code == 200:
#         data = response.json()
#         return data.get("response", "No response field in JSON")
#     else:
#         return f"Error {response.status_code}: {response.text}"


# print(query_deepseek("What is AI?"))





    
    
    