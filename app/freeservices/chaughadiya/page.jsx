import ChaughadiyaPage from "./ChaughadiyaPage";
import { SEO_ENDPOINTS } from "../../api/seoEndpoints";
import { astrologySeo } from "@/app/api/astrologySeo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Today’s Chaughadiya | Hindu Calendar & Muhurta",
  description: "Get today’s Chaughadiya with tithi, nakshatra, yoga, karan, and auspicious muhurats.",
};

export default async function Chaughadiya() {
  const now = new Date();
  const params = {
    day: now.getDate(),
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    lat: 28.6139,
    lon: 77.209,
    tzone: 5.5,
    hour: now.getHours(),
    min: now.getMinutes(),
  };

const [panchang, chaughadiya] =
    await Promise.all([
        astrologySeo(
            SEO_ENDPOINTS.ADV_PANCHANG,
            params
        ),

        astrologySeo(
            SEO_ENDPOINTS.CHAUGHADIYA,
            params
        ),
    ]);

  return (
    <ChaughadiyaPage
      initialPanchang={panchang?.data || panchang}
      initialChaughadiya={chaughadiya?.data || chaughadiya}
    />
  );
}
