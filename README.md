# 🔍 Recursive Web Crawler

A **recursive web crawler** that extracts useful information from any website.  
It combines a **React frontend**, **FastAPI backend**, and **MongoDB database**, powered by **Ollama LLaMA 3 (LLM)** and **regex rules** for intelligent data extraction.

---

## 🚀 Features

- 🌐 Crawl any target website starting from a user-provided URL  
- 🧠 Extract structured data (names, emails, phone numbers, locations, etc.)  
- 🔗 Automatically discover and follow internal links recursively  
- 💾 Store extracted data in **MongoDB**  
- ⚡ Expose crawling functionality via a **FastAPI backend**  
- 🖥️ View results in a **React frontend** with structured visualization  

---

## 🛠️ Tech Stack

- **Frontend:** React  
- **Backend:** FastAPI  
- **Database:** MongoDB  
- **AI/Parsing:** Ollama LLaMA 3 + Regex  
- **Crawler/Scraper:** Custom Python modules  

---

## 📌 Workflow

### Step 1: Input URL
- User enters a target website URL in the **React frontend**.
- URL is sent to the **FastAPI backend**, which starts the crawling process.

### Step 2: Crawler → Scraper
- **Crawler module** receives the URL.
- It forwards the URL to the **Scraper**, which extracts data and links.

### Step 3: Scraper Extracts Data & Links
- Extracts structured data using **LLM + regex**.  
- Finds all **internal links** (same domain).  
- Returns both extracted information and discovered URLs.

### Step 4: Recursive Crawling
- Crawler stores extracted data in **MongoDB**.  
- For each internal link, the **Scraper** is called again.  
- Process continues until all reachable pages are crawled.

### Step 5: Results Returned
- Final dataset is aggregated and sent back via **FastAPI**.  
- **React frontend** displays the structured results to the user.

---

## 🤝 Contributing

- Contributions are welcome!
- Feel free to fork this repo, open issues, or submit pull requests.

