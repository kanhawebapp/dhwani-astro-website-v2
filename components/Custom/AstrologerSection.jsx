import { getPublicAstrologers } from "../../lib/astrologers";
import AstrologerCarousel from "./AstrologerCarousel";

export default async function AstrologerSection() {
  let astrologers = [];

  try {
    astrologers = await getPublicAstrologers();
  } catch (error) {
    console.error("Failed to load public astrologers:", error);
  }

  return (
    <section className="w-full sm:max-w-7xl mx-auto">
      <AstrologerCarousel initialAstrologers={astrologers} />
    </section>
  );
}