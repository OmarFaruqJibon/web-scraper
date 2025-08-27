import { useState } from "react";
import api from "../callApi";

const FormData = ({ onSuccess }) => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = { url }; // ✅ only send url

    try {
      await api.post("/crawl", formData);
      console.log("Form submitted:", formData);

      setUrl("");

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error adding data", error.response?.data || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-20 text-center">
          Web Scraper
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* URL Input */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Target URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full font-medium py-3 rounded-xl shadow-md transition-all duration-300 relative overflow-hidden ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-3 relative z-10 text-white">
                <span className="h-5 w-5 border-3 border-white border-t-transparent rounded-full animate-spin"></span>
                <span className="flex items-center">
                  Scraping
                  <span className="ml-1 flex">
                    <span className="animate-bounce">.</span>
                    <span className="animate-bounce [animation-delay:0.2s]">.</span>
                    <span className="animate-bounce [animation-delay:0.4s]">.</span>
                  </span>
                </span>
              </div>
            ) : (
              "Start Scraping"
            )}

            {isLoading && (
              <div className="absolute inset-0 rounded-xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]"></div>
              </div>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FormData;
