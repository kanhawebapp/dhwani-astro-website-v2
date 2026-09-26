"use client";

import { usePathname } from "next/navigation";
import Footerlinks from "@/components/Footerlinks";
import CookieConsent from "@/components/cookieConsent";


export default function LayoutWrapper({ children }) {
  const pathname = usePathname();

const hideGlobalHeader =
  pathname.startsWith("/chat-with-astrologer") ||
  pathname.startsWith("/call") ;


  return (
    <>
      <main
        className={
          hideGlobalHeader
            ? "w-screen h-screen"
            : "flex justify-center w-full pt-11 lg:pt-37 md:pt-37"
        }
      >
        {children}
        <div id="modal-root" />
      
      </main>

      {!hideGlobalHeader && (
        <>
          <CookieConsent />
          <Footerlinks />
        </>
      )}
    </>
  );
}