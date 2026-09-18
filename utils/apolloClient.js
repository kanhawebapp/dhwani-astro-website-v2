"use client";

import { ApolloClient, InMemoryCache, from } from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import UploadHttpLink from "apollo-upload-client/UploadHttpLink.mjs";

/* =========================
BASE URL
========================= */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const GRAPHQL_URL = `${BASE_URL}/userAuth/graphql`;

/* =========================
UPLOAD LINK
========================= */

const uploadLink = new UploadHttpLink({
  uri: GRAPHQL_URL,
  credentials: "include",
  headers: {
    "apollo-require-preflight": "true",
  },
});

/* =========================
TOKEN REFRESH LOGIC
========================= */

let isRefreshing = false;
let pendingRequests = [];

const resolvePendingRequests = () => {
  pendingRequests.forEach((callback) => callback());
  pendingRequests = [];
};

const errorLink = onError(({ graphQLErrors, operation, forward }) => {
  if (!graphQLErrors) return;

  for (const err of graphQLErrors) {
    if (
      err.message === "Unauthorized" ||
      err.extensions?.code === "UNAUTHENTICATED"
    ) {
      if (!isRefreshing) {
        isRefreshing = true;

        return new Promise((resolve, reject) => {
          fetch(GRAPHQL_URL, {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              query: `
                mutation RefreshToken {
                  refreshToken {
                    accessToken
                  }
                }
              `,
            }),
          })
            .then((res) => res.json())
            .then((result) => {
              if (!result?.data?.refreshToken) {
                throw new Error("Refresh failed");
              }

              isRefreshing = false;
              resolvePendingRequests();

              resolve(forward(operation));
            })
            .catch((err) => {
              console.error("Refresh token failed:", err);

              isRefreshing = false;
              pendingRequests = [];

              reject(err);
            });
        });
      }

      return new Promise((resolve) => {
        pendingRequests.push(() => {
          resolve(forward(operation));
        });
      });
    }
  }
});

/* =========================
APOLLO CLIENT
========================= */

const client = new ApolloClient({
  link: from([errorLink, uploadLink]),
  cache: new InMemoryCache(),
  connectToDevTools: process.env.NODE_ENV === "development",
});

export default client;