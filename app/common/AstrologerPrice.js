"use client";

import React from "react";
import { gql } from "@apollo/client";

const ME_QUERY = gql`
  query Me {
    me {
      id
    }
  }
`;

function AstrologerPrice({ mode, astro }) {
  const pricing = astro?.pricing?.find((p) => p.type === mode?.toUpperCase());

  if (!pricing) return null;

  const currentPrice = pricing.price ?? 0;

  const originalPrice = pricing.offerPrice || currentPrice;

  return (
    <>
      <span className="flex items-center justify-center gap-3 text-sm font-semibold text-red-500 sm:text-lg">
        {Number(currentPrice || 0) === 0 ? "Free" : `₹${currentPrice}`}
      </span>

      <span className="text-sm font-semibold text-black line-through">
        ₹{originalPrice}/min
      </span>
    </>
  );
}

export default React.memo(AstrologerPrice);
