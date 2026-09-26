import Heal from "@/components/Healing/Healcompo/Index";

export default async function Page({ params }) {
  const { categorySlug, serviceSlug } = await params;

  return (
    <Heal
      categorySlug={categorySlug}
      serviceSlug={serviceSlug}
    />
  );
}