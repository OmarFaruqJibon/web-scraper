//web-scrapper\src\callApi.js

import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

// Start crawl on direct URL
export const startCrawl = async ({ url, maxPages = 1, maxDepth = 10 }) => {
  return api.post("/crawl", { url, max_pages: maxPages, max_depth: maxDepth });
};

// Search and crawl top results
export const searchAndCrawl = async ({ query, count = 10, maxPages = 1, maxDepth = 5 }) => {
  return api.post("/search-and-crawl", { query, count, max_pages: maxPages, max_depth: maxDepth });
};

export default api;