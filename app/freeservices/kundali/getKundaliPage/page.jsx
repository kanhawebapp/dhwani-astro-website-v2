import Kuninter from "@/components/Kundli/Kundliinter/Kuninter";
import { Suspense } from "react";

import JsonLd from "@/components/seo/JsonLd";
import { createBreadcrumbSchema } from "@/utils/schema";

const breadcrumbSchema = createBreadcrumbSchema([
  {
    name: "Home",
    url: "https://dhwaniastro.com/",
  },
  {
    name: "Free Services",
    url: "https://dhwaniastro.com/freeservices",
  },
  {
    name: "Kundli",
    url: "https://dhwaniastro.com/freeservices/kundali",
  },
  {
    name: "Get Kundli",
    url: "https://dhwaniastro.com/freeservices/kundali/getKundaliPage",
  },
]);

export default function GetKundliPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema} />

      <Suspense fallback={<div>Loading...</div>}>
        <Kuninter />
      </Suspense>
    </>
  );
}
