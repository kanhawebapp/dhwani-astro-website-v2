"use client";


import { useGetKPHousesQuery, useGetKPPlanetsQuery } from "@/app/redux/services/astrologyAPI";

export default function KpClient({ formData }) {
  const skip = !formData;

  const {
    data: kp,
    isLoading: planetsLoading,
    error: planetsError,
  } = useGetKPPlanetsQuery(formData, { skip });

  const {
    data: houseData,
    isLoading: housesLoading,
    error: housesError,
  } = useGetKPHousesQuery(formData, { skip });

  const loading =
    planetsLoading ||
    housesLoading ;

  const error =
    planetsError ||
    housesError ;

  if (loading) {
    return (
      <div className="flex justify-center flex-col gap-4 items-center h-32">
        <span className="loader-all"></span>
        <span className="text-purple-600 font-medium">
          Loading KP Report...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-center text-red-500">
        Failed to load KP report.
      </p>
    );
  }

  if (!kp || !houseData ) {
    return (
      <p className="text-center text-red-500">
        No KP report available.
      </p>
    );
  }
  return (
    <section className="kundli-inter-page w-full flex justify-center">
      <div className="sm:max-w-6xl w-full flex flex-col gap-4">

        <h2 className="sm:text-xl font-bold text-black text-center">
          <span className="text-red-500">Krishnamurti</span> Paddhati (KP)
        </h2>

      
        <Section title="KP Planets ">
          <div className="overflow-x-scroll sm:w-full w-90 text-black">
            <div className="sm:w-full w-200">
              <div className="grid grid-cols-11 bg-purple-500 rounded-xl text-xs sm:text-sm text-white px-4 py-1 sm:py-2">
                {[
                  "Planet ID",
                  "Name",
                  "Degree",
                  "Retro",
                  "House",
                  "Sign",
                  "Sign Lord",
                  "Nakshatra",
                  "Nakshatra Lord",
                  "Charan",
                  "Sub Lord",
                ].map((h) => (
                  <span key={h}>{h}</span>
                ))}
              </div>

              {kp.map((p, i) => (
                <div
                  key={i}
                  className="grid grid-cols-11 bg-purple-100  px-4 py-1 text-xs sm:text-sm sm:py-2"
                >
                  <span>{p.planet_id}</span>
                  <span>{p.planet_name}</span>
                  <span>{(p.degree).toFixed(2)}</span>
                  <span>{p.is_retro ? "Yes" : "No"}</span>
                  <span>{p.house}</span>
                  <span>{p.sign}</span>
                  <span>{p.sign_lord}</span>
                  <span>{p.nakshatra}</span>
                  <span>{p.nakshatra_lord}</span>
                  <span>{p.charan}</span>
                  <span>{p.sub_lord}</span>
                </div>
              ))}
            </div>
          </div>
        </Section>


        <Section title="KP Houses Significators">
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 text-black">
            {houseData.map((h) => (
              <div key={h.house_id} className="p-4 text-xs  sm:text-sm bg-purple-50 rounded">
                <h3 className="font-bold text-purple-700">
                  House {h.house_id}
                </h3>
                <p>{h.significators.join(", ")}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* <Section title="KP Planet Significators">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-black">
            {planetSigData.map((p) => (
              <div key={p.planet_id} className="p-4 bg-purple-50 rounded">
                <h3 className="font-bold">{p.planet_name}</h3>
                <p>{p.significators.join(", ")}</p>
              </div>
            ))}
          </div>
        </Section> */}

      </div>
    </section>
  );
}

function Section({ title, children }) {
  return (
    <section>
      <h3 className="sm:text-lg text-black font-bold text-center mb-2">
        {title}
      </h3>
      {children}
    </section>
  );
}
