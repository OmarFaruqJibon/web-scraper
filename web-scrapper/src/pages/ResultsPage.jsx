// src/pages/ResultsPage.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import DemoSection from '../components/DemoSection';
import api from "../callApi";
import { 
  Cpu, 
  Database, 
  Zap, 
  Network, 
  Sparkles, 
  Activity,
  BarChart3,
  Globe,
  Server,
  Terminal,
  ChevronRight
} from 'lucide-react';

const ResultsPage = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(null);
  const [showProgress, setShowProgress] = useState(false);
  const [processingStats, setProcessingStats] = useState({
    patternsFound: 0,
    dataPoints: 0,
    confidence: 0,
    speed: 0
  });
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fromScrape = location.state?.fromScrape;

    if (fromScrape) {
      setShowProgress(true);
      setIsLoading(true);
      
      const interval = setInterval(() => {
        setProcessingStats(prev => ({
          patternsFound: prev.patternsFound + Math.floor(Math.random() * 5),
          dataPoints: prev.dataPoints + Math.floor(Math.random() * 10),
          confidence: Math.min(prev.confidence + Math.random() * 3, 98),
          speed: prev.speed + Math.random() * 2
        }));
      }, 800);

      return () => clearInterval(interval);
    } else {
      fetchData();
    }
  }, [location]);

  useEffect(() => {
    if (showProgress) {
      startProgressMonitoring();
    }
  }, [showProgress]);

  const startProgressMonitoring = () => {
    let interval;

    const fetchProgress = async () => {
      try {
        const res = await api.get("/progress");

        const jobs = res.data?.progress || [];
        const latest = jobs[jobs.length - 1] || null;

        setProgress(latest);

        if (
          latest &&
          (latest.status === "finished" || latest.status === "error")
        ) {
          clearInterval(interval);
          setTimeout(() => {
            setIsLoading(false);
            setShowProgress(false);
            fetchData();
          }, 1500);
        }
      } catch (err) {
        console.error("Error fetching progress", err);
        clearInterval(interval);
        setIsLoading(false);
        setShowProgress(false);
      }
    };

    fetchProgress();
    interval = setInterval(fetchProgress, 3000);

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

  // Animated network nodes
  const [networkNodes, setNetworkNodes] = useState([]);
  useEffect(() => {
    const nodes = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 2,
      isActive: Math.random() > 0.5
    }));
    setNetworkNodes(nodes);

    const interval = setInterval(() => {
      setNetworkNodes(prev => prev.map(node => ({
        ...node,
        isActive: Math.random() > 0.7
      })));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-slate-100 overflow-hidden">
      <Navbar />

      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Data Stream Lines */}
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-[1px] h-32 bg-gradient-to-b from-transparent via-blue-500/20 to-transparent"
            style={{
              left: `${Math.random() * 100}%`,
              top: '-32px'
            }}
            animate={{
              y: ['0vh', '100vh'],
              opacity: [0, 0.5, 0]
            }}
            transition={{
              duration: Math.random() * 4 + 3,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "linear"
            }}
          />
        ))}

        {/* Network Nodes */}
        <div className="absolute inset-0">
          {networkNodes.map((node) => (
            <motion.div
              key={node.id}
              className="absolute rounded-full"
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
                width: `${node.size}px`,
                height: `${node.size}px`,
                background: node.isActive 
                  ? 'radial-gradient(circle, rgba(59, 130, 246, 0.8) 0%, rgba(147, 51, 234, 0.4) 50%, transparent 70%)'
                  : 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)'
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.8, 0.3]
              }}
              transition={{
                duration: 2,
                delay: node.delay,
                repeat: Infinity
              }}
            />
          ))}
        </div>
      </div>

      {/* Header */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background Glow */}
        <motion.div 
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* Title */}
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 mb-8">
              <Database className="w-5 h-5 text-blue-400" />
              <span className="text-sm font-medium text-gray-300">
                {showProgress ? 'AI PROCESSING LIVE' : 'DATA COLLECTION'}
              </span>
              {!showProgress && (
                <motion.div
                  className="w-2 h-2 rounded-full bg-green-500"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                {showProgress ? 'AI Processing' : 'Results'}
              </span>
            </h1>

            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
              {showProgress
                ? 'Our AI neural networks are actively extracting and structuring web data in real-time'
                : 'Browse through structured data extracted by our AI-powered web crawler'}
            </p>

            {/* Stats Overview */}
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {[
                { icon: Database, label: 'Total Datasets', value: data.length, color: 'text-blue-400' },
                { icon: Server, label: 'Pages Processed', value: progress?.total || 0, color: 'text-purple-400' },
                { icon: Activity, label: 'AI Confidence', value: `${Math.round(processingStats.confidence)}%`, color: 'text-green-400' },
                { icon: Zap, label: 'Processing Speed', value: `${processingStats.speed.toFixed(1)}x`, color: 'text-yellow-400' }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="p-4 rounded-xl bg-gray-900/50 backdrop-blur-sm border border-gray-700/50"
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.05)' }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    <span className="text-sm text-gray-400">{stat.label}</span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {stat.value}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* AI Processing Section */}
      {showProgress && (
        <section className="py-12 px-4 relative">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative group"
            >
              {/* Outer Glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl blur-xl opacity-30" />
              
              {/* Main Container */}
              <div className="relative bg-gray-900/80 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 shadow-2xl">
                {/* Terminal Header */}
                <div className="flex items-center gap-3 mb-8">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <Terminal className="w-5 h-5 text-blue-400" />
                  <span className="text-lg font-semibold text-gray-300">Live AI Processor</span>
                  <motion.div
                    className="ml-auto flex items-center gap-2 px-3 py-1 rounded-full bg-green-900/30 border border-green-500/30"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm font-medium text-green-400">Active</span>
                  </motion.div>
                </div>

                {/* Progress Visualizer */}
                <div className="space-y-6">
                  {/* Neural Network Visualization */}
                  <div className="relative h-40 rounded-xl bg-black/50 border border-gray-800/50 overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative w-full h-20">
                        {/* Neural Network Lines */}
                        {Array.from({ length: 8 }).map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute h-1 bg-gradient-to-r from-blue-500/30 to-purple-500/30"
                            style={{
                              left: `${i * 12.5}%`,
                              top: '50%',
                              width: '12%'
                            }}
                            animate={{
                              width: ['0%', '12%', '0%']
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              delay: i * 0.2
                            }}
                          />
                        ))}
                        
                        {/* Processing Nodes */}
                        {[0, 25, 50, 75, 100].map((pos, i) => (
                          <motion.div
                            key={i}
                            className="absolute w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                            style={{
                              left: `${pos}%`,
                              top: '50%',
                              transform: 'translate(-50%, -50%)'
                            }}
                            animate={{
                              scale: [1, 1.5, 1],
                              boxShadow: [
                                '0 0 10px rgba(59, 130, 246, 0.5)',
                                '0 0 20px rgba(147, 51, 234, 0.8)',
                                '0 0 10px rgba(59, 130, 246, 0.5)'
                              ]
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              delay: i * 0.3
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bars */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm text-gray-400 mb-2">
                        <span className="flex items-center gap-2">
                          <Cpu className="w-4 h-4" />
                          Pattern Recognition
                        </span>
                        <span>{processingStats.patternsFound} patterns</span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-800/70 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${(processingStats.patternsFound % 100)}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm text-gray-400 mb-2">
                        <span className="flex items-center gap-2">
                          <BarChart3 className="w-4 h-4" />
                          Data Extraction
                        </span>
                        <span>{processingStats.dataPoints} data points</span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-800/70 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${(processingStats.dataPoints % 100)}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm text-gray-400 mb-2">
                        <span className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          AI Confidence
                        </span>
                        <span>{Math.round(processingStats.confidence)}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-800/70 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-green-500 to-cyan-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${processingStats.confidence}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Current Activity */}
                  {progress && (
                    <motion.div
                      className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/50"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-blue-400" />
                        <div className="flex-1">
                          <div className="text-sm text-gray-400 mb-1">Currently Processing</div>
                          <div className="text-gray-300 font-mono text-sm truncate">
                            {progress.current_url || progress.url}
                          </div>
                        </div>
                        <motion.div
                          className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/30 border border-blue-500/30"
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          <span className="text-xs font-medium text-blue-400">
                            {progress.done || 0}/{progress.total || 0}
                          </span>
                          <ChevronRight className="w-3 h-3 text-blue-400" />
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Processing Terminal Output */}
                <div className="mt-8 pt-6 border-t border-gray-800/50">
                  <div className="font-mono text-sm space-y-1">
                    {[
                      "> Initializing neural networks...",
                      "> Scanning target structure...",
                      "> Extracting data patterns...",
                      "> Processing semantic analysis...",
                      "> Structuring output data...",
                      "> Validating data integrity..."
                    ].map((line, index) => (
                      <motion.div
                        key={index}
                        className="text-gray-400"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.3 }}
                      >
                        {line}
                        {index === 5 && (
                          <motion.span
                            className="ml-1 w-2 h-4 bg-green-500 inline-block"
                            animate={{ opacity: [1, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity }}
                          />
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Results Section */}
      {(!showProgress || data.length > 0) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <DemoSection data={data} fetchData={fetchData} />
        </motion.div>
      )}

      {/* Data Stream Particles */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-[1px] h-[1px] bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
            animate={{
              y: [0, -50],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: Math.random() * 2 + 1,
              repeat: Infinity,
              delay: Math.random() * 3
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ResultsPage;