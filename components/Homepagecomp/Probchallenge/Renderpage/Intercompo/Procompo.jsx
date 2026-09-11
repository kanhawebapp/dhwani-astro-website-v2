"use client";

// import Freereport from "@/components/Smcompo/Freereport";
import Image from "next/image";

import Link from "next/link";

export default function Procompo({ data, heading }) {

    return (
        <>

            <div className="flex flex-col items-center gap-2">
                <h1 className="relative text-[#2f1254] text-md sm:text-2xl py-1  sm:py-2 text-center font-semibold" dangerouslySetInnerHTML={{ __html: heading }}>

                </h1>

                <div className="love-product-new grid md:grid-cols-4 grid-cols-2 gap-4 ">
                    {data.map((card, index) => (
                        <Link
                            key={index} target="-"
                            href={card.href}
                            className="max-w-xs overflow-hidden  bg-gray-50 rounded-xl"
                        >
                            <div className="relative rounded-lg overflow-hidden w-full md:h-64 h-40">
                                <Image
                                    src={card.srcc}
                                    alt="Puja for Relationship Problems"
                                    fill
                                    className="object-cover" />
                            </div>
                            <div className="p-2 py-3 flex flex-col gap-1">
                                <h3 className="text-xs text-center md:text-sm font-semibold  text-gray-800 truncate">
                                    {card.nm}
                                </h3>
                                <span className="text-white  self-center items-center w-fit  bg-purple-400 rounded-full px-4 py-0 tracking-widest font-light text-xs ">Click to know more...</span>
                                {/* <div className="mt-1 flex items-center space-x-2">
                                <span className="line-through text-gray-400 md:text-sm text-xs">
                                    {card.old}
                                </span>
                                <span className="md:text-lg text-sm font-semibold text-black">
                                    {card.pr}
                                </span>
                                <span className="bg-purple-100 text-purple-700 md:text-xs text-[10px]  font-semibold px-2 py-0.5 rounded">
                                    {card.off}
                                </span>
                            </div> */}
                            </div>
                        </Link>
                    ))}

                </div>

            </div>
            {/* <Freereport /> */}
        </>
    );
}