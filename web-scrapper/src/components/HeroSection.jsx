// src/components/HeroSection.jsx
import { motion } from "framer-motion";
import FormData from "./FormData";

const HeroSection = ({ isLoaded, fetchData }) => {
  return (
    <section className="pt-32 pb-16 px-4 relative hero-glow">
      {/* Background gradient elements for glow effect */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full filter blur-3xl opacity-30 animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full filter blur-3xl opacity-30 animate-pulse-slow animation-delay-2000"></div>

      <div className="max-w-7xl mx-auto relative z-10 ">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mt-7 mb-20"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-100 mb-6">
            Extract Any Data from Any Website
          </h1>

          <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
            Paste a link and let our AI-powered scraper fetch structured data
            for you — no coding required.
          </p>

          {/* <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <div className="w-full max-w-xl mx-auto">
              <FormData onSuccess={fetchData} />
            </div>
          </div> */}

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="w-full max-w-3xl mx-auto my-22"
          >
            <FormData onSuccess={fetchData} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
