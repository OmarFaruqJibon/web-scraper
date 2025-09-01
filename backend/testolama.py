import requests
import json

ollama_url = "http://localhost:11434/api/generate"

data = requests.post(
    "http://localhost:11434/api/generate",
    json={"model": "llama3:latest", "prompt": "Who are you?"}, 
    stream=False
)

print(data.text)
    
    
    
    
  
    
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





    
    
    