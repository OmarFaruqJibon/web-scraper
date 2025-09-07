// src/components/Footer.jsx
import { motion } from 'framer-motion';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-300 py-12 px-4 border-t border-slate-800">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-2xl font-bold mb-4 text-blue-400">EclipseAI</h3>
            <p className="text-slate-400 mb-4">
              AI-powered solutions for accelerated business growth.
            </p>
            <div className="flex space-x-4">
              <motion.a whileHover={{ scale: 1.1 }} href="#" className="text-slate-400 hover:text-blue-400 transition-colors">
                <Facebook size={20} />
              </motion.a>
              <motion.a whileHover={{ scale: 1.1 }} href="#" className="text-slate-400 hover:text-blue-400 transition-colors">
                <Twitter size={20} />
              </motion.a>
              <motion.a whileHover={{ scale: 1.1 }} href="#" className="text-slate-400 hover:text-blue-400 transition-colors">
                <Instagram size={20} />
              </motion.a>
              <motion.a whileHover={{ scale: 1.1 }} href="#" className="text-slate-400 hover:text-blue-400 transition-colors">
                <Linkedin size={20} />
              </motion.a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-slate-100">Solutions</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">AI Analytics</a></li>
              <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">Process Automation</a></li>
              <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">Customer Insights</a></li>
              <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">Predictive Modeling</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-slate-100">Company</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">About Us</a></li>
              <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">Careers</a></li>
              <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">Blog</a></li>
              <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-slate-100">Resources</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">Documentation</a></li>
              <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">API Reference</a></li>
              <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">Community</a></li>
              <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">Support</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-slate-800 text-center text-slate-500">
          <p>© {new Date().getFullYear()} EclipseAI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;