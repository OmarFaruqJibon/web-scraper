// src/components/HeroSection.jsx
import { motion } from "framer-motion";
import FormData from "./FormData";

const HeroSection = ({ isLoaded, fetchData }) => {
  return (
    <section className="relative pt-32 pb-20 px-4 overflow-hidden bg-gradient-to-b from-black via-[#050510] to-black">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 
        bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)]
        [background-size:40px_40px]">
      </div>

      {/* Glow Effects */}
      <div className="absolute top-1/3 left-1/4 w-[35rem] h-[35rem] bg-purple-600/20 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-blue-600/20 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>

      {/* Decorative Wave */}
      <div className="absolute bottom-0 left-0 w-full h-40 opacity-10">
        <svg
          viewBox="0 0 1440 320"
          className="w-full h-full text-purple-700"
          fill="currentColor"
          preserveAspectRatio="none"
        >
          <path
            fill="currentColor"
            d="M0,192L48,202.7C96,213,192,235,288,250.7C384,267,480,277,576,256C672,235,768,181,864,176C960,171,1056,213,1152,202.7C1248,192,1344,128,1392,96L1440,64V320H0Z"
          ></path>
        </svg>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mt-7 mb-16"
        >
          <h1 className="text-4xl md:text-4xl lg:text-6xl font-extrabold mb-6 text-white">
            Extract Any Data from Any Website
          </h1>

          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Harness the power of <span className="text-purple-400 font-semibold">AI</span> to fetch structured data from any website —{" "}
            <span className="text-blue-400 font-semibold">no coding required</span>.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full max-w-3xl mx-auto"
          >
            {/* <div className="backdrop-blur-xl bg-slate-900/50 p-4 rounded-2xl shadow-lg border border-slate-700/50"> */}
            <div className="p-0.5">
              <FormData onSuccess={fetchData} />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
