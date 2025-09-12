// src/components/Pricing.jsx
import { motion } from "framer-motion";
import { Check } from "lucide-react";

const Pricing = () => {
  const plans = [
    {
      name: "Starter",
      price: "$0",
      period: "per month",
      features: [
        "Basic AI analytics",
        "Up to 5 users",
        "10GB storage",
        "Email support",
        "Basic reporting",
        "No API Access",
        "No Integrations"

      ],
      highlighted: false,
    },
    {
      name: "Professional",
      price: "$20",
      period: "per month",
      features: [
        "Advanced AI analytics",
        "Up to 20 users",
        "50GB storage",
        "Priority support",
        "Advanced reporting",
        "API access",
        "Custom integrations",
      ],
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "tailored solution",
      features: [
        "Custom AI solutions",
        "Unlimited users",
        "1TB+ storage",
        "24/7 dedicated support",
        "Custom reporting",
        "Full API access",
        "Onboarding assistance",
      ],
      highlighted: false,
    },
  ];

  return (
    <section
      id="pricing"
      className="relative py-20 px-4 overflow-hidden bg-gradient-to-b from-black via-[#0a0a12] to-black"
    >
      {/* Background Grid */}
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
            Transparent Pricing
          </h2>
          <p className="text-gray-400 max-w-3xl mx-auto">
            Choose the plan that works best for your business. All plans include
            access to our core AI features.
          </p>
        </motion.div>

        {/* Pricing Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative rounded-2xl p-8 backdrop-blur-xl border transition-all
                ${
                  plan.highlighted
                    ? "bg-slate-900/60 border-blue-500 shadow-lg shadow-blue-500/20 scale-105"
                    : "bg-slate-900/40 border-slate-700 hover:border-blue-400/40"
                }`}
            >
              <h3 className="text-2xl font-bold mb-4 text-white">
                {plan.name}
              </h3>

              <div className="mb-6">
                <span className="text-4xl font-bold text-white">
                  {plan.price}
                </span>
                <span
                  className={`ml-1 ${
                    plan.highlighted ? "text-blue-300" : "text-gray-400"
                  }`}
                >
                  {plan.period}
                </span>
              </div>

              <ul className="mb-8 space-y-4">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <Check
                      size={20}
                      className={`mr-2 mt-1 ${
                        plan.highlighted ? "text-blue-400" : "text-blue-500"
                      }`}
                    />
                    <span
                      className={
                        plan.highlighted ? "text-gray-200" : "text-gray-400"
                      }
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`w-full py-3 rounded-full font-medium transition 
                  ${
                    plan.highlighted
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                      : "bg-slate-800 text-gray-200 hover:bg-slate-700"
                  }`}
              >
                Get Started
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
