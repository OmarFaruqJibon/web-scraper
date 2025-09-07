// src/components/Navbar.jsx
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-slate-900 shadow-lg fixed w-full z-50 border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <span className="text-2xl font-bold">🕷️ WebCrawler AI</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            {/* <a href="#solutions" className="text-slate-300 hover:text-blue-400 transition-colors">Solutions</a>
            <a href="#commitment" className="text-slate-300 hover:text-blue-400 transition-colors">Commitment</a>
            <a href="#testimonials" className="text-slate-300 hover:text-blue-400 transition-colors">Testimonials</a>
            <a href="#pricing" className="text-slate-300 hover:text-blue-400 transition-colors">Pricing</a>
            <a href="#faq" className="text-slate-300 hover:text-blue-400 transition-colors">FAQ</a> */}
            <button className="px-4 py-1.5 rounded font-semibold shadow-lg transition-all duration-300 relative overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600">
              Sign In
            </button>
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
        <div className="md:hidden bg-slate-800 border-b border-slate-700">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a href="#solutions" className="block px-3 py-2 text-slate-300 rounded-md hover:text-blue-400">Solutions</a>
            <a href="#commitment" className="block px-3 py-2 text-slate-300 rounded-md hover:text-blue-400">Commitment</a>
            <a href="#testimonials" className="block px-3 py-2 text-slate-300 rounded-md hover:text-blue-400">Testimonials</a>
            <a href="#pricing" className="block px-3 py-2 text-slate-300 rounded-md hover:text-blue-400">Pricing</a>
            <a href="#faq" className="block px-3 py-2 text-slate-300 rounded-md hover:text-blue-400">FAQ</a>
            <button className="w-full mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
              Get Started
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;