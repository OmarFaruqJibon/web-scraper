A recursive web crawler, which will extract useful informations from any website.

Step 1: Input URL

- The system starts when the user enters a target website URL through the React frontend.

- This URL is sent to the FastAPI backend, which initiates the crawling process.

Step 2: Crawler Sends URL to Scraper

- The Crawler module receives the URL.

- It forwards the URL to the Scraper, whose job is to extract useful data and links.

Step 3: Scraper Extracts Data and Links

The Scraper processes the page content:

- Extracts structured information (names, emails, phone numbers, locations, etc.) using a mix of Ollama LLaMA 3 (LLM) and regex rules.

- Finds all internal links (URLs within the same base domain).

The Scraper then returns:

- Extracted information

- Discovered internal URLs

Step 4: Crawler Stores Data & Recurses

The Crawler takes the returned data and:

- Stores extracted information in the MongoDB database.

Loops over each discovered internal URL. For every internal URL:

- It calls the Scraper again.

- The Scraper extracts information and finds new URLs.

- This process continues recursively until all reachable internal URLs are processed.

Step 5: Return Data to Frontend

- After crawling is complete, the Crawler aggregates the scraped information.

- It sends the final dataset back to the frontend (React) through the FastAPI backend API.

- The user can then view the collected data in a structured format.