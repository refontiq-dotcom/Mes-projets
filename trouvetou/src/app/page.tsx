import { Hero } from "@/components/landing/hero";
import { CategoryCards } from "@/components/landing/category-cards";
import { HowItWorks } from "@/components/landing/steps";
import { CtaBand } from "@/components/landing/cta-band";

export default function HomePage() {
  return (
    <>
      <Hero />
      <CategoryCards />
      <HowItWorks />
      <CtaBand />
    </>
  );
}
