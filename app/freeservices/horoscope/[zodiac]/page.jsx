import { SEO_ENDPOINTS } from "@/app/api/seoEndpoints";
import { astrologySeo } from "@/app/api/astrologySeo";
import HoroscopePage from "../horoscopePage";

const VALID_SIGNS = [
  "aries",
  "taurus",
  "gemini",
  "cancer",
  "leo",
  "virgo",
  "libra",
  "scorpio",
  "sagittarius",
  "capricorn",
  "aquarius",
  "pisces",
];
const horoscopezod = [
  { name: "Aries", img: "/ds-img/ARIESn.webp", indate: "Mar 21 - Apr 19" },
  { name: "Taurus", img: "/ds-img/Taurusn.webp", indate: "Apr 20 - May 20" },
  { name: "Gemini", img: "/ds-img/GEMINIn.webp", indate: "May 21 - Jun 20" },
  { name: "Cancer", img: "/ds-img/cancern.webp", indate: "Jun 21 - Jul 22" },
  { name: "Leo", img: "/ds-img/LEO.webp", indate: "Jul 23 - Aug 22" },
  { name: "Virgo", img: "/ds-img/virgon.webp", indate: "Aug 23 - Sep 22" },
  { name: "Libra", img: "/ds-img/LIBRAn.webp", indate: "Sep 23 - Oct 22" },
  { name: "Scorpio", img: "/ds-img/Scorpio.webp", indate: "Oct 23 - Nov 21" },
  {
    name: "Sagittarius",
    img: "/ds-img/SAGITTARIUSn.webp",
    indate: "Nov 22 - Dec 21",
  },
  {
    name: "Capricorn",
    img: "/ds-img/CAPRICORNn.webp",
    indate: "Dec 22 - Jan 19",
  },
  {
    name: "Aquarius",
    img: "/ds-img/Aquariusn.webp",
    indate: "Jan 20 - Feb 18",
  },
  {
    name: "Pisces",
    img: "/ds-img/PISCESn.webp",
    indate: "Feb 19 - Mar 20",
  },
];
export async function generateMetadata({ params }) {
  const zodiac = params.zodiac.toLowerCase();

  return {
    title: `${zodiac.charAt(0).toUpperCase() + zodiac.slice(1)} Horoscope Today`,
    description: `Read today's horoscope for ${zodiac}.`,
  };
}

export default async function ZodiacPage({ params }) {
  const zodiac = params.zodiac.toLowerCase();

  if (!VALID_SIGNS.includes(zodiac)) {
    return <div>Invalid Zodiac</div>;
  }

  const body = {
    timezone: 5.5,
  };

  const [today, tomorrow, yesterday] = await Promise.all([
    astrologySeo(
      `${SEO_ENDPOINTS.HOROSCOPE_TODAY}/${zodiac}`,
      body
    ),

    astrologySeo(
      `${SEO_ENDPOINTS.HOROSCOPE_NEXT}/${zodiac}`,
      body
    ),

    astrologySeo(
      `${SEO_ENDPOINTS.HOROSCOPE_PREVIOUS}/${zodiac}`,
      body
    ),
  ]);

  return (
  <HoroscopePage
     horoscopezod={horoscopezod}
    zodiac={zodiac.charAt(0).toUpperCase() + zodiac.slice(1)}
    today={today}
    tomorrow={tomorrow}
    yesterday={yesterday}
  />
  );
}