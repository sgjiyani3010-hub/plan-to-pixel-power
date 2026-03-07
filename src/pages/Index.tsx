import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import CategorySection from '@/components/CategorySection';
import BestSellers from '@/components/BestSellers';
import FlashSale from '@/components/FlashSale';
import Testimonials from '@/components/Testimonials';
import Newsletter from '@/components/Newsletter';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <CategorySection />
      <BestSellers />
      <FlashSale />
      <Testimonials />
      <Newsletter />
      <Footer />
    </div>
  );
};

export default Index;
