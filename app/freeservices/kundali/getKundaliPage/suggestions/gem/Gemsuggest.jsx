"use client";
import { useGetGemSuggestionQuery } from "@/app/redux/services/astrologyAPI";
export default function Gemsuggest({ formData }) {
  const skip = !formData;

  const {
    data: gemData,
    isLoading,
    error,
  } = useGetGemSuggestionQuery(formData, { skip });

  if (isLoading) {
    return (
      <div className="flex justify-center flex-col gap-4 items-center h-32">
        <span className="loader-all"></span>
        <span className="text-purple-600 font-medium">
          Loading Gemstone Suggestions...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-center text-red-500">
        Failed to load gemstone suggestions.
      </p>
    );
  }

  if (!gemData) {
    return (
      <p className="text-center text-red-500">
        No gemstone suggestions available.
      </p>
    );
  }
  return (
    <div className="text-black w-full flex flex-col gap-2 sm:gap-5 border border-purple-100 rounded-2xl px-4 py-3 shadow-md">
      <span className="text-center font-semibold  sm:text-2xl text-purple-700">
        Gemstone Suggestions
      </span>

      <p className="text-center text-[12px] sm:text-sm text-gray-700">
        Gemstones hold unique energies that influence life, health, and destiny.
        Based on your kundli, the following gemstones are recommended.
      </p>

      <section className="flex flex-col gap-5">
        {Object.entries(gemData).map(([type, details], index) => (
          <div
            key={index}
            className="border border-purple-200 bg-purple-100 rounded-2xl shadow-md px-4 py-2 sm:p-4"
          >
            <h3 className="sm:text-xl text-sm font-semibold text-purple-600 mb-2">
              {type} Gem: {details.name}
            </h3>

            <ul className="grid grid-cols-1 md:grid-cols-2  gap-2 sm:gap-3 text-xs sm:text-sm">
              <li><b>Semi-precious:</b> {details.semi_gem}</li>
              <li><b>Finger:</b> {details.wear_finger}</li>
              <li><b>Weight (carat):</b> {details.weight_caret}</li>
              <li><b>Metal:</b> {details.wear_metal}</li>
              <li><b>Day to Wear:</b> {details.wear_day}</li>
              <li><b>Deity:</b> {details.gem_deity}</li>
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
}
