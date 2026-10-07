import { ArrowsSection } from "~/components/sites/www-findrealestate-com-715c1bfa/root-8a5edab2/ArrowsSection";
import { Footer } from "~/components/sites/www-findrealestate-com-715c1bfa/root-8a5edab2/Footer";
import { ForAgentsSection } from "~/components/sites/www-findrealestate-com-715c1bfa/root-8a5edab2/ForAgentsSection";
import { Header } from "~/components/sites/www-findrealestate-com-715c1bfa/root-8a5edab2/Header";
import { HeroSection } from "~/components/sites/www-findrealestate-com-715c1bfa/root-8a5edab2/HeroSection";
import { LatestPostsSection } from "~/components/sites/www-findrealestate-com-715c1bfa/root-8a5edab2/LatestPostsSection";
import { ListingDiscoverySection } from "~/components/sites/www-findrealestate-com-715c1bfa/root-8a5edab2/ListingDiscoverySection";
import { OutroSection } from "~/components/sites/www-findrealestate-com-715c1bfa/root-8a5edab2/OutroSection";
import { FeaturesSection } from "~/components/sites/www-findrealestate-com-715c1bfa/root-8a5edab2/FeaturesSection";
import { RewiredSection } from "~/components/sites/www-findrealestate-com-715c1bfa/root-8a5edab2/RewiredSection";
import { ServicesSection } from "~/components/sites/www-findrealestate-com-715c1bfa/root-8a5edab2/ServicesSection";
import { TestimonialsSection } from "~/components/sites/www-findrealestate-com-715c1bfa/root-8a5edab2/TestimonialsSection";
import { WhyUsSection } from "~/components/sites/www-findrealestate-com-715c1bfa/root-8a5edab2/WhyUsSection";

/**
 * findrealestate.com `/` — assembled in the origin's section order (see
 * docs/research/www-findrealestate-com-715c1bfa/root-8a5edab2/PAGE_TOPOLOGY.md):
 * the header overlays the hero from above, `main` carries the eleven flow
 * sections, and the footer follows. Lenis smooth scrolling is mounted in the
 * root layout.
 */
export default function Home() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <WhyUsSection />
        <ListingDiscoverySection />
        <ArrowsSection />
        <RewiredSection />
        <ForAgentsSection />
        <TestimonialsSection />
        <ServicesSection />
        <FeaturesSection />
        <LatestPostsSection />
        <OutroSection />
      </main>
      <Footer />
    </>
  );
}
