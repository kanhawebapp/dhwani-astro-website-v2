"use client";

import { useParams } from "next/navigation";
import RequestForm from "../../RequestForm";

export default function Page() {
  const { mode, id } = useParams();

  return <RequestForm mode={mode} astroId={id} />;
}