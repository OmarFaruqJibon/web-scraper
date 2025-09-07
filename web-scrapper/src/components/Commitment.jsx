// src/components/Commitment.jsx
import { motion } from "framer-motion";
import { Shield, Users, TrendingUp } from "lucide-react";

const Commitment = () => {
  const commitments = [
    {
      icon: <Shield className="text-blue-400" size={36} />,
      title: "Business Compliance and Development",
      description:
        "Ensure that employees are secure with our comprehensive compliance framework.",
    },
    {
      icon: <Users className="text-purple-400" size={36} />,
      title: "Working Skills",
      description:
        "Empower your team with AI-enhanced skills development and training.",
    },
    {
      icon: <TrendingUp className="text-pink-400" size={36} />,
      title: "Intelligent Builders",
      description:
        "Leverage our AI tools to build smarter business solutions faster.",
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
        [background-size:40px_40px]"
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
            Our Commitment to Excellence
          </h2>
          <p className="text-gray-400 max-w-3xl mx-auto">
            We provide the tools and expertise to transform your business
            through AI-powered solutions.
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
          className="mt-20 relative bg-slate-900/60 backdrop-blur-xl rounded-2xl p-10 text-center border border-slate-700/50"
        >
          <h3 className="text-2xl font-bold mb-4 text-white">
            Improve, Supply, and Customer Controls
          </h3>
          <p className="text-gray-400 mb-8">
            To ensure that employees are secure and your business operations are
            optimized.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-full font-medium shadow-lg hover:shadow-blue-500/30 transition"
          >
            Learn More
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default Commitment;
