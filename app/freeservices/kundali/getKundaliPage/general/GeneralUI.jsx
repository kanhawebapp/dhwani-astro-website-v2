"use client";

export default function GeneralUI({ gendata }) {
  if (!gendata || typeof gendata !== "object") {
    return (
      <p className="text-center text-red-500">
        Failed to load General Prediction data...
      </p>
    );
  }

  const capitalize = (str) =>
    str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, " ");

  return (
    <div className="basic-kundli-charts col-span-4 flex flex-col gap-2 items-center">
      <span className="text-sm md:text-xl text-white text-center bg-[#2f1254] rounded-full px-10 py-2 w-full shadow-lg">
        Dhwani Astro Kundli Birth Chart & Planetary Positions
      </span>

      <div className="general-life">
        <h5 className="md:p-5 p-2 text-center md:text-2xl text-base text-black">
          General Life Reports
        </h5>

        <div className="basic-box flex flex-col gap-5">
          {Object.entries(gendata).map(([key, paras], index) => (
            <div
              key={index}
              className="basic-card flex bg-purple-50 flex-col items-center gap-2 border shadow-lg px-4 py-4 rounded-lg"
            >
              <h5 className="text-black text-sm md:text-base font-semibold bg-purple-200 px-6 py-2 rounded-full capitalize">
                {capitalize(key)}
              </h5>

              {Array.isArray(paras)
                ? paras.map((para, idx) => (
                    <p
                      key={idx}
                      className="text-black md:text-sm text-xs text-justify"
                    >
                      {para}
                    </p>
                  ))
                : (
                  <p className="text-black md:text-sm text-xs text-justify">
                    {paras}
                  </p>
                )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
