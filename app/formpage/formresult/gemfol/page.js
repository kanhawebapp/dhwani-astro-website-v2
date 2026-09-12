import { decodeKundliHash } from "@/utils/kundliHash";
import Gemsuggest from "../../../freeservices/kundali/getKundaliPage/suggestions/gem/Gemsuggest";

export default function Page({ searchParams }) {
  const hash = searchParams.hash;

  if (!hash) {
    return <p className="text-center">Missing Kundli data</p>;
  }

  const formData = decodeKundliHash(hash);
  

  if (!formData) {
    return <p className="text-center">Invalid or expired link</p>;
  }

  return <Gemsuggest formData={formData} />;
}