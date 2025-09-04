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
      }, 2000);
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
    <div className="w-full my-20">
      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter a website URL"
          className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:outline-none text-gray-800 shadow-sm"
          required
          style={{
            ":focus": {
              borderColor: "#1DDE74",
              boxShadow: "0 0 0 2px rgba(29, 222, 116, 0.2)",
            },
          }}
        />

        <button
          type="submit"
          disabled={isLoading}
          style={{ color: "#1DDE74" }}
          className={`px-6 py-3 mt- rounded-xl font-semibold shadow-md transition-all duration-300 relative overflow-hidden  cursor-pointer ${
            isLoading
              ? "bg-gray-400 cursor-not-allowed text-white"
              : "bg-gray-900 hover:bg-gray-950"
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 relative z-10">
              <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
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
            "Start"
          )}

          {isLoading && (
            <div className="absolute inset-0 rounded-xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]"></div>
            </div>
          )}
        </button>
      </form>

      {/* Progress box */}
      {progress && (
        <div className="mt-10 p-4 bg-gray-100 rounded-lg text-sm shadow-inner">
          <p>
            Status:{" "}
            <span
              className={`font-semibold ${
                progress.status === "finished"
                  ? "text-green-700"
                  : progress.status === "error"
                  ? "text-red-700"
                  : "text-blue-700"
              }`}
            >
              {progress.status}
            </span>
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
  );
};

export default FormData;
