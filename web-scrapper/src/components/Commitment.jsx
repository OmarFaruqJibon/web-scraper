// src/components/Commitment.jsx
import { motion } from 'framer-motion';
import { Shield, Users, TrendingUp } from 'lucide-react';

const Commitment = () => {
  const commitments = [
    {
      icon: <Shield className="text-blue-400" size={32} />,
      title: "Business Compliance and Development",
      description: "Ensure that employees are secure with our comprehensive compliance framework."
    },
    {
      icon: <Users className="text-blue-400" size={32} />,
      title: "Working Skills",
      description: "Empower your team with AI-enhanced skills development and training."
    },
    {
      icon: <TrendingUp className="text-blue-400" size={32} />,
      title: "Intelligent Builders",
      description: "Leverage our AI tools to build smarter business solutions faster."
    }
  ];

  return (
    <section id="commitment" className="py-16 px-4 bg-slate-900">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-100 mb-4">Our Commitment to Excellence</h2>
          <p className="text-slate-400 max-w-3xl mx-auto">
            We provide the tools and expertise to transform your business through AI-powered solutions.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {commitments.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-blue-400/30 transition-colors glow-effect"
            >
              <div className="mb-4">{item.icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-slate-100">{item.title}</h3>
              <p className="text-slate-400">{item.description}</p>
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-16 bg-slate-800 rounded-2xl p-8 text-center border border-slate-700 glow-effect"
        >
          <h3 className="text-2xl font-bold mb-4 text-slate-100">Improve, Supply, and Customer Controls</h3>
          <p className="text-slate-400 mb-6">
            To ensure that employees are secure and your business operations are optimized.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-blue-500 text-white px-6 py-3 rounded-full font-medium"
          >
            Learn More
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default Commitment;