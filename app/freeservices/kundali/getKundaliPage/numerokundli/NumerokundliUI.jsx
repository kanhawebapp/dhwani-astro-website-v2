"use client";

import useScrollZoom from "@/Hooks/scrollZoom";

export default function NumerokundliUI({ data }) {
  useScrollZoom(".head-wrap");


  if (!data || !data.main) {
    return (
      <p className="text-center text-red-500">
        Failed to load Numerology data.
      </p>
    );
  }

  const {
    main,
    det,
    fav,
    place,
    fast,
    lord,repo,
    mantra, 
  } = data;


  const daily = { ...main, ...(det || {}) };

  const gridItems = [
    { label: "Destiny Number", value: daily?.destiny_number },
    { label: "Radical Number", value: daily?.radical_number },
    { label: "Name Number", value: daily?.name_number },
    { label: "Evil Number", value: daily?.evil_num },
    { label: "Favorite Color", value: daily?.fav_color },
    { label: "Favorite God", value: daily?.fav_god },
    { label: "Favorite Metal", value: daily?.fav_metal },
    { label: "Radical Ruler", value: daily?.radical_ruler },
    { label: "Neutral Number", value: daily?.neutral_num },
    { label: "Friendly Number", value: daily?.friendly_num },
  ];

  const favItems = [
    { label: "Favorite Day", value: daily?.fav_day },
    { label: "Favorite Mantra", value: daily?.fav_mantra },
    { label: "Favorite Stone", value: daily?.fav_stone },
    { label: "Favorite Substance", value: daily?.fav_substone },
  ];

  const descriptionBlocks = [
    place,   repo,
    fast,
    lord,
    mantra,
  ];

  return (
    <div className="basic-kundli-charts flex flex-col md:col-span-4 p-1">
      <h5 className="text-sm text-center head-wrap md:text-xl text-black font-semibold">
        <span className="text-red-500">
          "Numerology & Favorability:{" "}
        </span>
        Everything You Should Know"
      </h5>

      <section className="basic-details-main w-full flex items-center justify-start flex-col gap-6">
        <div className=" flex flex-col gap-10">

          <div className="p-5 rounded-lg bg-linear-to-r from-pink-100 to-yellow-100 shadow-lg text-black border border-orange-200">
            <h3 className="text-sm sm:text-md text-center font-bold text-black mb-2">
              Today's Prediction : {daily?.prediction_date|| "Prediction not available"}
            </h3>
            <p className="text-xs sm:text-sm mb-2 leading-relaxed">
              {daily?.prediction}
            </p>

            <div className="flex justify-center md:flex-row gap-2 text-sm font-semibold">
              <span className="bg-purple-50 px-4 text-xs sm:text-sm py-1 rounded-full text-gray-700">
                Lucky Color:{" "}
                <span className="font-bold">
                  {daily?.lucky_color}
                </span>
              </span>
              <span className="bg-purple-50 px-4 text-xs sm:text-sm py-1 rounded-full text-gray-700">
                Lucky Number:{" "}
                <span className="font-bold">
                  {daily?.lucky_number}
                </span>
              </span>
            </div>
          </div>

      
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-4 text-black">
            {gridItems.map(({ label, value }, i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-center p-4 shadow-lg rounded-lg gap-2 bg-linear-to-r from-[#c54e5a8a] to-[#7042ac8c]"
              >
                <span className="md:text-md text-center font-semibold">
                  {value ?? "-"}
                </span>
                <span className="bg-white text-[10px] text-xs text-center  rounded-full px-2 md:px-4 py-1 ">
                  {label}
                </span>
              </div>
            ))}
          </div>

 
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {favItems.map(({ label, value }, i) => (
              <div
                key={i}
                className="flex flex-col md:flex-row items-center justify-between shadow-lg rounded-lg px-4 py-3"
              >
                <span className="text-black font-semibold">
                  {label}
                </span>
                <span className="text-orange-500 font-semibold">
                  {value ?? "-"}
                </span>
              </div>
            ))}
          </div>

         
          <div className="flex flex-col gap-3">
            {descriptionBlocks.map(
              (item, i) =>
                item && (
                  <div
                    key={i}
                    className="shadow-xl sm:p-5 p-3 rounded-lg bg-purple-100 text-black"
                  >
                    <h3 className="text-xs sm:text-sm font-bold text-[#7042ac] mb-1">
                      {item?.title} :
                    </h3>
                    <p className="text-xs sm:text-sm leading-relaxed">
                      {item?.description}
                    </p>
                  </div>
                )
            )}
          </div>

        </div>
      </section>
    </div>
  );
}
