"use server";

import { redirect } from "next/navigation";
import { createKundliHash } from "@/utils/kundliHash";
import { saveKundli } from "@/lib/kundliStore";

export async function createKundliFromMain(formData) {
  const payload = {
    name: formData.get("name"),
    day: Number(formData.get("day")),
    month: Number(formData.get("month")),
    year: Number(formData.get("year")),
    hour: Number(formData.get("hour")),
    min: Number(formData.get("min")),
    lat: Number(formData.get("lat")),
    lon: Number(formData.get("lon")),
    tzone: Number(formData.get("tzone")),
    birthplace: formData.get("birthplace"),
  };
  console.log("SERVER ACTION PAYLOAD", payload);
  const hash = createKundliHash(payload);
if (!hash) {
  throw new Error("Failed to create Kundli hash");
}
   saveKundli(hash, payload);

redirect(
  `/freeservices/kundali/getKundaliPage?hash=${hash}`
);
}
