import { useState, useEffect } from "react";
import api from "../callApi";

const FormData = ({ onSuccess }) => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    let interval;
    if (isLoading) {
      interval = setInterval(async () => {
        try {
          const res = await api.get("/progress");
          setProgress(res.data);

          if (res.data.status === "finished" || res.data.status === "error") {
            clearInterval(interval);
            setIsLoading(false);
            if (onSuccess) onSuccess(); // refresh data
          }
        } catch (err) {
          console.error("Error fetching progress", err);
        }
      }, 5000); // poll every 2s
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setProgress(null);

    try {
      await api.post("/crawl", { url });
      setUrl("");
    } catch (error) {
      console.error("Error starting crawl", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg px-3 py-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-10 text-center">
          Web Scraper
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
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
                {/* Spinner */}
                <span className="h-5 w-5 border-3 border-white border-t-transparent rounded-full animate-spin"></span>

                {/* Text with bouncing dots */}
                <span className="flex items-center">
                  Scraping
                  <span className="ml-1 flex">
                    <span className="animate-bounce">.</span>
                    <span className="animate-bounce [animation-delay:0.2s]">
                      .
                    </span>
                    <span className="animate-bounce [animation-delay:0.4s]">
                      .
                    </span>
                  </span>
                </span>
              </div>
            ) : (
              "Start Scraping"
            )}

            {/* Shimmer progress bar overlay */}
            {isLoading && (
              <div className="absolute inset-0 rounded-xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]"></div>
              </div>
            )}
          </button>
        </form>

        {/* Show Progress */}
        {progress && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg text-sm">
            <p>
              Status: <span className="font-semibold">{progress.status}</span>
            </p>
            <p>
              Progress: {progress.done} / {progress.total}
            </p>
            {progress.current_url && (
              <p className="truncate text-gray-600">
                Current: {progress.current_url}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FormData;
