
import ProfileAstro from "./ProfileAstro";

export default async function Page({ params }) {
  const { id } = await params;

  return <ProfileAstro astrologerId={id} />;
}
