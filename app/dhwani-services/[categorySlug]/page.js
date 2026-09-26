import CategoryServices from "../../../components/navbarcomp/CategoriesServices";

export default function Page({ params }) {
  return (
    <CategoryServices
      categorySlug={params.categorySlug}
    />
  );
}