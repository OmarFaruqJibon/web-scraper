// src/components/Navbar.jsx
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-slate-900 shadow-lg fixed w-full z-50 border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to={"/"}><span className="text-2xl font-bold">WebCrawler AI</span></Link>
          </div>
           
          <div className="hidden md:flex items-center space-x-8">
            {/* <a href="#solutions" className="text-slate-300 hover:text-blue-400 transition-colors">Solutions</a>
            <a href="#commitment" className="text-slate-300 hover:text-blue-400 transition-colors">Commitment</a>
            <a href="#testimonials" className="text-slate-300 hover:text-blue-400 transition-colors">Testimonials</a>
            <a href="#pricing" className="text-slate-300 hover:text-blue-400 transition-colors">Pricing</a>
            <a href="#faq" className="text-slate-300 hover:text-blue-400 transition-colors">FAQ</a> */}

            <Link
              to={"/results"}
              className="px-4 py-1.5 rounded font-semibold shadow-lg transition-all duration-300 relative overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
            >
              Scraped Data
            </Link>
          </div>
          
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-300">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-slate-800 border-b border-slate-700 min-h-20">
          <div className="px-2 pt-6 pb-3 space-y-1 sm:px-3">
            <Link
              to={"/results"}
              className="sm:mt-7 px-4 py-1.5 rounded font-semibold shadow-lg transition-all duration-300 relative overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
            >
              Scraped Data
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;