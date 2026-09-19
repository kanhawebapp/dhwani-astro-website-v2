"use client";
import { useRouter, useParams } from "next/navigation";
import { Healdata } from "./Healcompo/healdata";
import Link from "next/link";
import Image from "next/image";
import CustomButton from "../Custom/CustomButton";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function Selectastro({ open, astrologers, onSelect, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative bg-white rounded-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto p-4">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 flex items-center justify-center w-4 h-4 text-xs sm:text-md sm:w-8 sm:h-8 rounded-full bg-red-500 text-white hover:bg-red-600"
        >
          ✕
        </button>

        <h2 className="text-sm sm:text-xl font-bold text-center mb-5">
          Select Astrologer
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4  gap-2 sm:gap-4">
          {astrologers?.map((mapping) => {
            const astro = mapping.astrologer;

            return (
              <div
                key={astro.id}
                className="bg-[#e0e5ec8d] rounded-lg sm:p-2 shadow-lg"
              >
                <div className="bg-white flex flex-col pt-3 border border-purple-50 rounded-lg justify-center p-3">

                  <div className="sm:w-1/3 place-self-center">
                    <div className="relative rounded-full  overflow-hidden">
                      <Image
                        src={
                          astro?.profilePic
                            ? `${BASE_URL}${astro.profilePic}`
                            : "/defaultastro.png"
                        }
                        alt={astro.name}
                        width={100}
                        height={100}
                        className="rounded-full w-15 sm:w-22 h-auto bg-center object-cover"
                      />
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col items-center text-center">
                    <h6 className="text-xs sm:text-md font-semibold text-black mb-1">
                      {astro.displayName}
                    </h6>

                    <p className="text-sm mb-1">
                      <span className="block text-white text-[10px] sm:text-md p-1 rounded-lg truncate bg-[linear-gradient(to_right,_#a65ed6cf_54%,_#ba38cbbb_100%)]">
                        {astro.skills?.join(", ")}
                      </span>

                      <span className="inline-block mt-1 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-lg text-[10px] sm:text-md">
                        {astro.languages?.join(", ")}
                      </span>
                    </p>

                    <div className="w-full flex flex-col space-y-1">
                      <div className="flex justify-between text-[10px] sm:text-md">
                        <span>⭐ {astro.rating || 0}</span>
                        <span>{astro.experience} Years</span>
                      </div>
                      <p className="text-green-600 text-[10px] sm:text-md font-semibold sm:mt-2">
                        ₹ {mapping.price} / Session
                      </p>

                      <CustomButton 
                      className="text-xs sm:text-sm px-2 py-1 rounded-full bg-green-500 text-white"
                        onClick={() => onSelect(mapping)}
                       
                      >
                        Select
                      </CustomButton>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}

        </div>
      </div>
    </div>
  );
}
