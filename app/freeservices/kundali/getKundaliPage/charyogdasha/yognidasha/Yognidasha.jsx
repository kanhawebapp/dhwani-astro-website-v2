"use client";

import useScrollZoom from "@/Hooks/scrollZoom";

export default function Yoginidasha({  yogniData,yognicData,}) {
  useScrollZoom(".head-wrap");

  if (!yogniData || !yognicData) {
    return (
      <p className="text-center text-red-500">
        Failed to load Yogini Dasha data.
      </p>
    );
  }

  return (
    <section className="kundli-inter-page w-full flex flex-col items-center md:p-2 p-2">
  
      <div className="w-full mb-6">
        <h5 className="text-sm sm:text-md text-black font-semibold text-center mb-2">
          <span className="text-red-500 ">Major Yogini Dasha</span> Report
        </h5>

        <div className="bg-purple-100 rounded-xl shadow p-2">
          <div className="grid grid-cols-5 bg-purple-400 text-white rounded-lg px-4 py-2 text-xs sm:text-sm font-semibold">
            <span>Dasha Id</span>
            <span>Dasha Name</span>
            <span>Start Date</span>
            <span>End Date</span>
            <span>Duration</span>
          </div>

          {yogniData.map((item, i) => (
            <div
              key={i}
              className="grid grid-cols-5 text-black bg-purple-200 rounded-lg px-4 py-2 mt-1 text-xs sm:text-sm"
            >
              <span>{item.dasha_id}</span>
              <span>{item.dasha_name}</span>
              <span>{item.start_date}</span>
              <span>{item.end_date}</span>
              <span>{item.duration}</span>
            </div>
          ))}
        </div>
      </div>


      <div className="w-full bg-purple-100 rounded-xl shadow p-4 text-black">
        <h5 className="text-xl font-semibold text-center mb-3">
          <span className="text-red-500 text-sm sm:text-md">Current Yogini Dasha</span> Report
        </h5>

        <div className="grid md:grid-cols-3 gap-6 text-sm md:text-base">
          {["major_dasha", "sub_dasha", "sub_sub_dasha"].map((key) => {
            const dasha = yognicData[key];
            if (!dasha) return null;

            return (
              <div key={key} className="text-xs sm:text-sm">
                <h3 className="font-semibold text-sm sm:text-md capitalize mb-1">
                  {key.replace("_", " ")}
                </h3>
                <p>Dasha Id: {dasha.dasha_id}</p>
                <p>Dasha Name: {dasha.dasha_name}</p>
                <p>From: {dasha.start_date}</p>
                <p>To: {dasha.end_date}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
