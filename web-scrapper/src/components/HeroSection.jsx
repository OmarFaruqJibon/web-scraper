// src/components/HeroSection.jsx
import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import FormData from "./FormData";
import { 
  Globe, 
  Cpu, 
  Zap, 
  Code, 
  Network, 
  Sparkles,
  Database,
  Terminal,
  ChevronRight,
  Activity
} from "lucide-react";

const HeroSection = ({ isLoaded, fetchData }) => {
  const [activeNodes, setActiveNodes] = useState([]);
  const [crawlingPath, setCrawlingPath] = useState([]);
  const [dataStream, setDataStream] = useState([]);
  const containerRef = useRef(null);

  // Generate network nodes
  useEffect(() => {
    const nodes = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      pulse: Math.random() * 2 + 1,
      delay: Math.random() * 2,
      isActive: false
    }));
    setActiveNodes(nodes);

    // Activate random nodes periodically
    const interval = setInterval(() => {
      setActiveNodes(prev => prev.map(node => ({
        ...node,
        isActive: Math.random() > 0.7
      })));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Generate crawling path animation
  useEffect(() => {
    const path = [];
    for (let i = 0; i < 50; i++) {
      path.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: i * 0.1
      });
    }
    setCrawlingPath(path);

    // Simulate data stream
    const dataInterval = setInterval(() => {
      const newData = {
        id: Date.now(),
        type: ['json', 'html', 'csv', 'api'][Math.floor(Math.random() * 4)],
        url: `https://example${Math.floor(Math.random() * 100)}.com`,
        size: `${Math.floor(Math.random() * 1000)}KB`,
        timestamp: Date.now()
      };
      
      setDataStream(prev => [newData, ...prev.slice(0, 8)]);
    }, 800);

    return () => clearInterval(dataInterval);
  }, []);

  // Animated terminal-like text
  const terminalLines = [
    "> Initializing web crawler...",
    "> Scanning target domain...",
    "> Extracting structured data...",
    "> Processing with AI engine...",
    "> Formatting results..."
  ];

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Animated Background Grid */}
      <div className="absolute inset-0">
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(147, 51, 234, 0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(147, 51, 234, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            maskImage: 'radial-gradient(circle at center, black, transparent 70%)'
          }}
        />
        
        {/* Animated Nodes Network */}
        <div className="absolute inset-0">
          {activeNodes.map((node) => (
            <motion.div
              key={node.id}
              className="absolute rounded-full"
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
                width: `${node.size}px`,
                height: `${node.size}px`,
                background: node.isActive 
                  ? 'radial-gradient(circle, rgba(147, 51, 234, 0.8) 0%, rgba(59, 130, 246, 0.4) 50%, transparent 100%)'
                  : 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)'
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: node.pulse,
                delay: node.delay,
                repeat: Infinity
              }}
            />
          ))}
        </div>

        {/* Crawling Path Animation */}
        <div className="absolute inset-0">
          {crawlingPath.map((point, index) => (
            <motion.div
              key={point.id}
              className="absolute w-[2px] h-[2px] bg-blue-400 rounded-full"
              style={{
                left: `${point.x}%`,
                top: `${point.y}%`,
                boxShadow: '0 0 10px 2px rgba(59, 130, 246, 0.8)'
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [0, 1, 0],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 1.5,
                delay: point.delay,
                repeat: Infinity,
                repeatDelay: 2
              }}
            />
          ))}
        </div>

        {/* Data Stream Lines */}
        <div className="absolute inset-0">
          {Array.from({ length: 10 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-[1px] h-20 bg-gradient-to-b from-transparent via-blue-500/30 to-transparent"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-20px'
              }}
              animate={{
                y: ['0vh', '100vh'],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                delay: Math.random() * 2,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Main Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* AI Badge */}
            {/* <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 mb-6"
              whileHover={{ scale: 1.05 }}
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-semibold text-purple-300">
                AI-Powered Web Scraper
              </span>
            </motion.div> */}

            {/* Main Heading */}
            <h1 className="text-5xl lg:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Unlock Structured 
              </span>
              <br />
              <span className="text-white">Insights From Any Website</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-gray-300 mb-8 leading-relaxed">
              Extract structured data from any website with our advanced AI. 
              No coding required—just point, click, and collect.
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {[
                { icon: Cpu, text: "AI-Powered Parsing", color: "text-purple-400" },
                { icon: Zap, text: "Real-time Processing", color: "text-blue-400" },
                { icon: Globe, text: "Global Crawling", color: "text-green-400" },
                { icon: Database, text: "Multiple Formats", color: "text-pink-400" }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10"
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.1)' }}
                >
                  <feature.icon className={`w-5 h-5 ${feature.color}`} />
                  <span className="text-sm font-medium text-gray-200">
                    {feature.text}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Call to Action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="w-full max-w-2xl"
            >
              <FormData onSuccess={fetchData} />
            </motion.div>
          </motion.div>

          {/* Right Column - Live Animation Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            {/* Terminal Window */}
            <div className="relative backdrop-blur-xl bg-gray-900/30 border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
              {/* Terminal Header */}
              <div className="flex items-center gap-2 mb-6">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <Terminal className="w-4 h-4 text-gray-400 ml-2" />
                <span className="text-sm font-medium text-gray-300 ml-2">
                  Live Crawler Terminal
                </span>
                <Activity className="w-4 h-4 text-green-500 ml-auto animate-pulse" />
              </div>

              {/* Terminal Content */}
              <div className="font-mono text-sm space-y-2">
                {terminalLines.map((line, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center text-gray-400"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.5 }}
                  >
                    <ChevronRight className="w-3 h-3 text-green-500 mr-2" />
                    <span>{line}</span>
                    {index === terminalLines.length - 1 && (
                      <motion.span
                        className="ml-1 w-2 h-4 bg-green-500"
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity }}
                      />
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Data Stream Preview */}
              <div className="mt-8 pt-6 border-t border-gray-700/50">
                <div className="flex items-center gap-2 mb-4">
                  <Database className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium text-gray-300">
                    Live Data Stream
                  </span>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {dataStream.map((item) => (
                    <motion.div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-black/30 border border-gray-800/50"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          item.type === 'json' ? 'bg-green-500' :
                          item.type === 'html' ? 'bg-blue-500' :
                          item.type === 'csv' ? 'bg-yellow-500' : 'bg-purple-500'
                        }`} />
                        <span className="text-xs font-medium text-gray-300">
                          {item.type.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 truncate max-w-[120px]">
                        {item.url}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.size}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Network Visualization */}
              <div className="mt-8 relative h-32 rounded-lg overflow-hidden bg-black/50 border border-gray-800/50">
                {activeNodes.slice(0, 10).map((node) => (
                  <motion.div
                    key={`vis-${node.id}`}
                    className="absolute w-1 h-1 rounded-full bg-blue-500"
                    style={{
                      left: `${node.x}%`,
                      top: `${node.y}%`,
                      boxShadow: node.isActive 
                        ? '0 0 10px 2px rgba(59, 130, 246, 0.8)'
                        : '0 0 4px 1px rgba(59, 130, 246, 0.4)'
                    }}
                    animate={{
                      scale: node.isActive ? [1, 1.5, 1] : 1
                    }}
                    transition={{ duration: 0.5 }}
                  />
                ))}
                {/* Connection Lines */}
                <svg className="absolute inset-0 w-full h-full">
                  {activeNodes.slice(0, 5).map((node, i) => (
                    activeNodes[i + 1] && (
                      <motion.line
                        key={`line-${i}`}
                        x1={`${node.x}%`}
                        y1={`${node.y}%`}
                        x2={`${activeNodes[i + 1].x}%`}
                        y2={`${activeNodes[i + 1].y}%`}
                        stroke="rgba(59, 130, 246, 0.3)"
                        strokeWidth="0.5"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )
                  ))}
                </svg>
              </div>
            </div>

            {/* Floating Elements */}
            <motion.div
              className="absolute -top-4 -right-4 w-32 h-32 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 blur-xl"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <motion.div
              className="absolute -bottom-6 -left-6 w-40 h-40 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 blur-xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.4, 0.2]
              }}
              transition={{ duration: 4, repeat: Infinity, delay: 1 }}
            />
          </motion.div>
        </div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-[1px] h-[1px] bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
            animate={{
              y: [0, -100],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 5
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSection;