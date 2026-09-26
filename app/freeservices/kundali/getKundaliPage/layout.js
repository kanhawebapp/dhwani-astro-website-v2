// app/inKundli/getKundlipage/layout.jsx
import { Suspense } from "react";
import KundliLayout from "@/components/Custom/KundliLayout";
export default function Layout({ children }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <KundliLayout>{children}</KundliLayout>
    </Suspense>
  );
}
