
import { astrologySeo } from "@/app/api/astrologySeo";
import PanchangPage from "./PanchangPage";
import { SEO_ENDPOINTS } from "@/app/api/seoEndpoints";



export async function generateMetadata() {
  const now = new Date();

  const formattedDate = now.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

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

  const data = await astrologySeo(
    SEO_ENDPOINTS.ADV_PANCHANG,
    params
  );

  const tithi =
    data?.tithi?.details?.tithi_name ??
    data?.tithi?.details?.name ??
    "";

  const nakshatra =
    data?.nakshatra?.details?.nak_name ??
    data?.nakshatra?.details?.name ??
    "";

  const yoga =
    data?.yoga?.details?.yoga_name ??
    data?.yoga?.details?.name ??
    "";

  return {
    title:
      `${tithi} Panchang Today (${formattedDate}) | ${nakshatra} | Your Brand`,

    description:
      `Today's Panchang for ${formattedDate}. Check ${tithi}, ${nakshatra}, ${yoga}, sunrise, sunset, Hora, Chaughadiya, Rahu Kaal and other Hindu calendar timings.`,

    keywords: [
      "Today's Panchang",
      "Aaj Ka Panchang",
      tithi,
      nakshatra,
      yoga,
      "Hora",
      "Chaughadiya",
      "Rahu Kaal",
      "Hindu Calendar",
      "Vedic Panchang",
    ],

    openGraph: {
      title:
        `${tithi} Panchang - ${formattedDate}`,

      description:
        `Today's Panchang including ${nakshatra}, ${yoga}, Hora and Chaughadiya.`,

      url:
        "https://dhwaniastro.com/freeservices/panchang",

      type: "website",

      images: [
        {
          url: "/ds-img/panchang-banner.webp",
          width: 1200,
          height: 630,
          alt: "Today's Panchang",
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title:
        `${tithi} Panchang Today`,
      description:
        `Today's Panchang with ${nakshatra}.`,
      images: ["/ds-img/panchang-banner.webp"],
    },

    alternates: {
      canonical:
        "https://dhwaniastro.com/freeservices/panchang",
    },
  };
}
export default async function Panchang() {
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

const [data, chaughadiyaData, horaData] =
  await Promise.all([
    astrologySeo(
      SEO_ENDPOINTS.ADV_PANCHANG,
      params
    ),

    astrologySeo(
      SEO_ENDPOINTS.CHAUGHADIYA,
      params
    ),

    astrologySeo(
      SEO_ENDPOINTS.HORA,
      params
    ),
  ]);

  return (
    <PanchangPage
      initialPanchang={data?.data || data}
      initialChaughadiya={chaughadiyaData?.data || chaughadiyaData}
      initialHora={horaData?.data || horaData}
    />
  );
}
