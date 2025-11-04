import { Header } from '@/components/Header';
import { HeroSection } from '@/components/landing/HeroSection';
import { PartnersSection } from '@/components/landing/PartnersSection';
import { ProToolkitsSection } from '@/components/landing/ProToolkitsSection';
import { Sphere3DSection } from '@/components/landing/Sphere3DSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { EducationalResources } from '@/components/landing/EducationalResources';
import { LiveDemoPreview } from '@/components/landing/LiveDemoPreview';
import { BenefitsSection } from '@/components/landing/BenefitsSection';
import { CTASection } from '@/components/landing/CTASection';
import { Footer } from '@/components/landing/Footer';

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header isLanding={true} />
      <HeroSection />
      <PartnersSection />
      <ProToolkitsSection />
      <Sphere3DSection />
      <FeaturesSection />
      <HowItWorks />
      <EducationalResources />
      <LiveDemoPreview />
      <BenefitsSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Landing;
