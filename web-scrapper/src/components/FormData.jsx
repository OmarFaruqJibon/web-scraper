import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, ExternalLink, Sparkles } from "lucide-react";
import api from "../callApi";
import { useNavigate } from "react-router-dom";

const FormData = ({ onSuccess }) => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(null);
const navigate = useNavigate();

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
      // Redirect to results page with state indicating we came from scraping
      navigate("/results", { state: { fromScrape: true } });
    } catch (error) {
      console.error("Error starting crawl", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full my-12">
      {/* Form */}
      <motion.form 
        onSubmit={handleSubmit} 
        className="flex flex-col sm:flex-row gap-4 items-start"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter website URL to analyze"
            className="w-full px-6 py-4 rounded-2xl border border-slate-600 bg-slate-800/70 backdrop-blur-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent shadow-lg glow-effect"
            required
            disabled={isLoading}
          />
          <Sparkles className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-400/60" size={20} />
        </div>

        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={!isLoading ? { scale: 1.05 } : {}}
          whileTap={!isLoading ? { scale: 0.95 } : {}}
          className={`px-8 py-4 rounded-2xl font-semibold shadow-lg transition-all duration-300 relative overflow-hidden ${
            isLoading
              ? "bg-blue-500/50 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 relative z-10">
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span className="flex items-center text-white">
                Scraping
                <span className="ml-1 flex">
                  <span className="animate-bounce">.</span>
                  <span className="animate-bounce [animation-delay:0.2s]">.</span>
                  <span className="animate-bounce [animation-delay:0.4s]">.</span>
                </span>
              </span>
            </div>
          ) : (
            <span className="text-white">Start Scrape</span>
          )}

          {isLoading && (
            <div className="absolute inset-0 rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]"></div>
            </div>
          )}
        </motion.button>
      </motion.form>

      {/* Progress indicator */}
      <AnimatePresence>
        {progress && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-xl mt-8 p-6 bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-slate-700 shadow-lg glow-effect"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-100">Scraping Progress</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                progress.status === "finished" 
                  ? "bg-green-900/30 text-green-400" 
                  : progress.status === "error" 
                  ? "bg-red-900/30 text-red-400"
                  : "bg-blue-900/30 text-blue-400"
              }`}>
                {progress.status.charAt(0).toUpperCase() + progress.status.slice(1)}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-700 rounded-full h-2.5 mb-4">
              <div 
                className="h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" 
                style={{ width: `${(progress.done / progress.total) * 100}%` }}
              ></div>
            </div>

            <div className="flex justify-between text-sm text-slate-400 mb-2">
              <span>Pages processed: {progress.done}/{progress.total}</span>
              <span>{Math.round((progress.done / progress.total) * 100)}%</span>
            </div>

            {progress.current_url && (
              <div className="flex items-center mt-4 pt-4 border-t border-slate-700">
                <ExternalLink size={16} className="text-slate-400 mr-2" />
                <span className="text-slate-400 text-sm truncate">Current: {progress.current_url}</span>
              </div>
            )}

            {progress.status === "finished" && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center mt-4 text-green-400"
              >
                <CheckCircle size={20} className="mr-2" />
                <span>Analysis completed successfully!</span>
              </motion.div>
            )}

            {progress.status === "error" && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center mt-4 text-red-400"
              >
                <XCircle size={20} className="mr-2" />
                <span>Error occurred during analysis</span>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info text */}
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="text-center text-slate-400 mt-6 text-sm"
      >
        Enter any website URL to scrape its content with our AI-powered tool
      </motion.p>
    </div>
  );
};

export default FormData;