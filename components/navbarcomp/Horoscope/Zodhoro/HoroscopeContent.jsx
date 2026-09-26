"use client";

import Image from "next/image";

const categories = [
  {
    id: 0,
    name: "Personal Life",
    icon: "/ds-img/user2.png",
    key: "personal_life",
  },
  {
    id: 1,
    name: "Professional Life",
    icon: "/ds-img/handshake.png",
    key: "profession",
  },
  {
    id: 2,
    name: "Health",
    icon: "/ds-img/healthcare.png",
    key: "health",
  },
  {
    id: 3,
    name: "Travel",
    icon: "/ds-img/airplane.png",
    key: "travel",
  },
  {
    id: 4,
    name: "Luck",
    icon: "/ds-img/fingers.png",
    key: "luck",
  },
  {
    id: 5,
    name: "Emotions",
    icon: "/ds-img/emotional.png",
    key: "emotions",
  },
];

export default function HoroscopeContent({ data }) {
  return (
    <div className="zod-life-det mt-4 space-y-4 text-black">
      {categories.map((category) => (
        <div
          key={category.id}
          className="rounded-2xl border-2 border-violet-200 p-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <Image
              src={category.icon}
              alt={category.name}
              width={28}
              height={28}
            />

            <h3 className="text-sm md:text-base font-semibold">
              {category.name}
            </h3>
          </div>

          <p className="text-xs md:text-sm leading-relaxed">
            {data?.prediction?.[category.key] ??
              "No prediction available."}
          </p>
        </div>
      ))}
    </div>
  );
}