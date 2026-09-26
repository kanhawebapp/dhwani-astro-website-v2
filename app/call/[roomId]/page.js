
"use client";

import React, { Suspense } from 'react';
import CallPage from "../../astrologer/CallPage";

export default function page() {
  return (
    <div>
      <Suspense fallback={<div>Loading chat...</div>}>
        <CallPage />
      </Suspense>
    </div>
  );
}

