// src/pages/ResultsPage.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import DemoSection from '../components/DemoSection';
import Footer from '../components/Footer';
import api from "../callApi";

const ResultsPage = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(null);
  const [showProgress, setShowProgress] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();


useEffect(() => {
  const fromScrape = location.state?.fromScrape;
  if (fromScrape) {
    setShowProgress(true);
    setIsLoading(true);
    startProgressMonitoring();
  } else {
    fetchData();
  }
}, [location]);

const startProgressMonitoring = () => {
  let interval;

  const fetchProgress = async () => {
    try {
      const res = await api.get("/progress");
      setProgress(res.data);

      if (res.data.status === "finished" || res.data.status === "error") {
        clearInterval(interval);
        setIsLoading(false);
        setShowProgress(false);
        fetchData(); // Refresh data when finished

        // Remove the fromScrape state to prevent showing progress on refresh
        navigate("/results", { replace: true, state: {} });
      }
    } catch (err) {
      console.error("Error fetching progress", err);
      clearInterval(interval);
      setIsLoading(false);
      setShowProgress(false);
    }
  };

  // Fire immediately once
  fetchProgress();

  // Then repeat every 1 min
  interval = setInterval(fetchProgress, 60000);

  return () => clearInterval(interval);
};


  const fetchData = async () => {
    try {
      const response = await api.get("/data");
      setData(response?.data?.dataCollections);
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-slate-100s">
      <Navbar />
      
      {/* AI-Styled Header */}
      <section className="relative pt-28 pb-16 px-4 overflow-hidden bg-gradient-to-b from-black via-[#0A0A1F] to-black">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 
          bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] 
          from-blue-900/10 via-transparent to-transparent">
        </div>
        
        {/* Floating AI Elements */}
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-purple-500/10 rounded-full filter blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-cyan-500/10 rounded-full filter blur-3xl animate-float-medium"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-white">
              <span className="bg-clip-text text-white">
                {showProgress ? 'AI Processing' : 'Scraping Results'}
              </span>
            </h1>
            <p className=" text-gray-300 max-w-2xl mx-auto">
              {showProgress 
                ? 'Our AI is analyzing and extracting data from the website. This may take a few moments'
                : 'View all your previously scraped data results'
              }
            </p>
          </motion.div>
        </div>
      </section>

      {/* Progress Indicator Only show when coming from scraping */}
      {showProgress && (
        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-gray-900/70 backdrop-blur-md p-8 rounded-2xl border border-gray-800 shadow-xl"
            >
              <div className="text-center mb-6">
                <div className="w-20 h-20 mx-auto mb-4 relative">
                  <div className="absolute inset-0 bg-cyan-500/20 rounded-full animate-ping"></div>
                  <div className="absolute inset-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white">AI Processing...</h2>
                <p className="text-gray-400 mt-2">Our neural networks are extracting data patterns</p>
              </div>

              {progress ? (
                <>
                  <div className="mb-6">
                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                      <span>Processing {progress.done}/{progress.total} pages</span>
                      <span>{Math.round((progress.done / progress.total) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2.5">
                      <div 
                        className="h-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-500"
                        style={{ width: `${(progress.done / progress.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {progress.current_url && (
                    <div className="text-center">
                      <p className="text-sm text-gray-400">Currently analyzing:</p>
                      <p className="text-cyan-400 text-sm truncate mt-1">{progress.current_url}</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
                  <p className="text-gray-400 mt-2">Initializing scraping process...</p>
                </div>
              )}
            </motion.div>
          </div>
        </section>
      )}

      {/* Results Section Show when not loading or when we have data */}
      {(!showProgress || data.length > 0) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          
        >
          <DemoSection data={data} fetchData={fetchData} />
        </motion.div>
      )}

      <Footer />
    </div>
  );
};

export default ResultsPage;