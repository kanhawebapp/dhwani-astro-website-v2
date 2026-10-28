
import { print } from "graphql";
import { GET_BANNERS } from "@/app/graphql/gqlQuery";
import BannerCarousel from "./BannerCarousel";

const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

async function getBanners() {
  if (!GRAPHQL_URL) {
    throw new Error("GRAPHQL_API_URL is not configured");
  }

  const start = performance.now();

  try {
    const response = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: print(GET_BANNERS),
        variables: { language: "en" },
      }),
      next: { revalidate: 30000 },
    });

    const result = await response.json();

//     console.log(
//       `[Banner] GraphQL request: ${Math.round(performance.now() - start)} ms`
//     );

    if (!response.ok || result.errors?.length) {
      throw new Error("Banner request failed");
    }

    return result.data?.getBanners?.data ?? [];
  } catch (error) {
    console.error("[Banner] Fetch failed:", error);
    throw error;
  }
}

export default async function Banner() {
  let banners = [];

  try {
    banners = await getBanners();
  } catch (error) {
    console.error("Banner fetch failed:", error);
  }

  const desktop = banners.filter(
    (banner) => banner.bannerType === "DESKTOP"
  );

  const mobile = banners.filter(
    (banner) => banner.bannerType === "MOBILE"
  );

  const slides = Array.from(
    { length: Math.max(desktop.length, mobile.length) },
    (_, index) => {
      const desktopBanner = desktop[index];
      const mobileBanner = mobile[index];

      return {
        id: desktopBanner?.id ?? mobileBanner?.id,
        heading:
          desktopBanner?.heading ?? mobileBanner?.heading ?? "Banner",
        desktopImage: desktopBanner?.imageUrl
          ? `${BASE_URL}${desktopBanner.imageUrl}`
          : null,
        mobileImage: mobileBanner?.imageUrl
          ? `${BASE_URL}${mobileBanner.imageUrl}`
          : null,
      };
    }
  ).filter((slide) => slide.desktopImage || slide.mobileImage);

  if (!slides.length) return null;

  return <BannerCarousel slides={slides} />;
}
