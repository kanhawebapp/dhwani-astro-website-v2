import Image from "next/image";
import { GET_ABOUT_PAGE } from "../../graphql/seoQuery";
//export const revalidate = 604800; 

export default async function AboutP() {
  const res = await fetch(
    "https://dhwaniastro.com/userAuth/graphql",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: GET_ABOUT_PAGE,
      }),
      cache: "no-store",
    }
  );

  const result = await res.json();


  const about = result?.data?.getAboutPage;

  const mentor = about?.mentors?.[0];
  const founder = about?.founders?.[0];

  return (
    <div className="w-full flex flex-col items-center">
      <section className="horo-icons-zod relative w-full mx-auto py-5 mt-1.5 h-36 sm:py-5 px-4 rounded-b-xl  overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-3/3 h-full bg-cover  bg-center"
            style={{ backgroundImage: "url('/ds-img/mnew.jpg')" }}
          ></div>
        </div>

        <div className="relative service-horocope flex flex-col justify-center">
          <div className=" flex flex-col  justify-center  bg-[#000000c0] px-15 py-5 w-[50%] place-self-center rounded-xl">
            <span className="text-2xl text-white font-bold place-self-center">
              About Us
            </span>
            <h1
              dangerouslySetInnerHTML={{
                __html: about?.heroTitle || "",
              }}
              className="text-[#efd335] text-base sm:text-xl text-center font-semibold"
            />
          </div>
        </div>
      </section>

      <div className="max-w-7xl place-self-center text-black py-5">
        <div className="flex flex-col items-center  gap-5">
          <div className="abp">
            <div
              className="text-base text-center"
              dangerouslySetInnerHTML={{
                __html: about?.heroDescription || "",
              }}
            />
          </div>

          <div className="max-w-6xl mx-auto p-4 md:p-4">
            <div className="backdrop-blur-md bg-white/30 border border-white/20 shadow-lg rounded-xl flex flex-col md:flex-row items-center gap-6 p-6 md:p-10 neumorphism-card">
              <div className="flex-shrink-0">
                <div className="w-60 h-60 rounded-full overflow-hidden shadow-xl border-4 border-white bg-white">
                  <Image
                    src={
                      mentor?.image
                        ? mentor.image.startsWith("http")
                          ? mentor.image
                          : `https://dhwaniastro.com${mentor.image}`
                        : "/prblm/gajanand.jpeg"
                    }
                    alt={mentor?.name || "Mentor"}
                    width={208}
                    height={208}
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>

              <div className="text-center md:text-left text-gray-800">
                <h2 className="text-2xl md:text-3xl font-semibold text-purple-900 capitalize">
                  {mentor?.name}
                </h2>

                <h3 className="font-semibold text-lg text-gray-700 italic mt-1">
                  {mentor?.designation}
                </h3>

                <div
                  className="mt-4 text-sm leading-relaxed text-gray-700"
                  dangerouslySetInnerHTML={{
                    __html: mentor?.description || "",
                  }}
                />
              </div>
            </div>
          </div>

          <div className="max-w-6xl mx-auto p-4 md:p-4">
            <div className="backdrop-blur-md bg-white/30 border border-white/20 shadow-lg rounded-xl flex flex-col md:flex-row items-center gap-6 p-4 md:p-6 neumorphism-card">
              <div className="flex-shrink-0">
                <div className="w-60 h-auto rounded-lg overflow-hidden shadow-xl border-4 border-white bg-white">
                  <Image
                    src={
                      founder?.image
                        ? founder.image.startsWith("http")
                          ? founder.image
                          : `https://dhwaniastro.com${founder.image}`
                        : "/prblm/dhwani-jain.jpg"
                    }
                    alt={founder?.name || "Founder"}
                    width={208}
                    height={208}
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>

              <div className="text-center md:text-left text-gray-800">
                <h2 className="text-2xl md:text-3xl font-semibold text-purple-900 capitalize">
                  {founder?.name}
                </h2>

                <h3 className="font-semibold text-lg text-gray-700 italic mt-1">
                  {founder?.designation}
                </h3>

                <div
                  className="mt-4 text-sm leading-relaxed text-gray-700"
                  dangerouslySetInnerHTML={{
                    __html: founder?.description || "",
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
