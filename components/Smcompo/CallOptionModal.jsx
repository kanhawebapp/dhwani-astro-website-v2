'use client'
import Image from "next/image";
import React from "react";

export default function CallOptionModal({ isOpen, onClose, onSelect }) {


  return (
    <div className=" inset-0 z-50 bg-[#59456565] bg-opacity-50 flex justify-center items-center w-full h-[60vh] ">
      <div className="bg-[#ffffff62] rounded-2xl shadow-lg w-14/15 max-w-2xl p-6 h-[60%] relative">
        <button aria-label="Close Call Option Modal"
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-xl"
        >
          &times;
        </button>

        <h2 className="text-xl font-bold text-center text-purple-700 mb-6">
          Choose Call Method
        </h2>

        <div className="grid grid-cols-2 justify-around gap-10 px-5">
          <button aria-label="Select Web Call"
            onClick={() => onSelect("web")}
            className="flex flex-col hover:scale-102  cursor-pointer items-center p-5 bg-linear-to-r from-purple-500 via-purple-300 to-purple-500 hover:bg-purple-200 rounded-xl shadow-xl transition"
          >
            <Image width={100} height={100} 
              src="/prblm/video-conference.gif"
              alt="Web Call"
              className="w-16 h-16 mb-2 rounded-lg"
            />
            <span className="text-purple-800 text-xl font-bold">Web Call</span>
          </button>

          <button aria-label="Select Mobile Call"
            onClick={() => onSelect("mobile")}
            className="flex flex-col items-center hover:scale-102 cursor-pointer p-5 bg-linear-to-r from-purple-500 via-purple-300 to-purple-500 hover:bg-purple-200 rounded-xl shadow-md transition"
          >
             <Image width={100} height={100} 
              src="/prblm/phone-contact.gif"
              alt="Mobile Call"
              className="w-16 h-16 mb-2 rounded-lg"
            />
            <span className="text-purple-800 text-xl font-bold">Mobile Call</span>
          </button>
        </div>
      </div>
    </div>
  );
}
