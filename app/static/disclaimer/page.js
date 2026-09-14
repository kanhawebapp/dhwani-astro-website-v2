
import { GET_DISCLAIMER_PAGE } from "@/app/graphql/seoQuery";
import { notFound } from "next/navigation";

export async function generateMetadata() {
  try {
    const res = await fetch(
      "https://dhwaniastro.com/userAuth/graphql",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: GET_DISCLAIMER_PAGE.loc?.source.body,
        }),
        cache: "force-cache",
      }
    );

    const { data } = await res.json();

    const page = data?.getDisclaimerPage;

    return {
      title: page?.metaTitle || "Disclaimer | Dhwani Astro",
      description:
        page?.metaDescription || "Read the disclaimer of Dhwani Astro.",
      keywords: page?.keywords || [],

      openGraph: {
        title: page?.metaTitle,
        description: page?.metaDescription,
        type: "website",
      },

      twitter: {
        card: "summary_large_image",
        title: page?.metaTitle,
        description: page?.metaDescription,
      },
    };
  } catch {
    return {
      title: "Disclaimer | Dhwani Astro",
      description: "Read the disclaimer of Dhwani Astro.",
    };
  }
}

export const dynamic = "force-static";
export default async function Disclaimer() {
  const res = await fetch(
    "https://dhwaniastro.com/userAuth/graphql",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: GET_DISCLAIMER_PAGE,
      }),
      cache: "no-store",
    }
  );

  const result = await res.json();


const disclaimer = result?.data?.getDisclaimerPage;


if (!disclaimer) {
  notFound();
}

  return (
    <div className="w-full flex flex-col">
      <section className="horo-icons-zod relative w-full mx-auto py-5 mt-1.5 h-36 sm:py-5 px-4 rounded-b-xl overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: "url('/ds-img/mnew.jpg')",
            }}
          />
        </div>

        <div className="relative service-horocope flex flex-col justify-center">
          <div className="flex flex-col justify-center bg-[#000000c0] px-15 py-5 w-[50%] place-self-center rounded-xl">
            <span className="text-2xl text-white font-bold place-self-center">
              Disclaimer
            </span>

            <h1 className="text-[#efd335] text-base sm:text-xl text-center font-semibold">
              {disclaimer?.title}
            </h1>
          </div>
        </div>
      </section>

      <div className="max-w-7xl place-self-center text-black py-5">
        <div className="flex flex-col gap-5">
          <div className="max-w-6xl mx-auto p-4 md:p-4">
            <div className="backdrop-blur-md bg-white/30 border border-white/20 shadow-lg rounded-xl flex flex-col items-center gap-6 p-4 md:p-6 neumorphism-card">
              <div className="p-4 sm:p-5 md:p-5 max-w-6xl mx-auto text-gray-800 w-full">
                <div
                  className="prose max-w-none text-sm md:text-sm leading-relaxed text-gray-700"
                  dangerouslySetInnerHTML={{
                    __html: disclaimer?.content || "",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
