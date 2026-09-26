import Kuninter from "@/components/Kundli/Kundliinter/Kuninter";
import { Suspense } from "react";


export default function getKundlipage() {
  return (
    <Suspense>
      <Kuninter />
    </Suspense>
  );
}
