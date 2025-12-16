// web-scrapper\src\components\FormData.jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle, 
  XCircle, 
  ExternalLink, 
  Sparkles,
  Globe,
  Search,
  Zap,
  Cpu,
  Loader2
} from "lucide-react";
import api from "../callApi";
import { useNavigate } from "react-router-dom";

const FormData = () => {
  const [mode, setMode] = useState("url"); // "url" or "search"
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(null);
  const [inputFocus, setInputFocus] = useState(false);
  const navigate = useNavigate();

  // Poll progress
  useEffect(() => {
    let interval;
    if (isLoading) {
      const fetchProgress = async () => {
        try {
          const res = await api.get("/progress");
          const jobs = res.data?.progress || [];
          const latest = jobs[jobs.length - 1] || null;
          setProgress(latest);

          if (latest && (latest.status === "finished" || latest.status === "error")) {
            clearInterval(interval);
            setIsLoading(false);
            navigate("/results", { replace: true, state: { fromScrape: true } });
          }
        } catch (err) {
          console.error("Error fetching progress", err);
        }
      };

      interval = setInterval(fetchProgress, 3000);
      fetchProgress();
    }
    return () => clearInterval(interval);
  }, [isLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input) return;

    setIsLoading(true);
    setProgress(null);

    try {
      if (mode === "url") {
        // Direct URL crawl
        await api.post(
          "/crawl",
          { url: input, max_pages: 1, max_depth: 5 },
          { headers: { "Content-Type": "application/json" } }
        );
      } else {
        // Search & crawl 
        await api.post(
          "/search-and-crawl",
          { query: input, count: 10, max_pages: 1, max_depth: 5 },
          { headers: { "Content-Type": "application/json" } }
        );
      }

      setInput("");
      navigate("/results", { state: { fromScrape: true } });
    } catch (err) {
      console.error("Error starting crawl", err);
      setIsLoading(false);
    }
  };

  // Quick suggestions
  const suggestions = mode === "url" 
    ? ["https://www.bbc.com/", "https://news.un.org/", "https://producthunt.com"]
    : ["businessman in Rajshahi", "latest AI news", "BD news"];

  return (
    <div className="w-full my-12">
      {/* Mode Selector with AI Style */}
      <div className="flex justify-center mb-8">
        <div className="relative inline-flex items-center p-1 rounded-2xl bg-gray-900/50 backdrop-blur-sm border border-gray-700/50">
          {/* Background Glow */}
          <motion.div 
            className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-xl"
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          
          {/* Toggle Buttons */}
          {["url", "search"].map((tab) => (
            <button
              key={tab}
              className={`relative z-10 px-8 py-3 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${
                mode === tab
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "text-gray-400 hover:text-gray-300 hover:bg-gray-800/50"
              }`}
              onClick={() => setMode(tab)}
              disabled={isLoading}
            >
              {tab === "url" ? (
                <>
                  <Globe className="w-4 h-4" />
                  Direct URL
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Search Anything
                </>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Form Container */}
      <motion.form
        onSubmit={handleSubmit}
        className="relative group"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        {/* Outer Glow Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-all duration-700 group-hover:duration-300" />
        
        {/* Form Container */}
        <div className="relative bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 shadow-2xl">
          {/* Form Content */}
          <div className="flex flex-col gap-4 items-center">
            {/* Input Container */}
            <div className="relative flex-1 w-full">
              {/* Input Field with Animated Border */}
              <motion.div
                className="relative"
                animate={{
                  scale: inputFocus ? 1.01 : 1,
                }}
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-30" />
                
                <div className="relative flex items-center">
                  <div className="absolute left-4">
                    {mode === "url" ? (
                      <Globe className="w-5 h-5 text-blue-400" />
                    ) : (
                      <Search className="w-5 h-5 text-purple-400" />
                    )}
                  </div>
                  
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onFocus={() => setInputFocus(true)}
                    onBlur={() => setInputFocus(false)}
                    placeholder={
                      mode === "url" 
                        ? "Enter website URL (e.g., https://example.com)" 
                        : "Enter search query (e.g., web scraping tools)"
                    }
                    className="w-full pl-12 pr-6 py-5 rounded-xl bg-gray-900/90 border-2 border-gray-700/50 text-gray-200 placeholder-gray-500 text-lg focus:outline-none focus:border-blue-500/50 focus:bg-gray-900 transition-all duration-300"
                    disabled={isLoading}
                    required
                  />
                  
                  {/* Animated Particles around input */}
                  {inputFocus && (
                    <>
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="absolute w-1 h-1 bg-blue-400 rounded-full"
                          style={{
                            right: `${10 + i * 8}px`,
                            top: "50%",
                          }}
                          animate={{
                            scale: [0, 1, 0],
                            opacity: [0, 1, 0],
                          }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: i * 0.2,
                          }}
                        />
                      ))}
                    </>
                  )}
                </div>
              </motion.div>

              {/* Quick Suggestions */}
              <div className="flex flex-wrap gap-2 mt-4">
                {suggestions.map((suggestion, index) => (
                  <motion.button
                    key={index}
                    type="button"
                    onClick={() => setInput(suggestion)}
                    className="px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700/30 text-sm text-gray-400 hover:text-gray-300 hover:bg-gray-700/50 hover:border-gray-600/50 transition-all duration-300 flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Zap className="w-3 h-3" />
                    {suggestion}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              className="relative overflow-hidden  px-10 py-5  rounded-xl font-semibold text-lg shadow-2xl group/btn"
              whileHover={!isLoading ? { scale: 1.05 } : {}}
              whileTap={!isLoading ? { scale: 0.95 } : {}}
            >
              {/* Button Glow */}
              <div className="absolute bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl blur opacity-50 group-hover/btn:opacity-70 transition duration-500" />
              
              {/* Button Content */}
              <div className="relative -inset-1 flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl px-8 py-4">
                {isLoading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader2 className="w-6 h-6 text-white" />
                    </motion.div>
                    <span className="text-white font-medium">Processing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6 text-white" />
                    <span className="text-white font-medium">
                      {mode === "url" ? "Start Scrape" : "Search & Scrape"}
                    </span>
                    <motion.div
                      className="absolute -right-2 -top-2 w-4 h-4 bg-yellow-400 rounded-full"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  </>
                )}
              </div>

              {/* Button Particles */}
              {!isLoading && (
                <>
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-white rounded-full"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                      }}
                      animate={{
                        y: [0, -30],
                        opacity: [0, 1, 0],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.5,
                      }}
                    />
                  ))}
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.form>

      {/* Animated Progress Indicator */}
      <AnimatePresence>
        {progress && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="relative mt-8"
          >
            {/* Progress Container Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-2xl blur-xl" />
            
            {/* Progress Container */}
            <div className="relative bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 shadow-xl">
              {/* Progress Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Cpu className="w-6 h-6 text-blue-400" />
                    <motion.div
                      className="absolute -inset-2 bg-blue-500/20 rounded-full blur"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-100">
                    Live Scraping Progress
                  </h3>
                </div>
                
                <motion.div
                  className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${
                    progress.status === "finished"
                      ? "bg-gradient-to-r from-green-900/30 to-emerald-900/30 text-green-400 border border-green-500/30"
                      : progress.status === "error"
                      ? "bg-gradient-to-r from-red-900/30 to-pink-900/30 text-red-400 border border-red-500/30"
                      : "bg-gradient-to-r from-blue-900/30 to-purple-900/30 text-blue-400 border border-blue-500/30"
                  }`}
                  animate={
                    progress.status === "running" 
                      ? { scale: [1, 1.05, 1] }
                      : {}
                  }
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {progress.status === "finished" && <CheckCircle className="w-4 h-4" />}
                  {progress.status === "error" && <XCircle className="w-4 h-4" />}
                  {progress.status}
                </motion.div>
              </div>

              {/* Progress Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/30">
                  <div className="text-sm text-gray-400 mb-1">Pages Scraped</div>
                  <div className="text-2xl font-bold text-blue-400">{progress.done || 0}</div>
                </div>
                <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/30">
                  <div className="text-sm text-gray-400 mb-1">Total Pages</div>
                  <div className="text-2xl font-bold text-purple-400">{progress.total || 0}</div>
                </div>
                <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/30">
                  <div className="text-sm text-gray-400 mb-1">Success Rate</div>
                  <div className="text-2xl font-bold text-green-400">
                    {progress.total > 0 
                      ? `${Math.round((progress.done / progress.total) * 100)}%` 
                      : "0%"}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/30">
                  <div className="text-sm text-gray-400 mb-1">Speed</div>
                  <div className="text-2xl font-bold text-yellow-400">Fast</div>
                </div>
              </div>

              {/* Animated Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Scraping Progress</span>
                  <span>
                    {progress.total > 0 
                      ? `${Math.round((progress.done / progress.total) * 100)}%`
                      : "0%"}
                  </span>
                </div>
                <div className="relative h-3 rounded-full bg-gray-800/70 overflow-hidden">
                  {/* Progress Bar Glow */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  
                  {/* Progress Bar Fill */}
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 relative"
                    initial={{ width: 0 }}
                    animate={{
                      width: progress.total > 0 
                        ? `${(progress.done / progress.total) * 100}%` 
                        : "0%"
                    }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  >
                    {/* Progress Bar Sparkles */}
                    {progress.status === "running" && (
                      <>
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="absolute top-0 w-1 h-3 bg-white rounded-full"
                            style={{
                              left: `${Math.random() * 100}%`,
                            }}
                            animate={{
                              y: [0, -10, 0],
                              opacity: [0, 1, 0],
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              delay: i * 0.5,
                            }}
                          />
                        ))}
                      </>
                    )}
                  </motion.div>
                </div>
              </div>

              {/* Current URL */}
              {progress.current_url && (
                <div className="flex items-center p-4 rounded-xl bg-gray-800/50 border border-gray-700/30">
                  <ExternalLink className="w-5 h-5 text-blue-400 mr-3 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-sm text-gray-400 mb-1">Currently Scraping</div>
                    <div className="text-gray-300 font-mono text-sm truncate">
                      {progress.current_url}
                    </div>
                  </div>
                  <motion.div
                    className="w-2 h-2 bg-green-400 rounded-full"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FormData;