
import React from 'react';
import HeroSection from '@/components/HeroSection';
import QuickOrderSection from '@/components/QuickOrderSection';
import GrowthSystemSection from '@/components/GrowthSystemSection';
import WhyChooseSection from '@/components/WhyChooseSection';
import BenefitsSection from '@/components/BenefitsSection';
import ProductDetailsSection from '@/components/ProductDetailsSection';
import SyrupDetailsSection from '@/components/SyrupDetailsSection';
import IngredientsSection from '@/components/IngredientsSection';
import DosageSection from '@/components/DosageSection';
import FAQSection from '@/components/FAQSection';
import DisclaimerSection from '@/components/DisclaimerSection';
import FinalCTASection from '@/components/FinalCTASection';

const Index = () => {
  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <HeroSection />
      <QuickOrderSection />
      <GrowthSystemSection />
      <WhyChooseSection />
      <BenefitsSection />
      <SyrupDetailsSection />
      <ProductDetailsSection />
      <IngredientsSection />
      <DosageSection />
      <FAQSection />
      <DisclaimerSection />
      <FinalCTASection />
    </div>
  );
};

export default Index;
