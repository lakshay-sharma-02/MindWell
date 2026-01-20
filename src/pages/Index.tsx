import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/seo/SEOHead";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedBlogs } from "@/components/home/FeaturedBlogs";
import { FeaturedPodcasts } from "@/components/home/FeaturedPodcasts";
import { FeaturedResources } from "@/components/home/FeaturedResources";
import { CTASection } from "@/components/home/CTASection";
import { Marquee } from "@/components/home/Marquee";
import { PressBar } from "@/components/home/PressBar";
import { Testimonials } from "@/components/home/Testimonials";
import { ShareStory } from "@/components/home/ShareStory";
import { SocialProofBanner } from "@/components/shared/SocialProofBanner";
import { WaveDivider } from "@/components/shared/WaveDivider";
import { FeaturedTools } from "@/components/home/FeaturedTools";

const Index = () => {
  return (
    <Layout>
      <SEOHead
        title="Home"
        description="Psyche Space is your trusted resource for mental health support, therapy sessions, evidence-based articles, and wellness podcasts. Start your journey to better mental health today."
        keywords="mental health, therapy, psychology, wellness, counseling, mindfulness, anxiety, depression, self-care"
      />

      <HeroSection />
      <SocialProofBanner />
      <PressBar />
      <Marquee />
      <FeaturedBlogs />
      <WaveDivider variant="wave" color="hsl(var(--secondary) / 0.3)" />
      <Testimonials />
      <FeaturedTools />
      <FeaturedResources />
      <FeaturedPodcasts />
      <ShareStory />
      <CTASection />
    </Layout>
  );
};

export default Index;
