import SiteHeader from "@/components/site-header";
import Hero from "@/components/hero";
import Catalog from "@/components/catalog";
import Advantages from "@/components/advantages";
import ProjectsGallery from "@/components/projects-gallery";
import Process from "@/components/process";
import Calculator from "@/components/calculator";
import Materials from "@/components/materials";
import Reviews from "@/components/reviews";
import Faq from "@/components/faq";
import FinalCta from "@/components/final-cta";
import Contacts from "@/components/contacts";
import SiteFooter from "@/components/site-footer";
import MobileActionBar from "@/components/mobile-action-bar";
import AiConsultant from "@/components/ai-consultant";
import ScrollReveal from "@/components/scroll-reveal";
import { faqs } from "@/data/content";

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function HomePage() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
      >
        Перейти к содержанию
      </a>

      <SiteHeader />

      <main id="main">
        <Hero />
        <Catalog />
        <Advantages />
        <ProjectsGallery />
        <Process />
        <Calculator />
        <Materials />
        <Reviews />
        <Faq />
        <FinalCta />
        <Contacts />
      </main>

      <SiteFooter />
      <MobileActionBar />
      <AiConsultant />
      <ScrollReveal />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </>
  );
}
