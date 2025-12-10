// src/pages/Homepage.jsx
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import Commitment from '../components/Commitment';
import Pricing from '../components/Pricing';
import FAQ from '../components/FAQ';
import Footer from '../components/Footer';

const Homepage = () => {

  return (
    <div className="min-h-screen bg-black text-slate-100">
      <Navbar />
      <HeroSection />
      {/* <Commitment /> */}
      {/* <Pricing /> */}
      {/* <FAQ /> */}
      {/* <Footer /> */}
    </div>
  );
};

export default Homepage;