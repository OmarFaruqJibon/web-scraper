// src/components/FAQ.jsx
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      question: "How does the AI technology work?",
      answer:
        "Our AI technology uses machine learning algorithms to analyze your business data, identify patterns, and provide actionable insights to optimize your operations and drive growth.",
    },
    {
      question: "How long does it take to implement?",
      answer:
        "Implementation time varies based on your business size and needs, but most companies can get up and running within 2-4 weeks with our streamlined onboarding process.",
    },
    {
      question: "Is my data secure with your platform?",
      answer:
        "Absolutely. We employ enterprise-grade security measures including encryption, regular security audits, and compliance with industry standards to ensure your data remains protected.",
    },
    {
      question: "Can I integrate with my existing tools?",
      answer:
        "Yes, our platform offers extensive integration capabilities with popular business tools through our API and pre-built connectors.",
    },
    {
      question: "What kind of support do you offer?",
      answer:
        "We provide multiple support channels including email, chat, and phone support based on your plan, along with comprehensive documentation and training resources.",
    },
  ];

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section
      id="faq"
      className="relative py-20 px-4 overflow-hidden bg-gradient-to-b from-black via-[#0a0a12] to-black"
    >
      {/* Background Grid */}
      <div
        className="absolute inset-0 
        bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)]
        [background-size:60px_60px]"
      ></div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-400">
            Find answers to common questions about our AI-powered Web Crawler
          </p>
        </motion.div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="rounded-xl border border-slate-700/50 bg-slate-900/40 backdrop-blur-xl overflow-hidden"
            >
              <button
                className="flex justify-between items-center w-full p-6 text-left font-medium text-white hover:text-blue-400 transition-colors"
                onClick={() => toggleFAQ(index)}
              >
                <span>{faq.question}</span>
                <ChevronDown
                  size={20}
                  className={`transform transition-transform ${
                    activeIndex === index
                      ? "rotate-180 text-blue-400"
                      : "text-gray-400"
                  }`}
                />
              </button>

              <AnimatePresence initial={false}>
                {activeIndex === index && (
                  <motion.div
                    key="content"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-6 pb-6"
                  >
                    <p className="text-gray-400">{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
