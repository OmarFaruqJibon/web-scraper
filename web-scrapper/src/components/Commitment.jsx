// src/components/Commitment.jsx
import { motion } from "framer-motion";
import { Sparkles, ChartColumnDecreasing, Download } from "lucide-react";
import Workflow from "../assets/Workflow.png";

const Commitment = () => {
  const commitments = [
    { 
      icon: <Sparkles className="text-blue-400" size={36} />,
      title: "Fast Extraction",
      description:
        "Get results in seconds with our optimized scraping pipeline",
    },
    { 
      icon: <ChartColumnDecreasing className="text-purple-400" size={36} />,
      title: "Structured Data",
      description:
        "Emails, phones, names, locations, and more — neatly organized",
    },
    { 
      icon: <Download className="text-pink-400" size={36} />,
      title: "Export Ready",
      description:
        "Download your scraped data as CSV or PDF with one click",
    },
  ];

  return (
    <section
      id="commitment"
      className="relative py-20 px-4 overflow-hidden bg-gradient-to-b from-black via-[#0a0a12] to-black"
    >
      {/* Background Grid Pattern */}
      <div
        className="absolute inset-0 
        bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)]
        [background-size:60px_60px]"
      ></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            No Code Required - Easy Integration
          </h2>
          <p className="text-gray-400 max-w-3xl mx-auto">
            Start instantly without writing code. Your automation tools can seamlessly connect to our powerful extraction engine.
          </p>
        </motion.div>

        {/* Commitment Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {commitments.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative bg-slate-900/50 backdrop-blur-xl p-8 rounded-2xl border border-slate-700/50 
                hover:border-blue-400/40 transition-colors group"
            >
              <div className="mb-4">{item.icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-white">
                {item.title}
              </h3>
              <p className="text-gray-400">{item.description}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-8 mt-20 relative bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 text-center border border-slate-700/50"
        >
          <div>
            <h3 className="text-2xl text-left font-bold mb-4 text-white">
            Natural Language Workflow Orchestration
          </h3>
          <p className="text-gray-400 text-left">
            Design data workflows with nodes and prompts—no coding needed. More accurate <br />  than Agents, smarter than RPA, 90% cheaper.
          </p>
          </div>
          <div>
            <img width={550} src={Workflow} alt="Workflow_diagram" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Commitment;
