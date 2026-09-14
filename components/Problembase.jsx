import { print } from "graphql";
import { GET_CATEGORY } from "@/app/graphql/gqlQuery";
import ProblembaseClient from "../components/Custom/ProblembaseClient"
async function getConsultationServices() {
  const res = await fetch("https://dhwaniastro.com/userAuth/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: print(GET_CATEGORY),
      variables: {
        slug: "consultation",
      },
    }),
    next: {
      revalidate: 3600,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch consultation services");
  }

  const json = await res.json();


  return json.data?.getCategory?.services || [];
}

export default async function Page() {
  const services = await getConsultationServices();

  return <ProblembaseClient services={services} />;
}