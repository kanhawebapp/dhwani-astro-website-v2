import axios from "axios";
const graphqlEndpoint = process.env.NEXT_PUBLIC_GRAPHQL_URL;
export const graphQLClient = async (query, variables = {}) => {
  const response = await axios.post(
    graphqlEndpoint,
    { query, variables },
    { headers: { "Content-Type": "application/json" } },
  );
  return response.data;
};
