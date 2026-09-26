"use client";

import Doshas from "@/components/Kundli/Kundliinter/Kundlidosha/Doshas";
import { useSearchParams } from "next/navigation";

export default function DoshasClient({
  manglikData,
  kalSharpData,
  pitraDoshaData,
  satiData,
}) {
  if (!manglikData && !kalSharpData && !pitraDoshaData && !satiData) {
    return <p className="text-center text-gray-400">No Dosha data available</p>;
  }
const searchParams = useSearchParams();

const hash = searchParams.get("hash");
  return (
    <Doshas
      hash={hash}
      manglikData={manglikData}
      kalSharpData={kalSharpData}
      pitraDoshaData={pitraDoshaData}
      satiData={satiData}
    />
  );
}
