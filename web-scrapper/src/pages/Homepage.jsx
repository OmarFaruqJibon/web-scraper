// src/pages/Homepage.jsx
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import Commitment from '../components/Commitment';
import Testimonial from '../components/Testimonial';
import Pricing from '../components/Pricing';
import FAQ from '../components/FAQ';
import Footer from '../components/Footer';
import DemoSection from "../components/DemoSection";
import { useState, useEffect } from 'react';
import api from "../callApi";

const Homepage = () => {

  return (
    <div className="min-h-screen bg-black text-slate-100">
      <Navbar />
      <HeroSection />
      <Commitment />
      <Pricing />
      <FAQ />
      <Footer />
    </div>
  );
};

export default Homepage;