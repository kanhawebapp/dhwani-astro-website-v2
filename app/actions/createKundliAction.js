"use server";

import { redirect } from "next/navigation";
import {
  createKundliHash,
  createNumeroHash,
} from "@/utils/kundliHash";
import { saveKundli } from "@/lib/kundliStore";

export async function createKundliAction(formData) {
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

  const slug = formData.get("slug");

  // =========================================
  // NUMEROLOGY
  // =========================================
  if (slug === "numerokundali") {
    const numeroHash = createNumeroHash({
      name: payload.name,
      day: payload.day,
      month: payload.month,
      year: payload.year,
    });

    if (!numeroHash) {
      throw new Error("Failed to create Numero hash");
    }

    redirect(
      `/freeservices/kundali/getKundaliPage/numerokundli?hash=${numeroHash}&source=form`
    );
  }

  // =========================================
  // NORMAL KUNDLI
  // =========================================

  if (Number.isNaN(payload.lat) || Number.isNaN(payload.lon)) {
    throw new Error("Invalid form submission");
  }

  const hash = createKundliHash(payload);

  if (!hash) {
    throw new Error("Failed to create Kundli hash");
  }

  await saveKundli(hash, payload);

  redirect(`/formpage/formresult/${slug}?hash=${hash}`);
}