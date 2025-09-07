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
  const [data, setData] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);
  
    useEffect(() => {
      setIsLoaded(true);
      fetchData();
    }, []);
  
    const fetchData = async () => {
      try {
        const response = await api.get("/data");
        setData(response?.data?.dataCollections);
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };
  return (
    <div className="min-h-screen bg-black text-slate-100">
      <Navbar />
      <HeroSection  isLoaded={isLoaded} fetchData={fetchData} />
      <Commitment />
      {/* <Testimonial /> */}
      <Pricing />
      <FAQ />
      <DemoSection data={data} fetchData={fetchData} />
      <Footer />
    </div>
  );
};

export default Homepage;