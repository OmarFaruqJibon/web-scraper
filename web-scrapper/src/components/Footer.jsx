// src/components/Footer.jsx
import { motion } from "framer-motion";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative bg-gradient-to-b from-black via-[#0a0a12] to-black text-gray-300 py-16 px-4 border-t border-slate-800">
      <div className="max-w-7xl mx-auto">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold mb-4 text-blue-400">EclipseAI</h3>
            <p className="text-gray-400 mb-6">
              AI-powered solutions for accelerated business growth.
            </p>
            <div className="flex space-x-4">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <motion.a
                  key={i}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                  href="#"
                  className="text-gray-400 hover:text-blue-400 transition-colors"
                >
                  <Icon size={22} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Solutions */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Solutions</h4>
            <ul className="space-y-2">
              {["AI Analytics", "Process Automation", "Customer Insights", "Predictive Modeling"].map(
                (item, i) => (
                  <li key={i}>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Company</h4>
            <ul className="space-y-2">
              {["About Us", "Careers", "Blog", "Contact"].map((item, i) => (
                <li key={i}>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-blue-400 transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Resources</h4>
            <ul className="space-y-2">
              {["Documentation", "API Reference", "Community", "Support"].map(
                (item, i) => (
                  <li key={i}>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>

        {/* Divider + Bottom */}
        <div className="pt-8 border-t border-slate-800 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} EclipseAI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
