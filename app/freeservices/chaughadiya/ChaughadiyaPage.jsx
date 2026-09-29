"use client";

import { useState, useEffect, useCallback } from "react";
import { SEO_ENDPOINTS } from "../../api/seoEndpoints";

import usePanchHook from "../../../Hooks/usePanchHook";
import AbhijitPage from "../abhijeet/page";
import { astrologySeo } from "@/app/api/astrologySeo";

export default function ChaughadiyaPage({
  initialPanchang = null,
  initialChaughadiya = null,
}) {
  const {
    today,
    date,
    setDate,
    coords,
    setCoords,
    searchText,
    locationName,
    setLocationName,
    suggestions,
    showSuggestions,
    setShowSuggestions,
    userTyped,
    handleInputChange,
    handleSuggestionClick,
    getParams,
  } = usePanchHook();

  const [chaughadiyaData, setChaughadiyaData] = useState(
    initialChaughadiya || null,
  );

  const [loading, setLoading] = useState(false);

  /**
   * Fetch Chaughadiya data
   */
  const getChaughadiyaData = useCallback(async (params) => {
    setLoading(true);

    try {
      const res = await astrologySeo(SEO_ENDPOINTS.CHAUGHADIYA, params);

      setChaughadiyaData(res?.data || res);
    } catch (error) {
      console.error("Error fetching Chaughadiya:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get user's current location.
   * Initial server-rendered data is preserved until a new location/date
   * needs to be requested.
   */
  useEffect(() => {
    if (!navigator.geolocation) {
      if (!initialChaughadiya) {
        getChaughadiyaData(getParams(today));
      }
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newCoords = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };

        setCoords(newCoords);

        if (!userTyped && !initialChaughadiya) {
          getChaughadiyaData(getParams(today));
        }
      },
      () => {
        if (!initialChaughadiya) {
          getChaughadiyaData(getParams(today));
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000,
      },
    );
  }, [
    getChaughadiyaData,
    getParams,
    initialChaughadiya,
    setCoords,
    today,
    userTyped,
  ]);

  /**
   * Fetch data whenever selected date/location changes.
   */
  useEffect(() => {
    if (!date) return;

    getChaughadiyaData(getParams(date));
  }, [date, coords, getParams, getChaughadiyaData]);

  /**
   * Change selected date.
   */
  const changeDate = (offset) => {
    setDate((previousDate) => {
      const selectedDate = new Date(previousDate);

      selectedDate.setDate(selectedDate.getDate() + offset);

      return selectedDate.toISOString().split("T")[0];
    });
  };

  /**
   * Reset selected date to today.
   */
  const setToday = () => {
    setDate(today);
  };

  /**
   * Find currently running Chaughadiya.
   */
  const getCurrentChaughadiya = useCallback(() => {
    if (!chaughadiyaData?.chaughadiya) {
      return "Loading...";
    }

    const now = new Date();

    const toSeconds = (time) => {
      if (!time) return 0;

      const [hours, minutes, seconds = 0] = time
        .replace(/\s/g, "")
        .split(":")
        .map(Number);

      return hours * 3600 + minutes * 60 + seconds;
    };

    const currentSeconds =
      now.getHours() * 3600 +
      now.getMinutes() * 60 +
      now.getSeconds();

    const allMuhurtas = [
      ...(chaughadiyaData.chaughadiya.day || []),
      ...(chaughadiyaData.chaughadiya.night || []),
    ];

    for (const { time, muhurta } of allMuhurtas) {
      if (!time) continue;

      const [start, end] = time.split(" - ").map(toSeconds);

      const isCurrent =
        (start < end &&
          currentSeconds >= start &&
          currentSeconds < end) ||
        (start > end &&
          (currentSeconds >= start || currentSeconds < end));

      if (isCurrent) {
        return muhurta;
      }
    }

    return "No muhurta found";
  }, [chaughadiyaData]);

  /**
   * Format selected date for display.
   */
  const formattedDate = date
    ? new Date(`${date}T00:00:00`).toLocaleDateString("en-GB")
    : "";

  /**
   * Submit location/date search.
   */
  const handleSearch = (event) => {
    event.preventDefault();

    getChaughadiyaData(getParams(date));

    setShowSuggestions(false);
  };

  /**
   * Chaughadiya color helper.
   */
  const getMuhurtaBackground = (muhurta) => {
    if (["Kaal", "Udveg", "Rog"].includes(muhurta)) {
      return "bg-red-400";
    }

    if (muhurta === "Char") {
      return "bg-violet-400";
    }

    if (muhurta === "Amrit") {
      return "bg-green-500";
    }

    return "bg-green-300";
  };

  return (
    <main
      className="kundli-page w-full md:max-w-7xl flex flex-col sm:p-5 px-2 gap-5 rounded-2xl shadow-lg items-center my-2 text-black"
      aria-label="Chaughadiya Panchang"
    >
      <div className="flex flex-col gap-5 items-center md:w-[95%] w-full sm:pb-8">
        {/* SEO INTRODUCTION */}
        <header className="flex w-full flex-col gap-4 bg-linear-to-r from-pink-100 to-yellow-100 shadow-lg rounded-2xl p-3 sm:p-5">
          <h1 className="text-lg md:text-2xl text-black font-bold text-center">
            Chaughadiya Today - Choghadiya Timings
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-center leading-6 max-w-4xl mx-auto">
            Get today&apos;s Chaughadiya timings for your selected city.
            Check auspicious and inauspicious Choghadiya periods including
            Amrit, Labh, Char, Kaal, Rog and Udveg according to your local
            Panchang.
          </p>
        </header>

        {/* LOCATION AND DATE SEARCH */}
        <section
          aria-labelledby="chaughadiya-search-heading"
          className="w-full"
        >
          <h2 id="chaughadiya-search-heading" className="sr-only">
            Select City and Date for Chaughadiya
          </h2>

          <div
            className="h-40 rounded-2xl flex flex-col sm:flex-row items-center justify-between relative w-full mx-auto py-2 sm:py-10 px-3 md:px-6 bg-cover bg-center"
            style={{
              backgroundImage: "url('/ds-img/cho.jpg')",
            }}
          >
            <div className="flex sm:flex-col w-full justify-between relative items-start text-sm gap-3 font-semibold text-white">
              {/* LOCATION */}
              <span
                className="flex items-center gap-2 text-xs sm:text-base"
                aria-label={`Selected location: ${locationName || "Current location"}`}
              >
                <svg
                  width={18}
                  height={18}
                  viewBox="0 0 640 640"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d="M128 252.6C128 148.4 214 64 320 64C426 64 512 148.4 512 252.6C512 371.9 391.8 514.9 341.6 569.4C329.8 582.2 310.1 582.2 298.3 569.4C248.1 514.9 127.9 371.9 127.9 252.6zM320 320C355.3 320 384 291.3 384 256C384 220.7 355.3 192 320 192C284.7 192 256 220.7 256 256C256 291.3 284.7 320 320 320z" />
                </svg>

                {locationName || "Current Location"}
              </span>

              {/* DATE */}
              <span
                className="flex items-center gap-2 text-xs sm:text-base"
                aria-label={`Selected date: ${formattedDate}`}
              >
                <svg
                  width={18}
                  height={18}
                  viewBox="0 0 640 640"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d="M224 64C206.3 64 192 78.3 192 96L192 128L160 128C124.7 128 96 156.7 96 192L96 240L544 240L544 192C544 156.7 515.3 128 480 128L448 128L448 96C448 78.3 433.7 64 416 64C398.3 64 384 78.3 384 96L384 128L256 128L256 96C256 78.3 241.7 64 224 64zM96 288L96 480C96 515.3 124.7 544 160 544L480 544C515.3 544 544 515.3 544 480L544 288L96 288z" />
                </svg>

                {formattedDate}
              </span>
            </div>

            <form
              onSubmit={handleSearch}
              className="flex sm:flex-col gap-4 z-10 bg-[#0000007b] p-3 rounded-xl items-center"
              aria-label="Chaughadiya search form"
            >
              {/* DATE */}
              <label className="sr-only" htmlFor="chaughadiya-date">
                Select date
              </label>

              <input
                id="chaughadiya-date"
                type="date"
                value={date}
                max={today}
                onChange={(event) => setDate(event.target.value)}
                className="border-gray-200 p-1 bg-white px-3 text-xs sm:text-sm flex-1 rounded-full"
              />

              {/* CITY */}
              <div className="relative flex-1">
                <label className="sr-only" htmlFor="chaughadiya-city">
                  Enter city name
                </label>

                <input
                  id="chaughadiya-city"
                  type="text"
                  value={searchText}
                  onChange={handleInputChange}
                  placeholder="Enter city name"
                  autoComplete="off"
                  className="border-gray-200 p-1 px-3 text-sm w-full rounded-full"
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() =>
                    setTimeout(() => setShowSuggestions(false), 200)
                  }
                />

                {showSuggestions && suggestions?.length > 0 && (
                  <ul
                    className="absolute z-50 bg-white border max-h-48 overflow-auto w-full rounded shadow-md mt-1 text-sm text-black"
                    role="listbox"
                    aria-label="City suggestions"
                  >
                    {suggestions.map((item) => (
                      <li
                        key={item.place_id}
                        role="option"
                        onMouseDown={(event) => {
                          event.preventDefault();
                          handleSuggestionClick(item);
                        }}
                        className="p-2 hover:bg-gray-200 cursor-pointer"
                      >
                        {item.display_name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* SEARCH */}
              <button
                aria-label="Search Chaughadiya timings"
                type="submit"
                className="bg-purple-500 text-white px-4 py-1 text-xs sm:text-sm sm:py-2 rounded-full flex items-center gap-2"
              >
                <svg
                  width={18}
                  height={18}
                  viewBox="0 0 640 640"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d="M480 272C480 317.9 465.1 360.3 440 394.7L566.6 521.4C579.1 533.9 579.1 554.2 566.6 566.7C554.1 579.2 533.8 579.2 521.3 566.7L394.7 440C360.3 465.1 317.9 480 272 480C157.1 480 64 386.9 64 272C64 157.1 157.1 64 272 64C386.9 64 480 157.1 480 272zM272 416C351.5 416 416 351.5 416 272C416 192.5 351.5 128 272 128C192.5 128 128 192.5 128 272C128 351.5 192.5 416 272 416z" />
                </svg>

                Search
              </button>
            </form>
          </div>
        </section>

        {/* CURRENT MUHURTA + DATE NAVIGATION */}
        <section
          aria-labelledby="current-chaughadiya-heading"
          className="flex flex-col gap-3 md:flex-row items-center bg-linear-to-r from-pink-100 to-yellow-100 justify-between py-6 shadow-lg px-1 sm:px-6 mt-2 sm:mt-4 w-full rounded-2xl"
        >
          <div className="flex items-center gap-2">
            <h2
              id="current-chaughadiya-heading"
              className="font-bold"
            >
              Current Chaughadiya:
            </h2>

            <p
              className="px-3 text-xs sm:text-sm py-1 sm:py-2 bg-yellow-300 rounded-2xl shadow-lg font-bold"
              aria-live="polite"
            >
              {getCurrentChaughadiya()}
            </p>
          </div>

          <nav
            aria-label="Chaughadiya date navigation"
            className="flex items-center gap-1"
          >
            <button
              aria-label="View previous day's Chaughadiya"
              onClick={() => changeDate(-1)}
              className="flex items-center gap-1 rounded-l-2xl bg-yellow-300 px-5 py-2 cursor-pointer"
            >
              <svg
                width={18}
                height={18}
                viewBox="0 0 640 640"
                aria-hidden="true"
              >
                <path d="M169.4 297.4C156.9 309.9 156.9 330.2 169.4 342.7L361.4 534.7C373.9 547.2 394.2 547.2 406.7 534.7C419.2 522.2 419.2 501.9 406.7 489.4L237.3 320L406.6 150.6C419.1 138.1 419.1 117.8 406.6 105.3C394.1 92.8 373.8 92.8 361.3 105.3L169.3 297.3z" />
              </svg>

              <span className="text-xs md:text-sm">Previous</span>
            </button>

            <button
              aria-label="View today's Chaughadiya"
              onClick={setToday}
              className="flex items-center gap-1 bg-yellow-300 px-5 py-2 cursor-pointer rounded-lg"
            >
              <span className="text-xs md:text-sm">Current</span>
            </button>

            <button
              aria-label="View next day's Chaughadiya"
              onClick={() => changeDate(1)}
              className="flex items-center gap-1 rounded-r-2xl bg-yellow-300 px-5 py-2 cursor-pointer"
            >
              <span className="text-xs md:text-sm">Next</span>

              <svg
                width={18}
                height={18}
                viewBox="0 0 640 640"
                aria-hidden="true"
              >
                <path d="M471.1 297.4C483.6 309.9 483.6 330.2 471.1 342.7L279.1 534.7C266.6 547.2 246.3 547.2 233.8 534.7C221.3 522.2 221.3 501.9 233.8 489.4L403.2 320L233.9 150.6C221.4 138.1 221.4 117.8 233.9 105.3C246.4 92.8 266.7 92.8 279.2 105.3L471.2 297.3z" />
              </svg>
            </button>
          </nav>
        </section>

        {/* CHOUGADIYA RESULTS */}
        {loading ? (
          <div
            className="w-full py-10 text-center"
            role="status"
            aria-live="polite"
          >
            <p className="animate-pulse">
              Loading Chaughadiya timings...
            </p>
          </div>
        ) : (
          chaughadiyaData && (
            <section
              aria-labelledby="chaughadiya-timings-heading"
              className="flex flex-col items-center justify-center gap-5 md:w-[90%] w-full shadow-lg p-4 rounded-2xl"
            >
              <h2
                id="chaughadiya-timings-heading"
                className="text-xl font-bold text-center"
              >
                Chaughadiya Timings for {formattedDate}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
                {["day", "night"].map((type) => {
                  const timings =
                    chaughadiyaData?.chaughadiya?.[type] || [];

                  return (
                    <section
                      key={type}
                      aria-labelledby={`${type}-chaughadiya-heading`}
                    >
                      <h3
                        id={`${type}-chaughadiya-heading`}
                        className="font-semibold flex items-center justify-center gap-2 my-3"
                      >
                        {type === "day" ? (
                          <svg
                            width={18}
                            height={18}
                            viewBox="0 0 640 640"
                            aria-hidden="true"
                          >
                            <path d="M210.2 53.9C217.6 50.8 226 51.7 232.7 56.1L320.5 114.3L408.3 56.1C415 51.7 423.4 50.9 430.8 53.9C438.2 56.9 443.4 63.5 445 71.3L465.9 174.5L569.1 195.4C576.9 197 583.5 202.4 586.5 209.7C589.5 217 588.7 225.5 584.3 232.2L526.1 320L584.3 407.8C588.7 414.5 589.5 422.9 586.5 430.3C583.5 437.7 576.9 443.1 569.1 444.6L465.8 465.4L445 568.7C443.4 576.5 438 583.1 430.7 586.1C423.4 589.1 414.9 588.3 408.2 583.9L320.4 525.7L232.6 583.9C225.9 588.3 217.5 589.1 210.1 586.1C202.7 583.1 197.3 576.5 195.8 568.7L175 465.4L71.7 444.5C63.9 442.9 57.3 437.5 54.3 430.2C51.3 422.9 52.1 414.4 56.5 407.7L114.7 320L56.5 232.2C52.1 225.5 51.3 217.1 54.3 209.7C57.3 202.3 63.9 196.9 71.7 195.4L175 174.6L195.9 71.3C197.5 63.5 202.9 56.9 210.2 53.9zM239.6 320C239.6 275.6 275.6 239.6 320 239.6C364.4 239.6 400.4 275.6 400.4 320C400.4 364.4 364.4 400.4 320 400.4C275.6 400.4 239.6 364.4 239.6 320zM448.4 320C448.4 249.1 390.9 191.6 320 191.6C249.1 191.6 191.6 249.1 191.6 320C191.6 390.9 249.1 448.4 320 448.4C390.9 448.4 448.4 390.9 448.4 320z" />
                          </svg>
                        ) : (
                          <svg
                            width={18}
                            height={18}
                            viewBox="0 0 640 640"
                            aria-hidden="true"
                          >
                            <path d="M320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576C388.8 576 451.3 548.8 497.3 504.6C504.6 497.6 506.7 486.7 502.6 477.5C498.5 468.3 488.9 462.6 478.8 463.4C473.9 463.8 469 464 464 464C362.4 464 280 381.6 280 280C280 207.9 321.5 145.4 382.1 115.2C391.2 110.7 396.4 100.9 395.2 90.8C394 80.7 386.6 72.5 376.7 70.3C358.4 66.2 339.4 64 320 64z" />
                          </svg>
                        )}

                        {type === "day"
                          ? "Day Chaughadiya"
                          : "Night Chaughadiya"}
                      </h3>

                      {timings.length > 0 ? (
                        timings.map(({ muhurta, time }, index) => {
                          const backgroundClass =
                            getMuhurtaBackground(muhurta);

                          return (
                            <div
                              key={`${muhurta}-${time}-${index}`}
                              className={`grid grid-cols-2 text-sm ${backgroundClass} rounded-xl my-2`}
                              role="group"
                              aria-label={`${muhurta} Chaughadiya from ${time}`}
                            >
                              <p className="px-3 py-2 text-center font-medium">
                                {muhurta}
                              </p>

                              <p className="px-3 py-2 text-center">
                                {time}
                              </p>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-center text-sm py-5">
                          Chaughadiya timings are not available.
                        </p>
                      )}
                    </section>
                  );
                })}
              </div>

              {/* LEGEND */}
              <div className="text-xs flex flex-col gap-3 md:text-sm text-red-400 text-center w-full">
                <div className="flex w-full flex-wrap items-start justify-center gap-5 sm:gap-8">
                  {[
                    {
                      color: "bg-green-500",
                      text: "Amrit",
                    },
                    {
                      color: "bg-green-300",
                      text: "Labh",
                    },
                    {
                      color: "bg-violet-400",
                      text: "Char",
                    },
                    {
                      color: "bg-red-400",
                      text: "Udveg",
                    },
                    {
                      color: "bg-red-500",
                      text: "Kaal, Rog",
                    },
                  ].map((item) => (
                    <div
                      key={item.text}
                      className="flex flex-col items-center gap-1"
                    >
                      <div
                        className={`h-2 w-2 rounded-full ${item.color} shadow-lg sm:h-5 sm:w-5`}
                        aria-hidden="true"
                      />

                      <p className="text-[10px] font-semibold text-gray-700 sm:text-sm">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>

                <p className="text-gray-700 leading-6">
                  <span className="font-semibold">Note:</span>{" "}
                  Chaughadiya timings are based on the selected location and
                  date. Timings are displayed in local time. In the traditional
                  Panchang system, the day is calculated from sunrise to sunset
                  and the night follows sunset.
                </p>
              </div>
            </section>
          )
        )}

        {/* SEO CONTENT */}
        <section
          aria-labelledby="about-chaughadiya-heading"
          className="w-full md:w-[90%] bg-white rounded-2xl shadow-lg p-5 sm:p-7"
        >
          <h2
            id="about-chaughadiya-heading"
            className="text-lg sm:text-xl font-bold mb-4"
          >
            What is Chaughadiya?
          </h2>

          <div className="space-y-4 text-sm sm:text-base leading-7 text-gray-700">
            <p>
              Chaughadiya, also known as Choghadiya, is a traditional Hindu
              Panchang system used to divide the day and night into different
              time periods. Each period is associated with a particular
              Muhurta such as Amrit, Labh, Char, Kaal, Rog or Udveg.
            </p>

            <p>
              Chaughadiya timings vary according to the location and date
              because they are calculated using local sunrise and sunset
              timings. Select your city and date above to check the
              corresponding Chaughadiya timings.
            </p>

            <p>
              People traditionally refer to Chaughadiya when planning
              activities according to Panchang-based Muhurta. The timings
              displayed on this page are provided for the selected location
              and date.
            </p>
          </div>
        </section>
      </div>

      {/* ABHIJIT MUHURTA */}
      <section className="w-full" aria-label="Abhijit Muhurta">
        <AbhijitPage
          inputParams={getParams(date)}
          initialPanchang={initialPanchang}
        />
      </section>
    </main>
  );
}
