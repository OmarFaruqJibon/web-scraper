// src/components/Navbar.jsx
import { useState, useEffect } from 'react';
import { Menu, X, Sparkles, Zap, Database, Cpu, Activity, ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState('');
  const location = useLocation();

  useEffect(() => {
    setActiveLink(location.pathname);
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location]);

  const navLinks = [
    // { path: '/', label: 'Home', icon: Zap },
    // { path: '/results', label: 'Scraped Data', icon: Database },
    // { path: '/dashboard', label: 'Dashboard', icon: Activity },
  ];

  return (
    <>
      <motion.nav 
        className="fixed w-full z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Background Glow Effect */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-purple-500/5 blur-xl"
          animate={{ opacity: scrolled ? 0.3 : 0.5 }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Main Navbar */}
        <div className={`relative backdrop-blur-xl transition-all duration-500 ${
          scrolled 
            ? 'bg-gray-900/80 border-b border-gray-700/50' 
            : 'bg-gray-900/40 border-b border-gray-700/30'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              {/* Logo */}
              <motion.div 
                className="flex items-center"
                whileHover={{ scale: 1.05 }}
              >
                <Link to="/" className="flex items-center gap-3 group">
                  {/* Animated Logo Icon */}
                  <div className="relative">
                    <motion.div
                      className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur"
                      animate={{ 
                        scale: [0.5, 1, 0.5],
                        rotate: [0, 180, 360]
                      }}
                      transition={{ 
                        duration: 1, 
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    />
                    <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                      <Cpu className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  
                  {/* Logo Text */}
                  <div className="text-2xl font-bold text-white">
                      WebCrawler AI
                  </div>
                </Link>
              </motion.div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-6">
                {/* Animated Status Indicator */}
                <motion.div 
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-700/50"
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-medium text-gray-300">AI Active</span>
                  <Sparkles className="w-3 h-3 text-yellow-400" />
                </motion.div>

                {/* Navigation Links */}
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = activeLink === link.path;
                  
                  return (
                    <motion.div
                      key={link.path}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        to={link.path}
                        className={`relative px-6 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 flex items-center gap-2 ${
                          isActive
                            ? 'text-white'
                            : 'text-gray-400 hover:text-gray-300'
                        }`}
                        onClick={() => setActiveLink(link.path)}
                      >
                        {isActive && (
                          <>
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-xl blur"
                              animate={{ opacity: [0.3, 0.6, 0.3] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl"
                              layoutId="nav-bg"
                            />
                          </>
                        )}
                        
                        <div className="relative z-10">
                          <Icon className="w-4 h-4" />
                        </div>
                        
                        <span className="relative z-10">{link.label}</span>
                        
                        {isActive && (
                          <motion.div
                            className="relative z-10 ml-2"
                            animate={{ x: [0, 3, 0] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          >
                            <ChevronRight className="w-4 h-4" />
                          </motion.div>
                        )}
                      </Link>
                    </motion.div>
                  );
                })}

                {/* CTA Button */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative group/btn"
                >
                  {/* Button Glow */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl blur opacity-50 group-hover/btn:opacity-70 transition duration-500" />
                  
                  <Link
                    to="/results"
                    className="relative px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg"
                  >
                    <Database className="w-4 h-4" />
                    <span>View Data</span>
                    
                    {/* Button Particles */}
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                          y: [0, -15],
                          opacity: [0, 1, 0],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.5,
                        }}
                      />
                    ))}
                  </Link>
                </motion.div>
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden flex items-center">
                <motion.button 
                  onClick={() => setIsOpen(!isOpen)}
                  className="p-2 rounded-lg bg-gray-800/50 border border-gray-700/50"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {isOpen ? (
                    <X className="w-6 h-6 text-gray-300" />
                  ) : (
                    <Menu className="w-6 h-6 text-gray-300" />
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-x-0 top-16 z-40 md:hidden"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Mobile Menu Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-900/95 backdrop-blur-xl border-b border-gray-700/50 shadow-2xl" />
            
            {/* Mobile Menu Content */}
            <div className="relative px-4 pt-6 pb-8">
              {/* Status Indicator */}
              <div className="mb-6 p-4 rounded-xl bg-gray-800/50 border border-gray-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <motion.div
                      className="w-3 h-3 rounded-full bg-green-500"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <span className="text-sm font-medium text-gray-300">AI Crawler Active</span>
                  </div>
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                </div>
                <div className="mt-2 text-xs text-gray-400">
                  Real-time web scraping in progress
                </div>
              </div>

              {/* Mobile Links */}
              <div className="space-y-2">
                {navLinks.map((link, index) => {
                  const Icon = link.icon;
                  const isActive = activeLink === link.path;
                  
                  return (
                    <motion.div
                      key={link.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        to={link.path}
                        className={`flex items-center gap-3 px-4 py-4 rounded-xl transition-all duration-300 ${
                          isActive
                            ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30'
                            : 'bg-gray-800/30 border border-gray-700/30 hover:bg-gray-800/50'
                        }`}
                        onClick={() => {
                          setActiveLink(link.path);
                          setIsOpen(false);
                        }}
                      >
                        <div className={`p-2 rounded-lg ${
                          isActive 
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600' 
                            : 'bg-gray-700'
                        }`}>
                          <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                        </div>
                        <span className={`font-medium ${
                          isActive ? 'text-white' : 'text-gray-300'
                        }`}>
                          {link.label}
                        </span>
                        {isActive && (
                          <motion.div
                            className="ml-auto"
                            animate={{ x: [0, 5, 0] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          >
                            <ChevronRight className="w-4 h-4 text-blue-400" />
                          </motion.div>
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {/* Mobile CTA Button */}
              <motion.div
                className="mt-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Link
                  to="/results"
                  className="block w-full p-4 rounded-xl text-center font-semibold bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg relative overflow-hidden group"
                  onClick={() => setIsOpen(false)}
                >
                  {/* Button Glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-30 blur transition duration-500" />
                  
                  <div className="relative flex items-center justify-center gap-3">
                    <Database className="w-5 h-5" />
                    <span>View Scraped Data</span>
                  </div>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animated Network Particles (Subtle Background) */}
      <div className="fixed inset-0 pointer-events-none z-40">
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-[1px] h-[1px] bg-blue-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 20}%`,
            }}
            animate={{
              y: [0, 100],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          />
        ))}
      </div>
    </>
  );
};

export default Navbar;