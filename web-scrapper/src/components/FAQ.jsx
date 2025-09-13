// src/components/FAQ.jsx
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      question: "How does the recursive web crawler work?",
      answer:
        "The crawler starts from a user-provided URL, extracts data and internal links, and then recursively follows those links until all reachable pages within the domain are processed.",
    },
    {
      question: "What kind of data can be extracted?",
      answer:
        "Our system extracts structured information such as names, emails, phone numbers, and locations using a combination of regex rules and LLM model understanding.",
    },
    {
      question: "Do I need technical knowledge to use this tool?",
      answer:
        "No, the React frontend provides a simple interface where you just enter a website URL, and the system handles the crawling, extraction, and visualization automatically.",
    },
    {
      question: "Can the crawler handle large websites?",
      answer:
        "Yes, the recursive design allows the crawler to process multiple pages efficiently. However, performance depends on site size, server response, and configured crawl depth.",
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
