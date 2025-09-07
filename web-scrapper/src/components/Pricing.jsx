// src/components/Pricing.jsx
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const Pricing = () => {
  const plans = [
    {
      name: "Starter",
      price: "$49",
      period: "per month",
      features: [
        "Basic AI analytics",
        "Up to 5 users",
        "10GB storage",
        "Email support",
        "Basic reporting"
      ],
      highlighted: false
    },
    {
      name: "Professional",
      price: "$99",
      period: "per month",
      features: [
        "Advanced AI analytics",
        "Up to 20 users",
        "50GB storage",
        "Priority support",
        "Advanced reporting",
        "API access",
        "Custom integrations"
      ],
      highlighted: true
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
        "White-label options",
        "Onboarding assistance"
      ],
      highlighted: false
    }
  ];

  return (
    <section id="pricing" className="py-16 px-4 bg-slate-900">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-100 mb-4">Transparent Pricing</h2>
          <p className="text-slate-400 max-w-3xl mx-auto">
            Choose the plan that works best for your business. All plans include access to our core AI features.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`rounded-2xl p-8 border ${
                plan.highlighted 
                  ? 'bg-gradient-to-b from-blue-900/30 to-slate-800 border-blue-500 text-white transform scale-105 shadow-xl' 
                  : 'bg-slate-800 border-slate-700 text-slate-100 shadow-sm'
              } glow-effect`}
            >
              <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className={`ml-1 ${plan.highlighted ? 'text-blue-200' : 'text-slate-400'}`}>
                  {plan.period}
                </span>
              </div>
              
              <ul className="mb-8 space-y-4">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <Check size={20} className={`mr-2 mt-1 ${plan.highlighted ? 'text-blue-400' : 'text-blue-500'}`} />
                    <span className={plan.highlighted ? 'text-slate-200' : 'text-slate-400'}>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`w-full py-3 rounded-full font-medium ${
                  plan.highlighted
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
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