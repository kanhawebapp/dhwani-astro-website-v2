"use client";

import useScrollZoom from "../../../../../../Hooks/scrollZoom";

export default function NakprevClient({ prev }) {
  useScrollZoom(".head-wrap");

  if (!prev?.prediction) {
    return <p className="text-red-500 text-center">Failed to load data.</p>;
  }

  return (
    <div className="flex flex-col">
      <h5 className="text-sm sm:text-md text-center text-black font-semibold">
        <span className="text-red-500">Nakshatra Prediction:</span> Yesterday
      </h5>

      <div className="head-wrap flex flex-col gap-5">
        
          <div className="p-5 rounded-lg bg-linear-to-r from-pink-100 to-yellow-100 shadow-lg text-black border border-orange-300">
            <div className="flex flex-col md:flex-row gap-5 items-center justify-center font-semibold">
              <span className="bg-purple-300 px-5 flex w-full md:w-[45%] justify-between items-center text-xs sm:text-sm py-2 rounded-full">
                <span>Moon Sign:</span>
                <span className="font-bold">{prev.birth_moon_sign}</span>
              </span>

              <span className="bg-purple-300 px-5 flex w-full md:w-[45%] justify-between items-center text-xs sm:text-sm py-2 rounded-full">
                <span >Nakshatra:</span>
                <span className="font-bold">
                  {prev.birth_moon_nakshatra}
                </span>
              </span>
            </div>
          </div>
        {Object.entries(prev.prediction).map(([key, value]) => (
          <div key={key} className="shadow p-5 rounded-lg bg-purple-100 text-black">
            <h3 className="text-xs sm:text-sm font-bold text-purple-700 capitalize">
              {key.replace(/_/g, " ")}
            </h3>
            <p className="text-xs sm:text-sm">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
